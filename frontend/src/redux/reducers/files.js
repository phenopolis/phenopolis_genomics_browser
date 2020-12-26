import {
  FETCH_FILES_REQUEST,
  FETCH_FILES_SUCCESS,
  FETCH_FILES_FAIL,
  DELETE_FILES_REQUEST,
  DELETE_FILES_SUCCESS,
  DELETE_FILES_FAIL,
  DOWNLOAD_FILES_REQUEST,
  DOWNLOAD_FILES_SUCCESS,
  DOWNLOAD_FILES_FAIL
} from '../types/files';

const initialState = {
  files: [],
  fetchFileLoaded: false,
  fetchFileError: false,
  // Below are 2 status for file delete
  deleteFileLoaded: false,
  deleteFileError: false,
  // Below are 3 status for file delete
  downloadURL: null,
  downloadFileLoaded: false,
  downloadFileError: false,
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
    // Below are 3 reducer for file deletion
    case DELETE_FILES_REQUEST: {
      return {
        ...state,
        deleteFileLoaded: false,
        deleteFileError: false,
      };
    }
    case DELETE_FILES_SUCCESS: {
      return {
        ...state,
        deleteFileLoaded: true,
      };
    }
    case DELETE_FILES_FAIL: {
      return {
        ...state,
        deleteFileError: action.payload.error,
      };
    }
    // Below are 3 reducer for file downloading
    case DOWNLOAD_FILES_REQUEST: {
      return {
        ...state,
        downloadURL: null,
        downloadFileLoaded: false,
        downloadFileError: false,
      };
    }
    case DOWNLOAD_FILES_SUCCESS: {
      return {
        ...state,
        downloadURL: action.payload.data,
        downloadFileLoaded: true,
      };
    }
    case DOWNLOAD_FILES_FAIL: {
      return {
        ...state,
        downloadFileError: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default Files;
