import { SET_STATUS, RESET_STATUS } from '../types/status';

const initialState = {
  code: false,
  message: false,
  relink: false,
};

const Status = (state = initialState, action) => {
  switch (action.type) {
    case SET_STATUS: {
      return {
        ...state,
        code: action.payload.code,
        message: action.payload.message,
        relink: action.payload.relink,
      };
    }
    case RESET_STATUS: {
      return {
        ...state,
        code: false,
        message: false,
        relink: false,
      };
    }
    default:
      return state;
  }
};

export default Status;