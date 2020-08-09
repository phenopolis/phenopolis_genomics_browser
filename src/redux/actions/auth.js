import { LOGIN_REQUEST, LOGIN_REQUEST_SUCCESS, LOGIN_REQUEST_FAIL } from '../types/auth';
import Service from '../service';

export const login = (data) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    Service.login(data)
      .then((res) => {
        dispatch({ type: LOGIN_REQUEST_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: LOGIN_REQUEST_FAIL, payload: error.response });
      });
  };
};

export const userLogout = () => {
  return (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    dispatch({
      type: LOGIN_REQUEST_SUCCESS,
      payload: {
        data: {
          success: '',
          username: '',
        },
        loading: false,
        error: false,
      },
    });

    Service.logout()
      .then((res) => {})
      .catch((error) => {
        dispatch({ type: LOGIN_REQUEST_FAIL, payload: error.response });
      });
  };
};
