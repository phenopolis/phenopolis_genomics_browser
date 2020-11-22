import React from 'react';
import { Grid, Box, Typography, Button, Container } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin } from '../../redux/actions/auth';
import { setDialog } from '../../redux/actions/dialog';
import Homebanner from '../../assets/image/Homebanner.jpg';

const HomeBanner = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));

  const handleTriggerDialog = (dialogName) => {
    dispatch(setDialog(dialogName));
  }

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

                {username === '' ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    className="banner-button"
                    onClick={() => handleTriggerDialog('Login/Register')}>
                    {'Login or Register'}
                  </Button>
                ) : (
                    <Link style={{ textDecoration: 'none' }} to="/dashboard">
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="large"
                        className="banner-button"
                      // component={Link}
                      // to='/search'
                      >
                        Dashboard
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
