import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAIL,
  ISLOGIN_SUCCESS,
  ISLOGIN_FAIL,
} from '../types/auth';

const initialState = {
  username: '',
  error: false,
  notification: false,
  relink: '/',
};

const Auth = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return {
        ...state,
        error: false,
        notification: false,
        relink: action.payload.relink,
      };
    }
    case LOGIN_REQUEST_SUCCESS: {
      return {
        ...state,
        username: action.payload.username,
        error: false,
        notification: true,
      };
    }
    case LOGIN_REQUEST_FAIL: {
      return {
        ...state,
        error: action.payload.error,
        notification: true,
      };
    }
    case ISLOGIN_SUCCESS: {
      return {
        ...state,
        username: action.payload.username,
        error: false,
        notification: false,
      };
    }
    case ISLOGIN_FAIL: {
      return {
        ...state,
        error: action.payload.error,
        notification: false,
      };
    }
    default:
      return state;
  }
};

export default Auth;
