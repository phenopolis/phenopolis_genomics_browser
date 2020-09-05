import {
  GET_PREVIEW,
  GET_PREVIEW_SUCCESS,
  GET_PREVIEW_FAIL,
  CLEAR_PREVIEW,
} from '../types/preview';

const initialState = {
  name: null,
  data: [],
  loaded: false,
  error: false,
};

const Preview = (state = initialState, action) => {
  switch (action.type) {
    case GET_PREVIEW: {
      return {
        ...state,
        name: null,
        data: [],
        loaded: false,
        error: false,
      };
    }
    case GET_PREVIEW_SUCCESS: {
      return {
        ...state,
        name: action.payload.name,
        data: action.payload.data,
        loaded: true,
      };
    }
    case GET_PREVIEW_FAIL: {
      return {
        ...state,
        name: action.payload.name,
        loaded: true,
        error: action.payload.error,
      };
    }
    case CLEAR_PREVIEW: {
      return {
        ...state,
        name: null,
        data: [],
        loaded: false,
        error: false,
      };
    }
    default:
      return state;
  }
};

export default Preview;
