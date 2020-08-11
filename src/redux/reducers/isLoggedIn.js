import { IS_LOGGED_IN, IS_LOGGED_IN_SUCCESS, IS_LOGGED_IN_FAIL } from '../types/users';

const initialState = {
  data: '',
  loading: false,
  error: false,
};

const isLoggedIn = (state = initialState, action) => {
  switch (action.type) {
    case IS_LOGGED_IN: {
      return {
        ...state,
        loading: true,
      };
    }
    case IS_LOGGED_IN_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    }
    case IS_LOGGED_IN_FAIL: {
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

export default isLoggedIn;
