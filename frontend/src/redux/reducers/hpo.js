import { GET_HPO, GET_HPO_SUCCESS, GET_HPO_FAIL, GET_HPO_UNMOUNT } from '../types/hpo';

const initialState = {
  data: [],
  loaded: false,
  error: false,
};

const HPO = (state = initialState, action) => {
  switch (action.type) {
    case GET_HPO: {
      return {
        ...state,
        loaded: false,
        error: false,
      };
    }
    case GET_HPO_SUCCESS: {
      return {
        ...state,
        loaded: true,
        data: action.payload.data,
      };
    }
    case GET_HPO_FAIL: {
      return {
        ...state,
        loaded: false,
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default HPO;
