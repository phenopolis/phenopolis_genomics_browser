import { SET_USER } from './actionTypes';

export const setUser = newUsername => ({
  type: SET_USER,
  payload: {
    newUsername
  }
});
