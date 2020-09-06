import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Fab,
  Container,
  InputAdornment,
  Typography,
  TextField,
  Divider,
  Box,
  Tab,
  Tabs,
  IconButton,
} from '@material-ui/core';

import Pagination from '@material-ui/lab/Pagination';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDna, faChartNetwork, faUser, faCut } from '@fortawesome/pro-solid-svg-icons';

import TypeChip from '../Chip/TypeChip';

import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { getSearchAutocomplete } from '../../redux/actions/search';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}>
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
  },
  tabs: {
    marginTop: '1em',
    height: '250px',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const DrawerSearch = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [searchContent, setSearchContent] = useState('');
  const [typing, setTyping] = useState(false);
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
  const alltypes = [
    { label: 'All', type: '', color: 'gray', icon: faSearch },
    { label: 'Gene', type: 'gene', color: '#e07a5f', icon: faDna },
    { label: 'HPO', type: 'phenotype', color: '#81b29a', icon: faChartNetwork },
    { label: 'Patient', type: 'patient', color: '#f2cc8f', icon: faUser },
    { label: 'Variant', type: 'variant', color: '#3d405b', icon: faCut },
  ];

  const { data, loaded } = useSelector((state) => ({
    data: state.Search.data,
    loaded: state.Search.loaded,
  }));

  const classes = useStyles();
  const [type, setType] = React.useState(0);

  const handleTypeChange = (event, newType) => {
    setType(newType);
  };

  useEffect(() => {
    if (searchContent !== '') autocomplete(searchContent);
  }, [type]);

  const handleSearchChange = (event) => {
    setSearchContent(event.target.value);
  };

  useEffect(() => {
    setTyping(true);
    const timeout = setTimeout(() => {
      if (searchContent !== '') autocomplete(searchContent);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchContent]);

  const autocomplete = (searchText) => {
    setTyping(false);
    setPage(1);
    dispatch(getSearchAutocomplete({ query: searchText, query_type: alltypes[type].type }));
  };

  const handleClose = () => {
    props.onRequestClose();
  };

  const [page, setPage] = React.useState(1);
  const handlePageChange = (event, page) => {
    setPage(page);
  };

  return (
    <Fragment>
      <Container maxWidth="lg" className="py-2">
        <div className="d-flex justify-content-between">
          <div className="text-black">
            <h2 className="display-3 font-weight-bold">
              Search{' '}
              <strong style={{ color: alltypes[type].color }}> {alltypes[type].label} </strong>
            </h2>
            <p className="font-size-md text-black-50">{t('Search.subtitle')}</p>
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
                  <IconButton style={{ color: alltypes[type].color }}>
                    <FontAwesomeIcon icon={alltypes[type].icon} />
                  </IconButton>
                  {/* <SearchIcon className="app-search-icon" /> */}
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </div>
      <Container maxWidth="lg" className="py-0" style={{ borderBottom: '1px solid lightgrey' }}>
        <Typography component="div">
          <Box className="search-example" fontWeight="fontWeightLight" m={1}>
            {t('Search.Example')}:
            {examples.map((item, index) => {
              return (
                <span key={index} onClick={handleClose}>
                  <TypeChip
                    size="small"
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
        <div className={classes.root}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            indicatorColor="primary"
            // textColor="black"
            value={type}
            onChange={handleTypeChange}
            aria-label="Vertical tabs example"
            className={classes.tabs}>
            {alltypes.map((item, index) => {
              return (
                <Tab
                  style={{ color: item.color, fontWeight: '900' }}
                  key={index}
                  label={item.label}
                  {...a11yProps(index)}
                />
              );
            })}
          </Tabs>
          <TabPanel style={{ width: '100%' }}>
            <div
              className={clsx('no-search-results', 'search-container', {
                'search-results-hidden': searchContent !== '',
              })}>
              <div>
                <div className="text-warning font-weight-bold font-size-xl">
                  {t('AppBar.NavSearch.NoContent')}
                </div>
              </div>
            </div>
            <div
              className={clsx({
                'search-results-hidden': searchContent === '',
              })}>
              <Grid container direction="column" justify="space-between" alignItems="center">
                <Grid item xs={12}>
                  <Pagination
                    count={Math.ceil(data.length / 20)}
                    size="small"
                    showFirstButton
                    showLastButton
                    color="primary"
                    page={page}
                    onChange={handlePageChange}
                  />
                </Grid>
                <Grid item xs={12} container justify="center">
                  <div className="text-black py-4">
                    {!loaded | typing ? (
                      <div>
                        <p className="text-black-50 font-size-lg">
                          {t('AppBar.NavSearch.Searching')}{' '}
                          <b className="text-black">{searchContent}</b>
                        </p>
                        <Divider />
                      </div>
                    ) : data !== null ? (
                      data.length > 0 ? (
                        <div style={{ textAlign: 'center' }}>
                          {data.slice((page - 1) * 20, page * 20).map((item, index) => {
                            return (
                              <TypeChip
                                key={index}
                                size="middle"
                                label={item.split('::')[1]}
                                type={item.split('::')[0]}
                                action="forward"
                                popover={true}
                                emit={true}
                                to={'/' + item.split('::')[0] + '/' + item.split('::')[2]}
                                onClick={handleClose}
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
              </Grid>
            </div>
          </TabPanel>
        </div>
      </Container>
    </Fragment>
  );
};
export default DrawerSearch;
