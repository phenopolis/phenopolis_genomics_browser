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

  const { username, error, notification, relink, code, message, statusRelink } = useSelector(
    (state) => ({
      username: state.Auth.username,
      error: state.Auth.error,
      notification: state.Auth.notification,
      relink: state.Auth.relink,

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
    if (username !== '' && notification) {
      dispatch(setSnack(username + i18next.t('HomePage.HomeBanner.login_success'), 'success'));
      history.push(relink);
    } else if (username === '' && notification) {
      dispatch(setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success'));
      history.push(relink);
    }
  }, [dispatch, username, relink, dispatch]);

  useEffect(() => {
    if (error) {
      if (notification) {
        dispatch(setSnack(i18next.t('AppBar.LoginBox.Login_Failed'), 'error'));
      }
      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/publications' &&
        window.location.pathname !== '/login'
      ) {
        history.push(`/login?link=${window.location.pathname}`);
      }
    }
  }, [dispatch, error, history, notification]);

  return <></>;
};

export default AuthCheck;
