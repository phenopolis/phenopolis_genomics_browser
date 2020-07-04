import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { Grid, Box, Typography, Button, Container } from '@material-ui/core';

import { Link } from 'react-router-dom';

import Cookies from 'universal-cookie';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { setUser } from '../../redux/actions/users';
import { setSnack } from '../../redux/actions/snacks';
import { getUsername } from '../../redux/selectors';

import { withTranslation } from 'react-i18next';
import i18next from 'i18next';

import Homebanner from '../../assets/image/Homebanner.jpg';

import axios from 'axios';
const qs = require('querystring');

class HomeBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BannerText: null,
    };
  }

  getReduxName() {
    return this.props.reduxName;
  }

  DemoLogin = () => {
    const cookies = new Cookies();

    const loginData = qs.stringify({
      name: 'demo',
      password: 'demo123',
    });

    axios
      .post('/api/login', loginData, { withCredentials: true })
      .then((res) => {
        let respond = res.data;
        if (respond.success === 'Authenticated') {
          cookies.set('username', respond.username, {
            path: '/',
            maxAge: 60 * 60 * 2,
          });
          this.setState({ redirect: true });
          this.props.setUser(respond.username);
          this.props.setSnack(
            respond.username + i18next.t('HomePage.HomeBanner.login_success'),
            'success'
          );
        } else {
          this.props.setSnack(i18next.t('HomePage.HomeBanner.login_fail'), 'error');
        }
      })
      .catch((err) => {
        this.props.setSnack(i18next.t('HomePage.HomeBanner.login_fail'), 'error');
      });
  };

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    return (
      <div className="hero-wrapper bg-composed-wrapper bg-white" style={{ height: '70vh' }}>
        <div
          className="bg-composed-wrapper--image bg-composed-filter-rm opacity-9"
          style={{ backgroundImage: 'url(' + Homebanner + ')', height: '70vh' }}
        />
        <div className="bg-composed-wrapper--content mt-4 pt-5 pb-2 py-lg-5">
          <Container fixed className="pb-5">
            <Grid container justify="center">
              <Box display="flex" alignItems="center" css={{ height: 500 }}>
                <div className={classes.bannertext}>
                  <Typography component="div">
                    <Box fontWeight="900" fontSize="h1.fontSize" m={1}>
                      {this.props.BannerText}
                    </Box>
                    <Box fontSize="h5.fontSize" fontWeight="fontWeightLight" m={1}>
                      {t('HomePage.HomeBanner.subtitle')}
                    </Box>
                  </Typography>

                  {this.props.reduxName === '' ? (
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      className={classes.button}
                      onClick={this.DemoLogin}>
                      {t('HomePage.HomeBanner.button_no_login')}
                    </Button>
                  ) : (
                    <Link style={{ textDecoration: 'none' }} to="/search">
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        className={classes.button}
                        // component={Link}
                        // to='/search'
                      >
                        {t('HomePage.HomeBanner.button_login')}
                      </Button>
                    </Link>
                  )}
                </div>
              </Box>
            </Grid>
          </Container>
        </div>
      </div>
    );
  }
}

HomeBanner.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  button: {
    margin: theme.spacing(1),
    color: 'white',
  },
  bannertext: {
    textAlign: 'center',
    color: 'white',
  },
});

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });
export default compose(
  withStyles(styles),
  connect(mapStateToProps, { setUser, setSnack }),
  withTranslation()
)(HomeBanner);
