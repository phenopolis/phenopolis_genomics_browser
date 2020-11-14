import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';
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
            payload: { code: 404, message: 'HPO not exist.', relink: '/dashboard' },
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/variant/' + param },
          });
        } else if ((error.response.status === 404) | (error.response.status === 500)) {
          dispatch({
            type: SET_STATUS,
            payload: {
              code: 404,
              message: "Variant does not exist, or you don't have permission to view it.",
              relink: '/dashboard',
            },
          });
        }
        dispatch({ type: GET_VARIANT_FAIL, payload: { error: error.response } });
      });
  };
};
