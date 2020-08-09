import {
  GET_PREVIEW,
  GET_PREVIEW_SUCCESS,
  GET_PREVIEW_FAIL,
  CLEAR_PREVIEW,
} from '../types/preview';

const initialState = {
  previewInfo: null,
  previewName: null,
  previewLoaded: false,
  error: false,
};

const Preview = (state = initialState, action) => {
  switch (action.type) {
    case GET_PREVIEW: {
      return {
        ...state,
        previewLoaded: false,
      };
    }
    case GET_PREVIEW_SUCCESS: {
      return {
        ...state,
        previewLoaded: true,
        previewInfo: action.payload.info,
        previewName: action.payload.name,
      };
    }
    case GET_PREVIEW_FAIL: {
      return {
        ...state,
        previewLoaded: true,
        error: 'Fetch Preview failed.',
      };
    }
    case CLEAR_PREVIEW: {
      return {
        ...state,
        previewInfo: null,
        previewName: null,
        previewLoaded: false,
      };
    }
    default:
      return state;
  }
};

export default Preview;
