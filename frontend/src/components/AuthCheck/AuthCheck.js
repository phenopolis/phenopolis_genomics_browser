import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSnack } from '../../redux/actions/snacks';
import { userLogout, isLoggedIn } from '../../redux/actions/auth';
import { RESET_STATUS } from '../../redux/types/status';

import i18next from 'i18next';

const AuthCheck = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { username, loginLoaded, loginError, relink, isLoginLoaded, isLoginError, logoutLoaded, logoutError, code, message, statusRelink } = useSelector(
    (state) => ({
      username: state.Auth.username,
      loginLoaded: state.Auth.loginLoaded,
      loginError: state.Auth.loginError,
      relink: state.Auth.relink,

      // Below are 2 status for is_login
      isLoginLoaded: state.Auth.isLoginLoaded,
      isLoginError: state.Auth.isLoginError,

      // Below are states for Logout
      logoutLoaded: state.Auth.logoutLoaded,
      logoutError: state.Auth.logoutError,

      // Below are 3 status for Error Code judge
      code: state.Status.code,
      message: state.Status.message,
      statusRelink: state.Status.relink,
    })
  );

  useEffect(() => {
    dispatch(isLoggedIn());
  }, [dispatch]);

  useEffect(() => {
    if (code === 401) {
      dispatch(setSnack(message, 'warning'));
      dispatch(userLogout({ relink: statusRelink }));
    } else if (code === 404) {
      dispatch(setSnack(message, 'warning'));
      history.push('/dashboard');
    }
    dispatch({ type: RESET_STATUS });
  }, [code, dispatch]);

  useEffect(() => {
    if (loginLoaded) {
      dispatch(setSnack(username + i18next.t('HomePage.HomeBanner.login_success'), 'success'));
      history.push(relink);
    }

    if (loginError) {
      dispatch(setSnack(i18next.t('AppBar.LoginBox.Login_Failed'), 'error'));
    }
  }, [loginLoaded, loginError]);

  useEffect(() => {
    if (logoutLoaded) {
      dispatch(setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success'));
      history.push(relink);
    }

    if (logoutError) {
      dispatch(setSnack('Logout Failed', 'error'));
    }
  }, [logoutLoaded, logoutError]);

  useEffect(() => {
    if (isLoginError) {
      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/publications' &&
        window.location.pathname !== '/login' &&
        !/confirm/.test(window.location.pathname)
      ) {
        history.push(`/login?link=${window.location.pathname}`);
      }
    }
  }, [isLoginError]);

  return <></>;
};

export default AuthCheck;
