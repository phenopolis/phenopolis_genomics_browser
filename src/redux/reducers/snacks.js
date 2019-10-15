import { SET_SNACK } from '../actionTypes';

const initialState = {
  snackMessage: ''
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SNACK: {
      const newMessage = action.payload.newMessage;
      return {
        ...state,
        snackMessage: newMessage
      };
    }
    default:
      return state;
  }
}
