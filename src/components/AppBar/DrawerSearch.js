import React, { Fragment, useEffect, useState } from 'react';
import {
  Grid,
  Fab,
  Container,
  InputAdornment,
  Typography,
  TextField,
  Divider,
  Box,
} from '@material-ui/core';

import TypeChip from '../Chip/TypeChip';

import SearchIcon from '@material-ui/icons/Search';
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { getSearchAutocomplete, clearSearchBest } from '../../redux/actions/search';
import { setSnack } from '../../redux/actions/snacks';
import { useHistory } from 'react-router-dom';

const DrawerSearch = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const [searchContent, setSearchContent] = useState('');

  const { data, loading, best, error } = useSelector((state) => ({
    data: state.Search.data,
    loading: state.Search.loading,
    best: state.Search.best.redirect,
  }));

  useEffect(() => {
    if (best) {
      redirectTo();
    }
    if (error) {
      dispatch(setSnack(error, 'error'));
    }
  }, [data, loading, best, error, dispatch, history]);

  const redirectTo = () => {
    history.push(best);
    props.onRequestClose();
    dispatch(clearSearchBest());
  };

  const examples = [
    { name: 'TTLL5', type: 'gene', to: '/gene/ENSG00000119685' },
    { name: 'Abnormality of the eye', type: 'phenotype', to: '/hpo/HP:0000478' },
    {
      name: 'PH00008258',
      type: 'patient',
      to: '/individual/PH00008258',
    },
    {
      name: '14-76156575-A-G',
      type: 'variant',
      to: '/variant/14-76156575-A-G',
    },
  ];

  const handleSearchChange = (event) => {
    setSearchContent(event.target.value);
    changeName(event);
  };

  const changeName = (event) => {
    let searchText = event.target.value; // this is the search text
    setTimeout(() => {
      if (searchText !== '') {
        autocomplete(searchText);
      }
    }, 500);
  };

  const autocomplete = (searchText) => {
    dispatch(getSearchAutocomplete(searchText));
  };

  const handleClose = () => {
    props.onRequestClose();
  };

  return (
    <Fragment>
      <Container maxWidth="lg" className="py-2">
        <div className="d-flex justify-content-between">
          <div className="text-black">
            <h1 className="display-2 mb-1 font-weight-bold">{t('Search.title')}</h1>
            <p className="font-size-lg text-black-50">{t('Search.subtitle')}</p>
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <Fab onClick={handleClose} size="medium" color="primary">
              <CloseTwoToneIcon />
            </Fab>
          </div>
        </div>
      </Container>
      <div className="app-search-wrapper">
        <Container maxWidth="lg">
          <TextField
            className="app-search-input"
            fullWidth
            autoFocus
            value={searchContent}
            onChange={(event) => handleSearchChange(event)}
            inputProps={{ 'aria-label': 'search' }}
            label="Search…"
            placeholder={t('AppBar.NavSearch.InputPlaceHolder')}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="app-search-icon" />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </div>
      <Container maxWidth="lg" className="py-2" style={{ borderBottom: '1px solid lightgrey' }}>
        <Typography component="div">
          <Box className="search-example" fontWeight="fontWeightLight" m={2}>
            {t('Search.Example')}:
            {examples.map((item, index) => {
              return (
                <span key={index} onClick={handleClose}>
                  <TypeChip
                    size="large"
                    label={item.name}
                    type={item.type}
                    action="forward"
                    popover={true}
                    to={item.to}
                  />
                  &bull;
                </span>
              );
            })}
          </Box>
        </Typography>
      </Container>
      <Container maxWidth="lg" className="pb-3">
        <div
          className={clsx('no-search-results', {
            'search-results-hidden': searchContent !== '',
          })}>
          <div>
            <div className="text-warning font-weight-bold font-size-xl">
              {t('AppBar.NavSearch.NoContent')}
            </div>
          </div>
        </div>
        <div
          className={clsx('no-search-results', {
            'search-results-hidden': searchContent === '',
          })}>
          <Grid container justify="center">
            <div className="text-black py-4">
              {loading === true ? (
                <div>
                  <p className="text-black-50 font-size-lg">
                    {t('AppBar.NavSearch.Searching')} <b className="text-black">{searchContent}</b>
                  </p>
                  <Divider />
                </div>
              ) : data !== null ? (
                data.length > 0 ? (
                  <div>
                    {data.map((item, index) => {
                      return (
                        <TypeChip
                          size="large"
                          label={item.split(':')[1]}
                          type={item.split(':')[0]}
                          action="guess"
                          to={item}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-warning font-weight-bold font-size-xl">
                    {t('AppBar.NavSearch.NoOption')}
                  </div>
                )
              ) : (
                <div className="text-warning font-weight-bold font-size-xl">
                  {t('AppBar.NavSearch.NoContent')}
                </div>
              )}
            </div>
          </Grid>
        </div>
      </Container>
    </Fragment>
  );
};
export default DrawerSearch;
