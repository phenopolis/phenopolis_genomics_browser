import { GET_HPO, GET_HPO_SUCCESS, GET_HPO_FAIL, GET_HPO_UNMOUNT } from '../types/hpo';
import Service from '../service';

export const getHPO = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_HPO });
    Service.getHPO(param)
      .then((res) => {
        dispatch({ type: GET_HPO_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_HPO_FAIL, payload: error.response });
      });
  };
};

export const unmountHPO = () => {
  return (dispatch) => {
    dispatch({ type: GET_HPO });
    dispatch({
      type: GET_HPO_UNMOUNT,
      payload: {
        data: [],
      },
    });
  };
};
