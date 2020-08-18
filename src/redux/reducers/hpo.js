import { GET_HPO, GET_HPO_SUCCESS, GET_HPO_FAIL, GET_HPO_UNMOUNT } from '../types/hpo';

const initialState = {
  data: [],
  loading: true,
  error: false,
};

const HPO = (state = initialState, action) => {
  switch (action.type) {
    case GET_HPO: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_HPO_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    }
    case GET_HPO_FAIL: {
      return {
        ...state,
        loading: false,
        error: action.payload.status,
      };
    }
    case GET_HPO_UNMOUNT: {
      return {
        ...state,
        loading: true,
        error: false,
      };
    }
    default:
      return state;
  }
};

export default HPO;
