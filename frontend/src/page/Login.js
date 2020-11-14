import React from 'react';
import { useSelector } from 'react-redux';
import { CssBaseline, Typography, Container, Paper, Box } from '@material-ui/core';
import LoginBox from '../components/AppBar/LoginBox';
import { Trans, useTranslation } from 'react-i18next';

const Login = (props) => {
  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));
  const { t } = useTranslation();
  const query = new URLSearchParams(props.location.search);
  const mylink = query.get('link');
  return (
    <>
      <CssBaseline />
      {username === '' ? (
        <div className={'login-root'}>
          {query.get('link') ? (
            mylink === 'timeout' ? (
              <span>
                {' '}
                <b style={{ color: '#2E84CF' }}> Token Expired </b>, please re-login.
              </span>
            ) : (
              <Trans i18nKey="Login.redirectionLink">
                <span>
                  {' '}
                  Oops, seems you don't have access to{' '}
                  <b style={{ color: '#2E84CF' }}> {{ mylink }} </b> yet, try login?
                </span>
              </Trans>
            )
          ) : null}

          <LoginBox onLoginSuccess={() => {}} redirectLink={mylink ? mylink : '/dashboard'} />
        </div>
      ) : (
        <div className={'login-root'}>
          <Container maxWidth="md">
            <Paper className={'login-paper2'}>
              <Typography component="div">
                <Box fontWeight="900" fontSize="h4.fontSize" m={1}>
                  {t('Login.login')}
                </Box>
                <Box fontWeight="fontWeightLight" m={1}>
                  {t('Login.login_subtitle')}
                </Box>
              </Typography>
            </Paper>
          </Container>
        </div>
      )}
    </>
  );
};

export default Login;
