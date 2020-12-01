import {
  LOGIN_REQUEST,
  LOGIN_REQUEST_SUCCESS,
  LOGIN_REQUEST_FAIL,
  ISLOGIN_REQUEST,
  ISLOGIN_SUCCESS,
  ISLOGIN_FAIL,
  LOGOUT_REQUEST,
  LOGOUT_REQUEST_SUCCESS,
  LOGOUT_REQUEST_FAIL,
} from '../types/auth';

const initialState = {
  username: '',
  loginLoaded: false,
  loginError: false,
  relink: '/',
  // Below are 2 status for is_login
  isLoginLoaded: false,
  isLoginError: false,
  // Below are states for Logout
  logoutLoaded: false,
  logoutError: false,
};

const Auth = (state = initialState, action) => {
  switch (action.type) {
    // Below are 3 reducers for Login Action
    case LOGIN_REQUEST: {
      return {
        ...state,
        username: '',
        loginLoaded: false,
        loginError: false,
        relink: action.payload.relink,
      };
    }
    case LOGIN_REQUEST_SUCCESS: {
      return {
        ...state,
        username: action.payload.username,
        loginLoaded: true,
      };
    }
    case LOGIN_REQUEST_FAIL: {
      return {
        ...state,
        loginError: action.payload.error,
      };
    }
    // Below are 3 reducers for ISLOGIN
    case ISLOGIN_REQUEST: {
      return {
        ...state,
        username: '',
        isLoginLoaded: false,
        isLoginError: false,
      };
    }
    case ISLOGIN_SUCCESS: {
      return {
        ...state,
        username: action.payload.username,
        isLoginLoaded: true,
      };
    }
    case ISLOGIN_FAIL: {
      return {
        ...state,
        isLoginError: action.payload.error,
      };
    }
    // Below are 3 reducers for LOG_OUT
    case LOGOUT_REQUEST: {
      return {
        ...state,
        logoutLoaded: false,
        logoutError: false,
        relink: action.payload.relink,
      };
    }
    case LOGOUT_REQUEST_SUCCESS: {
      return {
        ...state,
        username: '',
        logoutLoaded: true,
      };
    }
    case LOGOUT_REQUEST_FAIL: {
      return {
        ...state,
        logoutError: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default Auth;
