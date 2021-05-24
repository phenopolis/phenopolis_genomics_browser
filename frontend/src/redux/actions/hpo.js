import { GET_HPO, GET_HPO_SUCCESS, GET_HPO_FAIL } from '../types/hpo';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getHPO = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_HPO });
    Service.getHPO(param)
      .then((res) => {
        dispatch({ type: GET_HPO_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
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
        dispatch({ type: GET_HPO_FAIL, payload: { error: error.response } });
      });
  };
};
