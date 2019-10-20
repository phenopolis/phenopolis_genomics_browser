import { SET_SNACK } from '../actionTypes';
import { SET_MESSAGE } from '../actionTypes';

const initialState = {
  snackMessage: '',
  snackVariant: 'info'
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_MESSAGE: {
      const newMessage = action.payload.newMessage;
      return {
        ...state,
        snackMessage: newMessage
      };
    }
    case SET_SNACK: {
      const newMessage = action.payload.newMessage;
      const newVariant = action.payload.newVariant;
      return {
        ...state,
        snackMessage: newMessage,
        snackVariant: newVariant
      };
    }
    default:
      return state;
  }
}
