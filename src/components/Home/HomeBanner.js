import React from 'react';
import PropTypes from 'prop-types';

import { Parallax } from 'react-parallax';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Typography, Button } from '@material-ui/core';

import { Link } from 'react-router-dom';

import Cookies from 'universal-cookie';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { setUser } from '../../redux/actions';
import { setSnack } from '../../redux/actions';
import { getUsername } from '../../redux/selectors';

import { withTranslation } from 'react-i18next';

import axios from 'axios';
const qs = require('querystring');

class HomeBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BannerText: null
    };
  }

  getReduxName() {
    return this.props.reduxName;
  }

  DemoLogin = () => {
    const cookies = new Cookies();

    const loginData = qs.stringify({
      name: 'demo',
      password: 'demo123'
    });

    axios
      .post('/api/login', loginData, { withCredentials: true })
      .then(res => {
        let respond = res.data;
        if (respond.success === 'Authenticated') {
          cookies.set('username', respond.username, {
            path: '/',
            maxAge: 86400 * 60 * 24 * 30
          });
          this.setState({ redirect: true });
          this.props.setUser(respond.username);
          this.props.setSnack(respond.username + " Login Success!", "success")
        } else {
          this.props.setSnack('Login Failed.', 'error')
        }
      })
      .catch(err => {
        this.props.setSnack('Login Failed.', 'error')
      });
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <div>
        <Parallax
          bgImage={require('../../assets/image/Homebanner.jpg')}
          strength={500}>
          <div style={{ height: 500 }}>
            <Grid container justify='center'>
              <Box display='flex' alignItems='center' css={{ height: 500 }}>
                <div className={classes.bannertext}>
                  <Typography variant='h2' align='center' gutterBottom>
                    <b>{this.props.BannerText}</b>
                  </Typography>
                  <Typography variant='h6' align='center' gutterBottom>
                    {t('HomePage.HomeBanner.subtitle')}
                  </Typography>
                  {this.props.reduxName === '' ?
                    (<Button
                      variant='outlined'
                      color='inherit'
                      className={classes.button}
                      onClick={this.DemoLogin}
                    >
                      {t('HomePage.HomeBanner.button_no_login')}
                    </Button>) : (<Button
                      variant='outlined'
                      color='inherit'
                      className={classes.button}
                      component={Link}
                      to='/search'
                    >
                      {t('HomePage.HomeBanner.button_login')}
                    </Button>)}
                </div>
              </Box>
            </Grid>
          </div>
        </Parallax>
      </div>
    );
  }
}

HomeBanner.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  button: {
    margin: theme.spacing(1)
  },
  bannertext: {
    textAlign: 'center',
    color: 'white'
  }
});

const mapStateToProps = state => ({ reduxName: getUsername(state) });
export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { setUser, setSnack }
  ),
  withTranslation()
)(HomeBanner);
