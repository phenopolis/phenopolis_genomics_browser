import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';
import { userLogout } from './auth';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getVariant = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_VARIANT });
    Service.getVariant(param)
      .then((res) => {
        if (Array.isArray(res.data)) {
          dispatch({ type: GET_VARIANT_SUCCESS, payload: { data: res.data } });
        } else {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: 'HPO not exist.', relink: '/' },
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/variant/' + param },
          });
        }
        dispatch({ type: GET_VARIANT_FAIL, payload: { error: error.response } });
      });
  };
};
