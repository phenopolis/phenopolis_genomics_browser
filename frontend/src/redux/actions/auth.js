import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAIL,
  ISLOGIN_REQUEST,
  ISLOGIN_SUCCESS,
  ISLOGIN_FAIL,
  LOGOUT_REQUEST,
  LOGOUT_REQUEST_SUCCESS,
  LOGOUT_REQUEST_FAIL,
} from '../types/auth';
import { SET_DIALOG } from '../types/dialog';
import { SET_SNACK } from '../types/snacks';
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
    dispatch({ type: LOGOUT_REQUEST, payload: { relink: data.relink } });
    Service.logout()
      .then((res) => {
        console.log(res)
        dispatch({ type: LOGOUT_REQUEST_SUCCESS });
      })
      .catch((error) => {
        console.log(error.response)
        if (error.response.status === 401) {
          // dispatch({ type: LOGOUT_REQUEST_SUCCESS });
          dispatch({
            type: SET_SNACK,
            payload: {
              newMessage: 'Your login has expired before, please re-login.',
              newVariant: 'warning',
            },
          });
        } else {
          dispatch({ type: LOGOUT_REQUEST_FAIL, payload: { error: error.response } });
        }
      });
  };
};

export const isLoggedIn = () => {
  return (dispatch) => {
    dispatch({ type: ISLOGIN_REQUEST });
    Service.isLoggedIn()
      .then((res) => {
        dispatch({ type: ISLOGIN_SUCCESS, payload: { username: res.data.username } });
      })
      .catch((error) => {
        dispatch({ type: ISLOGIN_FAIL, payload: { error: error.response } });
      });
  };
};