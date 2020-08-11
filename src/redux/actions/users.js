import { SET_USER, IS_LOGGED_IN, IS_LOGGED_IN_SUCCESS, IS_LOGGED_IN_FAIL } from '../types/users';
import Service from '../service';

export const setUser = (newUsername) => ({
  type: SET_USER,
  payload: {
    newUsername,
  },
});

export const logout = () => ({
  type: SET_USER,
  payload: {
    newUsername: '',
  },
});

export const isLoggedIn = () => {
  return (dispatch) => {
    dispatch({ type: IS_LOGGED_IN });
    Service.isLoggedIn()
      .then((res) => {
        dispatch({ type: IS_LOGGED_IN_SUCCESS, payload: res.data });
      })
      .catch((error) => {
        dispatch({ type: IS_LOGGED_IN_FAIL, payload: error.response });
      });
  };
};
