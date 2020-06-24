import { SET_USER } from './actionTypes';
import { SET_SNACK } from './actionTypes';
import { SET_MESSAGE } from './actionTypes';

export const setUser = (newUsername) => ({
  type: SET_USER,
  payload: {
    newUsername,
  },
});

export const setMessage = (newMessage) => ({
  type: SET_MESSAGE,
  payload: {
    newMessage,
  },
});

export const setSnack = (newMessage, newVariant) => ({
  type: SET_SNACK,
  payload: {
    newMessage,
    newVariant,
  },
});
