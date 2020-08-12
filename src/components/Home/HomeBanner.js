import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Button, Container } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/actions/auth';
import { setUser } from '../../redux/actions/users';
import { setSnack } from '../../redux/actions/snacks';
import Homebanner from '../../assets/image/Homebanner.jpg';
import i18next from 'i18next';

const HomeBanner = (props) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(false);
  const dispatch = useDispatch();
  const { error, user } = useSelector((state) => ({
    user: state.Login.data,
    error: state.Login.error,
  }));

  useEffect(() => {
    if (user.username && isLogin) {
      dispatch(setSnack(user.username + i18next.t('HomePage.HomeBanner.login_success'), 'success'));
      dispatch(setUser(user.username));
    }
  }, [dispatch, user, isLogin]);

  useEffect(() => {
    if (error) {
      dispatch(setSnack(i18next.t('HomePage.HomeBanner.login_fail'), 'error'));
    }
  }, [error]);

  const demoLogin = () => {
    const loginData = {
      user: 'demo',
      password: 'demo123',
    };
    setIsLogin(true);
    dispatch(login(loginData));
  };

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
              <div className="bannertext">
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h1.fontSize" m={1}>
                    {props.BannerText}
                  </Box>
                  <Box fontSize="h5.fontSize" fontWeight="fontWeightLight" m={1}>
                    {t('HomePage.HomeBanner.subtitle')}
                  </Box>
                </Typography>

                {user.username === '' ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    className="banner-button"
                    onClick={demoLogin}>
                    {t('HomePage.HomeBanner.button_no_login')}
                  </Button>
                ) : (
                  <Link style={{ textDecoration: 'none' }} to="/search">
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      className="banner-button"
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
};

export default HomeBanner;
