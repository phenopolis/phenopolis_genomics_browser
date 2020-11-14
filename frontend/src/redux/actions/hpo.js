import { GET_HPO, GET_HPO_SUCCESS, GET_HPO_FAIL } from '../types/hpo';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getHPO = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_HPO });
    Service.getHPO(param)
      .then((res) => {
        if (Array.isArray(res.data)) {
          dispatch({ type: GET_HPO_SUCCESS, payload: { data: res.data } });
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
            payload: { code: 401, message: error.response.data.message, relink: '/hpo/' + param },
          });
        } else if (error.response.status === 500) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: 'HPO not exist.', relink: '/dashboard' },
          });
        }

        dispatch({ type: GET_HPO_FAIL, payload: { error: error.response } });
      });
  };
};
