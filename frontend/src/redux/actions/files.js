import { FETCH_FILES_REQUEST, FETCH_FILES_SUCCESS, FETCH_FILES_FAIL } from '../types/files';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getFiles = (param) => {
  return (dispatch) => {
    dispatch({ type: FETCH_FILES_REQUEST });
    Service.getFiles(param)
      .then((res) => {
        console.log(res)
        dispatch({ type: FETCH_FILES_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        console.log(error.response)
        dispatch({ type: FETCH_FILES_FAIL, payload: { error: error.response } });
      });
  };
};
