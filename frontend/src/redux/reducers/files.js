import { FETCH_FILES_REQUEST, FETCH_FILES_SUCCESS, FETCH_FILES_FAIL } from '../types/files';

const initialState = {
  files: [],
  fetchFileLoaded: false,
  fetchFileError: false,
};

const Files = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FILES_REQUEST: {
      return {
        ...state,
        files: [],
        fetchFileLoaded: false,
        fetchFileError: false,
      };
    }
    case FETCH_FILES_SUCCESS: {
      return {
        ...state,
        files: action.payload.data,
        fetchFileLoaded: true,
      };
    }
    case FETCH_FILES_FAIL: {
      return {
        ...state,
        fetchFileLoaded: false,
        fetchFileError: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default Files;
