import {
  FETCH_FILES_REQUEST,
  FETCH_FILES_SUCCESS,
  FETCH_FILES_FAIL,
  DELETE_FILES_REQUEST,
  DELETE_FILES_SUCCESS,
  DELETE_FILES_FAIL,
  DOWNLOAD_FILES_REQUEST,
  DOWNLOAD_FILES_SUCCESS,
  DOWNLOAD_FILES_FAIL,
  RESET_FILES,
} from '../types/files';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getFiles = (param) => {
  return (dispatch) => {
    dispatch({ type: FETCH_FILES_REQUEST });
    Service.getFiles(param)
      .then((res) => {
        dispatch({ type: FETCH_FILES_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        dispatch({ type: FETCH_FILES_FAIL, payload: { error: error.response } });
      });
  };
};

export const deleteFile = (param) => {
  return (dispatch) => {
    dispatch({ type: DELETE_FILES_REQUEST });
    Service.deleteFile(param)
      .then((res) => {
        dispatch({ type: DELETE_FILES_SUCCESS });
      })
      .catch((error) => {
        dispatch({ type: DELETE_FILES_FAIL, payload: { error: error.response } });
      });
  };
};

export const downloadFile = (param) => {
  return (dispatch) => {
    dispatch({ type: DOWNLOAD_FILES_REQUEST });
    Service.downloadFile(param)
      .then((res) => {
        dispatch({ type: DOWNLOAD_FILES_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        dispatch({ type: DOWNLOAD_FILES_FAIL, payload: { error: error.response } });
      });
  };
};

export const resetFile = (param) => {
  return (dispatch) => {
    dispatch({ type: RESET_FILES });
  };
};
