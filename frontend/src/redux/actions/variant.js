import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getVariant = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_VARIANT });
    Service.getVariant(param)
      .then((res) => {
        dispatch({ type: GET_VARIANT_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 400) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 400, message: error.response.data.message },
          });
        } else if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error },
          });
        } else if (error.response.status === 404) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: error.response.data.message },
          });
        }
        dispatch({ type: GET_VARIANT_FAIL, payload: { error: error.response } });
      });
  };
};
