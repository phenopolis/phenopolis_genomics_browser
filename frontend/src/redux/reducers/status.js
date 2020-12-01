import { SET_STATUS, RESET_STATUS } from '../types/status';

const initialState = {
  code: false,
  message: false
};

const Status = (state = initialState, action) => {
  switch (action.type) {
    case SET_STATUS: {
      return {
        ...state,
        code: action.payload.code,
        message: action.payload.message
      };
    }
    case RESET_STATUS: {
      return {
        ...state,
        code: false,
        message: false,
      };
    }
    default:
      return state;
  }
};

export default Status;
