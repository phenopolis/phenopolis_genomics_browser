import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { fade, withStyles } from '@material-ui/core/styles';
import {
  Grid,
  Fab,
  Container,
  InputAdornment,
  Chip,
  Typography,
  TextField,
  Divider,
  Box
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import CloseTwoToneIcon from '@material-ui/icons/CloseTwoTone';

import { connect } from 'react-redux';
import compose from 'recompose/compose';

import { setSnack } from '../../redux/actions'

import clsx from 'clsx';

import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

class DrawerSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchContent: '',
      redirect: false,
      guesslink: '',
      autoCompleteContent: null,
      searchLoaded: false,
      examples: [
        { name: 'TTLL5', type: '(Gene)', to: '/gene/ENSG00000119685' },
        { name: 'Abnormality of the eye', type: '(HPO Phenotype)', to: '/hpo/HP:0000478' },
        {
          name: 'PH00008258',
          type: '(Patient)',
          to: '/individual/PH00008258'
        },
        {
          name: '22-38212762-A-G',
          type: '(Variant)',
          to: '/variant/22-38212762-A-G'
        }
      ]
    };
  }

  handleSearch = (event, guess) => {
    event.preventDefault();

    var guessText = guess
    if (guessText === 'default') {
      guessText = this.state.searchContent
    }

    axios
      .get('/api/best_guess/' + guessText, { withCredentials: true })
      .then(res => {
        this.setState({ redirect: true, guesslink: res.data.redirect });
        this.handleClose()
      })
      .catch(err => {
        this.props.setSnack(i18next.t('AppBar.NavSearch.Best_Guess_Failed'), 'error')
      });
  };

  handleSearchChange = (event) => {
    this.setState({ searchContent: event.target.value });
    this.changeName(event);
  }

  changeName = (event) => {
    var searchText = event.target.value; // this is the search text

    let self = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (searchText !== '') {
        self.autocomplete(searchText);
      } else {
        self.setState({ autoCompleteContent: null, searchLoaded: false });
      }
    }, 500);
  };

  autocomplete = (searchText) => {
    this.setState({ autoCompleteContent: null, searchLoaded: true });
    let self = this;
    axios
      .get('/api/autocomplete/' + searchText, { withCredentials: true })
      .then((res) => {
        self.setState({ autoCompleteContent: res.data, searchLoaded: false });
      })
      .catch((err) => {
        this.props.setSnack(i18next.t('AppBar.NavSearch.Autocomplete_Failed'), 'error')
      });
  };

  handleClose = () => {
    // this.setState({ searchContent: '', searchLoaded: false, autoCompleteContent: null }, () => {
    //   this.props.onRequestClose()
    // })
    this.props.onRequestClose()
  }


  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;

    if (this.state.redirect) {
      return <Redirect to={this.state.guesslink} />;
    }

    return (
      <Fragment>
        <Container maxWidth="lg" className="py-2">
          <div className="d-flex justify-content-between">
            <div className="text-black">
              <h1 className="display-2 mb-1 font-weight-bold">{t("Search.title")}</h1>
              <p className="font-size-lg text-black-50">
                {t("Search.subtitle")}

              </p>
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <Fab
                onClick={this.handleClose}
                size="medium"
                color="primary">
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
              value={this.state.searchContent}
              onChange={event => this.handleSearchChange(event)}
              inputProps={{ 'aria-label': 'search' }}
              label="Search…"
              placeholder={t('AppBar.NavSearch.InputPlaceHolder')}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="app-search-icon" />
                  </InputAdornment>
                )
              }}
            />
          </Container>
        </div>
        <Container maxWidth="lg" className="py-2">
          <Typography component='div'>
            <Box
              className={classes.example}
              fontWeight='fontWeightLight'
              m={2}>
              {t('Search.Example')}:
                  {this.state.examples.map((item, index) => {
                return (
                  <span key={index} onClick={this.handleClose}>
                    <Link className={classes.link} to={item.to}>
                      {item.name + item.type}
                    </Link>
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
              'search-results-hidden': this.state.searchContent !== ''
            })}>
            <div>
              <div className="text-warning font-weight-bold font-size-xl">
                {t('AppBar.NavSearch.NoContent')}
              </div>
              {/* <p className="mb-0 font-size-lg text-black-50">
                Use the field above to begin searching for something
              </p> */}
            </div>
          </div>
          <div
            className={clsx('no-search-results', {
              'search-results-hidden': this.state.searchContent === ''
            })}>

            <Grid container justify='center'>
              <div className="text-black py-4">
                {this.state.searchLoaded === true ? (
                  <div>
                    <p className="text-black-50 font-size-lg">
                      {t('AppBar.NavSearch.Searching')} {' '}
                      <b className="text-black">{this.state.searchContent}</b>
                    </p>
                    <Divider />
                  </div>
                ) : this.state.autoCompleteContent !== null ? this.state.autoCompleteContent.length > 0 ? (
                  this.state.autoCompleteContent.map((item, index) => {
                    return (
                      <Chip
                        key={index}
                        size='large'
                        label={item}
                        className={classes.chip}
                        clickable
                        variant='outlined'
                        onClick={(event) => this.handleSearch(event, item)}
                      />
                    );
                  })
                ) : (
                    <div className="text-warning font-weight-bold font-size-xl">
                      {t('AppBar.NavSearch.NoOption')}
                    </div>
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
  }
}

DrawerSearch.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = (theme) => ({
  example: {
    color: '#2E84CF'
  },
  link: {
    textDecoration: 'none',
    color: '#2E84CF',
    padding: '0em 0.5em 0em 0.5em',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
    }
  },
  chip: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    textShadow: 'none',
    fontSize: 16,
    fontWeight: 300,
    // color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.03ex 0 grey, 0.03ex 0 grey'
    }
  }
});

export default compose(
  withStyles(styles),
  connect(
    null,
    { setSnack }
  ),
  withTranslation()
)(DrawerSearch);
