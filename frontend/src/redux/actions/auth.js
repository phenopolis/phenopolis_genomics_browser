import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAIL,
  ISLOGIN_SUCCESS,
  ISLOGIN_FAIL,
} from '../types/auth';
import { SET_DIALOG } from '../types/dialog';
import Service from '../service';

export const userLogin = (data) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: { relink: data.relink } });
    Service.login(data.loginForm)
      .then((res) => {
        dispatch({ type: SET_DIALOG, payload: { dialogName: false } });
        dispatch({ type: LOGIN_REQUEST_SUCCESS, payload: { username: res.data.username } });
      })
      .catch((error) => {
        dispatch({ type: LOGIN_REQUEST_FAIL, payload: { error: error.response } });
      });
  };
};

export const userLogout = (data) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST, payload: { relink: data.relink } });
    Service.logout()
      .then((res) => {
        dispatch({ type: LOGIN_REQUEST_SUCCESS, payload: { username: '' } });
      })
      .catch((error) => {
        dispatch({ type: LOGIN_REQUEST_FAIL, payload: { error: error.response } });
      });
  };
};

export const isLoggedIn = () => {
  return (dispatch) => {
    Service.isLoggedIn()
      .then((res) => {
        dispatch({ type: ISLOGIN_SUCCESS, payload: { username: res.data.username } });
      })
      .catch((error) => {
        dispatch({ type: ISLOGIN_FAIL, payload: { error: error.response } });
      });
  };
};
