import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import compose from 'recompose/compose';

import { withStyles } from '@material-ui/core/styles';
import { withWidth, Grid, Box, Typography, Paper } from '@material-ui/core';

import {
  faTachometerAlt, faChartBar, faProjectDiagram, faUsers,
  faEnvelopeOpen
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { withTranslation, Trans } from 'react-i18next';

class HomeMainPart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exomes: "> 8,000",
      variants: "> 4,000,000"
    };
  }

  componentDidMount() {
    var self = this;
    axios
      .get('/api/statistics', {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond);
        self.setState({
          exomes: respond.exomes,
          variants: respond.total_variants
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    const exomes = this.state.exomes
    const variants = this.state.variants

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
                    {t('HomePage.HomeMainPart.tab1.title')}
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    {t('HomePage.HomeMainPart.tab1.description')}
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
                    {t('HomePage.HomeMainPart.tab2.title')}
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    {t('HomePage.HomeMainPart.tab2.description')}
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
                    {t('HomePage.HomeMainPart.tab3.title')}
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    {t('HomePage.HomeMainPart.tab3.description')}
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
                    {t('HomePage.HomeMainPart.statistic.title')}
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='h6.fontSize'
                    m={1}>
                    <Trans i18nKey="HomePage.HomeMainPart.statistic.description" >
                      Phenopolis includes data from {{ exomes }} exomes representing a total number of {{ variants }} variants.
                    </Trans>
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
                    {t('HomePage.HomeMainPart.contact.title')}
                  </Box>
                  <Box
                    fontWeight='fontWeightLight'
                    fontSize='h6.fontSize'
                    m={1}>
                    <Trans i18nKey="HomePage.HomeMainPart.contact.description">
                      Please feel free to contact us <a href='mailto:info@phenopolis.org' className={classes.a}>here</a> to give us feedback or report any issues.
                    </Trans>
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
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
  withWidth(),
  withTranslation()
)(HomeMainPart);
