import { SET_USER  } from './actionTypes';
import { SET_SNACK } from './actionTypes';

export const setUser = newUsername => ({
  type: SET_USER,
  payload: {
    newUsername
  }
});

export const setSnack = newMessage => ({
  type: SET_SNACK,
  payload: {
    newMessage
  }
});