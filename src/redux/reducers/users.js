import { SET_USER } from '../actionTypes';

const initialState = {
  username: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_USER: {
      const newUsername = action.payload.newUsername;
      return {
        ...state,
        username: newUsername,
      };
    }
    default:
      return state;
  }
}
