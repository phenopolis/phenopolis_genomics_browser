import {
  INDIVIDUAL_INFO_REQUEST,
  INDIVIDUAL_INFO_REQUEST_FAIL,
  INDIVIDUAL_INFO_REQUEST_SUCCESS,
} from '../types/individual';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getIndividualInformation = (param) => {
  return (dispatch) => {
    dispatch({ type: INDIVIDUAL_INFO_REQUEST });
    Service.getIndividualInformation(param)
      .then((res) => {
        console.log(res);
        dispatch({ type: INDIVIDUAL_INFO_REQUEST_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: {
              code: 401,
              message: error.response.data.error,
              relink: '/individual/' + param,
            },
          });
        } else if (error.response.status === 404) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: error.response.data.message, relink: '/' },
          });
        }
        dispatch({ type: INDIVIDUAL_INFO_REQUEST_FAIL, payload: { error: error.response } });
      });
  };
};
