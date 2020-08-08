import { LOGIN_REQUEST, LOGIN_REQUEST_SUCCESS, LOGIN_REQUEST_FAIL } from '../types/auth';

const initialState = {
  data: {
    success: '',
    username: ''
  },
  loading: true,
  error: false,
};

const Login = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return {
        ...state,
        loading: true,
        error: false
      };
    }
    case LOGIN_REQUEST_SUCCESS: {
      return {
        ...state,
        loading: false,
        error: false,
        data: action.payload.data,
      };
    }
    case LOGIN_REQUEST_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'Something Went Wrong',
      };
    }
    default:
      return state;
  }
};

export default Login;
