import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getVariant = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_VARIANT });
    Service.getVariant(param)
      .then((res) => {
        console.log(res)
        if(Array.isArray(res.data)) {
          dispatch({ type: GET_VARIANT_SUCCESS, payload: { data: res.data } });
        } else {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: 'Variant not exist.' },
          });
        }
      })
      .catch((error) => {
        console.log(error.response)
        if(error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error },
          });
        } else if(error.response.status === 404) {
          dispatch({
            type: SET_STATUS,
            payload: {
              code: 404,
              message: "Variant does not exist.",
            },
          });
        } else if(error.response.status === 400) {
          dispatch({
            type: SET_STATUS,
            payload: {
              code: 404,
              message: "Wrong variant id. The variant id must follow the format chromosome-position-reference-alternate",
            },
          });
        }
        dispatch({ type: GET_VARIANT_FAIL, payload: { error: error.response } });
      });
  };
};
