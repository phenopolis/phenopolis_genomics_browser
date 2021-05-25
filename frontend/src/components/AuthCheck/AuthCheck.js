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

  const {
    username,
    loginLoaded,
    loginError,
    relink,
    isLoginLoaded,
    isLoginError,
    logoutLoaded,
    logoutError,
    code,
    message,
  } = useSelector((state) => ({
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
  }));

  // Everytime website start, auto check if user has log in
  useEffect(() => {
    dispatch(isLoggedIn());
  }, [dispatch]);

  useEffect(() => {
    // When API encounter 401 error, auto logout if use has not logout, happens when user left computer for too long.
    if (code === 401) {
      dispatch(setSnack(message, 'warning'));
      if (username !== '') {
        dispatch(userLogout({ relink: `/login?link=${window.location.pathname}` }));
      }
    } else if (code === 404 || code === 400) {
      // When API encounter 404 or 400 error, redirect to dashboard page.
      dispatch(setSnack(message, 'warning'));
      history.push('/dashboard');
    }
    dispatch({ type: RESET_STATUS });
  }, [code, dispatch]);

  useEffect(() => {
    // Send sucess login message if login success.
    if (loginLoaded) {
      dispatch(setSnack(username + i18next.t('HomePage.HomeBanner.login_success'), 'success'));
      history.push(relink);
    }

    // Send error message if login failed
    if (loginError) {
      dispatch(setSnack(i18next.t('AppBar.LoginBox.Login_Failed'), 'error'));
    }
  }, [loginLoaded, loginError]);

  useEffect(() => {
    // Send success message if logout success
    if (logoutLoaded) {
      dispatch(setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success'));
      history.push(relink);
    }

    // Send error message if logout failed, note if user had expired, the API would return 401 error.
    // Here I will NOT triggeer the 401 error, but print message in redux
    if (logoutError) {
      dispatch(setSnack('Logout Failed', 'error'));
    }
  }, [logoutLoaded, logoutError]);

  useEffect(() => {
    if (isLoginLoaded) {
      dispatch(setSnack('Welcome Back ' + username + '!', 'success'));
    }

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
  }, [isLoginError, isLoginLoaded]);

  return <></>;
};

export default AuthCheck;
