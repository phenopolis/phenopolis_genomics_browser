import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';
import Service from '../service';

export const getVariant = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_VARIANT });
    Service.getVariant(param)
      .then((res) => {
        console.log(res)
        dispatch({ type: GET_VARIANT_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_VARIANT, payload: error.response });
      });
  };
};
