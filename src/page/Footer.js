import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { loadCSS } from 'fg-loadcss';
import { Grid, Box, Container, CssBaseline, Typography, Icon } from '@material-ui/core'
import { Link } from 'react-router-dom';

function Copyright() {
  return (
    <Typography variant="body2" align="left">
      {'© '}
      2019 Phenopolis Limited. Registered company number 11541164.
    </Typography>
  );
}

export default function StickyFooter() {
  const classes = useStyles();

  React.useEffect(() => {
    loadCSS(
      'https://use.fontawesome.com/releases/v5.1.0/css/all.css',
      document.querySelector('#font-awesome-css'),
    );
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Container component="main" className={classes.main} maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography component='div'>
              <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                About Us
              </Box>
              <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                Phenopolis is a platform for harmonization and analysis of sequencing and phenotype data.
                Development of Phenopolis was supported by RP Fighting Blindness,
                NIHR (UCL-Moorfields Eyes Hospital Biomedical Research Center),
                the UK Medical Research Council, the British Heart Foundation and the
                Japan Society for the Promotion of Science.
              </Box>
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography component='div'>
              <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                Useful Links
              </Box>
              <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1} component={Link} to='/publications' className={classes.a}>
                Publications
              </Box>
              <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                <a href="https://github.com/phenopolis" className={classes.a}>Github</a>
              </Box>
              <Box fontWeight='fontWeightRegular' fontSize='body2.fontSize' m={1}>
                <a href="mailto:info@phenopolis.org" className={classes.a}>Contact</a>
              </Box>
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography component='div'>
              <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                External Links
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
      <footer className={classes.footer}>
        <Container maxWidth="md">
          <Grid container spacing={3}>
            <Grid item xs={10}>
              <Typography variant="body2" gutterBottom>
                If you use Phenopolis, please cite us as: <a href='https://doi.org/10.1093/bioinformatics/btx147' className={classes.a}>Pontikos, N. et al. (2017).
                Phenopolis: an open platform for harmonization and analysis of genetic
                and phenotypic data. Bioinformatics, 9, 7</a>
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <a className={classes.a} href="https://twitter.com/phenopolis"><Icon className={clsx(classes.iconHover, 'fab fa-twitter-square')} /></a>
              <a className={classes.a} href="https://github.com/phenopolis/phenopolis"><Icon className={clsx(classes.iconHover, 'fab fa-github-square')} /></a>
            </Grid>
          </Grid>
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '13em',
    backgroundColor: '#0279d3',
    color: 'white'
  },
  main: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    display: 'inline-block',
    textAlign: 'justify'
  },
  footer: {
    padding: theme.spacing(2),
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
    margin: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer'
    },
  }
}));