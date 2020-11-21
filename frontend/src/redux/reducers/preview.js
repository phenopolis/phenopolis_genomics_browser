import {
  GET_PREVIEW,
  GET_PREVIEW_SUCCESS,
  GET_PREVIEW_FAIL,
  CLEAR_PREVIEW,
  SET_INDEX
} from '../types/preview';

const initialState = {
  name: null,
  data: [],
  loaded: false,
  error: false,
  indexTo: false // a value control which tooltip should be opened
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
    case SET_INDEX: {
      return {
        ...state,
        indexTo: action.payload.index
      };
    }
    default:
      return state;
  }
};

export default Preview;
