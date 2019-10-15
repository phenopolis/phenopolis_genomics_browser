import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import { withWidth, Grid, Box, Typography, Paper } from '@material-ui/core';

import {
  faTachometerAlt, faChartBar, faProjectDiagram, faUsers,
  faEnvelopeOpen
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class HomeMainPart extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <Grid container className={classes.root}>
          <Grid container justify='center'>
            <Grid item xs={12} md={3} className={classes.gridpaper}>
              <Paper elevation={0} className={classes.paper}>
                <FontAwesomeIcon
                  icon={faTachometerAlt}
                  color='#2E84CF'
                  className={classes.fontawesomeicon}
                />
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    Speed Up Diagnosis
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    Prioritises genetic mutations in patients based on their
                    phenotypes described using the Human Phenotype Ontology.
                  </Box>
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3} className={classes.gridpaper}>
              <Paper elevation={0} className={classes.paper}>
                <FontAwesomeIcon
                  icon={faChartBar}
                  color='#2E84CF'
                  className={classes.fontawesomeicon}
                />
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    Multiple Analysis Tools
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    Exomiser, PubmedScore, Phenogenon, SimReg, Bevimed and SKAT
                    score genetic variants and phenotypes.
                  </Box>
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3} className={classes.gridpaper}>
              <Paper elevation={0} className={classes.paper}>
                <FontAwesomeIcon
                  icon={faProjectDiagram}
                  color='#2E84CF'
                  className={classes.fontawesomeicon}
                />
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
                    Gene-Phenotype Relations
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    Using the gene or phenotype view, understand the spectrum of
                    phenotypes that gene mutations lead to.
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={classes.root2}>
          <Grid container justify='center'>
            <Grid item xs={12} md={8} className={classes.gridpaper2}>
              <Paper elevation={0} className={classes.paper2}>
                <FontAwesomeIcon
                  icon={faUsers}
                  color='#2E84CF'
                  className={classes.fontawesomeicon}
                />
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
                    Phenopolis Statistics
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='h6.fontSize'
                    m={1}>
                    Phenopolis includes data from 6,048 exomes representing a
                    total number of 4,859,971 variants.
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={classes.root}>
          <Grid container justify='center'>
            <Grid item xs={12} md={8} className={classes.gridpaper}>
              <Paper elevation={0} className={classes.paper}>
                <FontAwesomeIcon
                  icon={faEnvelopeOpen}
                  color='#2E84CF'
                  className={classes.fontawesomeicon}
                />
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
                    Contact Us
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='h6.fontSize'
                    m={1}>
                    Please feel free to contact us <a href="mailto:info@phenopolis.org" className={classes.a}>here</a> to give us feedback or
                    report any issues.
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

HomeMainPart.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired
};

const styles = theme => ({
  button: {
    margin: theme.spacing(1)
  },
  root: {
    flexGrow: 1,
    backgroundColor: 'white',
    padding: '4em 0em 4em 0em'
  },
  bannertext: {
    textAlign: 'center',
    color: 'white'
  },
  paper: {
    padding: '4em 1em 4em 1em'
  },
  gridpaper: {
    textAlign: 'center'
  },
  fontawesomeicon: {
    fontSize: 50,
    marginBottom: '0.3em'
  },
  root2: {
    flexGrow: 1,
    backgroundColor: '#eeeeee',
    padding: '4em 0em 4em 0em'
  },
  gridpaper2: {
    textAlign: 'center'
  },
  paper2: {
    padding: '4em 1em 4em 1em',
    backgroundColor: '#eeeeee'
  },
  a: {
    textDecoration: 'none',
    color: '#2E84CF',
    fontWeight: '900',
    '&:hover': {
      textShadow: '-0.06ex 0 white, 0.06ex 0 white',
    }
  }
});

export default compose(
  withStyles(styles),
  withWidth()
)(HomeMainPart);
