import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { loadCSS } from 'fg-loadcss';
import { Grid, Box, Container, CssBaseline, Typography, Icon } from '@material-ui/core'

import { withRouter } from "react-router";
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithubSquare, faTwitterSquare } from '@fortawesome/free-brands-svg-icons'

import compose from 'recompose/compose';
import { useTranslation, Trans, withTranslation } from 'react-i18next';
import i18next from "i18next";

function Copyright() {
  return (
    <Typography variant="body2" align="left">
      {'© '}
      2020 Phenopolis Limited. Registered company number 11541164.
    </Typography>
  );
}

class StickyFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;
    const { match, location, history } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        {location.pathname === '/' ? (
          <Container component="main" className={classes.main} maxWidth="xl" >
            <Grid container direction='row' justify='center' alignItems='center'>
              <Grid item xs={12} md={6}>
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    {t("Footer.About_Us")}
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    {i18next.t("Footer.Description")}
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    {i18next.t("Footer.Useful_Links")}
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1} component={Link} to='/publications' className={classes.a}>
                    {i18next.t("Footer.Publications")}
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="https://github.com/phenopolis" className={classes.a}>Github</a>
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="mailto:info@phenopolis.org" className={classes.a}> {i18next.t("Contact")} </a>
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="https://phenopolis.co.uk/" className={classes.a}>Phenopolis</a>
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={6} md={2}>
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    {i18next.t("Footer.External_Links")}
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="http://human-phenotype-ontology.github.io/" className={classes.a}>Human Phenotype Ontology</a>
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="https://monarchinitiative.org/" className={classes.a}>Monarch Initiative</a>
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="https://phenotips.org/" className={classes.a}>Phenotips</a>
                  </Box>
                  <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                    <a href="https://decipher.sanger.ac.uk/" className={classes.a}>DECIPHER</a>
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </Container>
        ) : (null)}

        <footer className={classes.footer}>
          <Container component="main" className={classes.main} maxWidth="xl" >
            <Grid container direction='row' justify='center' alignItems='center'>
              <Grid item xs={12} md={8}>
                <Typography variant="body2" gutterBottom>
                  <Trans i18nKey="Footer.Citation">
                    If you use Phenopolis, please cite us as: <a href='https://doi.org/10.1093/bioinformatics/btx147' className={classes.a}>Pontikos, N. et al. (2017).
                    Phenopolis: an open platform for harmonization and analysis of genetic
                and phenotypic data. Bioinformatics, 9, 7</a>
                  </Trans>
                </Typography>
                <Copyright />
              </Grid>
              <Grid item xs={12} md={2}>
                <a className={classes.a} href="https://twitter.com/phenopolis"><FontAwesomeIcon className={classes.iconHover} icon={faTwitterSquare} /></a>
                <a className={classes.a} href="https://github.com/phenopolis/phenopolis"><FontAwesomeIcon className={classes.iconHover} icon={faGithubSquare} /></a>
              </Grid>
            </Grid>
          </Container>
        </footer>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    // minHeight: '13em',
    backgroundColor: '#0279d3',
    color: 'white'
  },
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  footer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginTop: 'auto',
    backgroundColor: '#0474c6',
  },
  a: {
    textDecoration: 'none',
    color: 'white',
    '&:hover': {
      textShadow: '-0.06ex 0 white, 0.06ex 0 white',
    }
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'left'
  },
  iconHover: {
    color: 'white',
    fontSize: '2em',
    margin: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer'
    },
  }
});

StickyFooter.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(compose(withStyles(styles), withTranslation())(StickyFooter))