import {
  GET_PREVIEW,
  GET_PREVIEW_SUCCESS,
  GET_PREVIEW_FAIL,
  CLEAR_PREVIEW,
} from '../types/preview';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getPreviewInformation = (text) => {
  return (dispatch) => {
    dispatch({ type: GET_PREVIEW });
    Service.getPreviewInformation(text)
      .then((res) => {
        if (/variant/.test(res.config.url)) {
          var previewName = res.config.url.split('/')[4];
          var result = Object.entries(res.data);
        } else {
          var previewName = res.config.url.split('/')[3];
          var result = res.data[0].preview;
        }
        console.log(result);

        dispatch({
          type: GET_PREVIEW_SUCCESS,
          payload: { data: result, name: previewName },
        });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/' },
          });
        }
        dispatch({
          type: GET_PREVIEW_FAIL,
          payload: { error: error.response, name: text.split('/')[2] },
        });
      });
  };
};

export const clearPreviewInformation = () => {
  return (dispatch) => {
    dispatch({ type: CLEAR_PREVIEW });
  };
};
