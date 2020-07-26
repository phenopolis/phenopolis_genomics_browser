import {
  GET_PREVIEW,
  GET_PREVIEW_SUCCESS,
  GET_PREVIEW_FAIL,
  CLEAR_PREVIEW,
} from '../types/preview';
import Service from '../service';

export const getPreviewInformation = (text) => {
  return (dispatch) => {
    dispatch({ type: GET_PREVIEW });
    Service.getPreviewInformation(text)
      .then((res) => {
        console.log(res);
        dispatch({ type: GET_PREVIEW_SUCCESS, payload: res.data[0] });
      })
      .catch((error) => {
        dispatch({ type: GET_PREVIEW_FAIL, payload: error.response });
      });
  };
};

export const clearPreviewInformation = () => {
  return (dispatch) => {
    dispatch({ type: CLEAR_PREVIEW });
  };
};
