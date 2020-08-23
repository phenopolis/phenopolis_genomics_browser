import {
  CREATE_INDIVIDUA_REQUEST,
  CREATE_INDIVIDUA_SUCCESS,
  CREATE_INDIVIDUA_FAIL,
} from '../types/individuals';
import Service from '../service';

export const createIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: CREATE_INDIVIDUA_REQUEST });
    Service.createIndividual(data)
      .then((res) => {
        console.log(res);
        dispatch({ type: CREATE_INDIVIDUA_SUCCESS, payload: res });
      })
      .catch((error) => {
        console.log(error.response);
        dispatch({ type: CREATE_INDIVIDUA_FAIL, payload: error.response.data.error });
      });
  };
};
