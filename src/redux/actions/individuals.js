import {
  CREATE_INDIVIDUA_REQUEST,
  CREATE_INDIVIDUA_SUCCESS,
  CREATE_INDIVIDUA_FAIL,
} from '../types/individuals';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const createIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: CREATE_INDIVIDUA_REQUEST });
    Service.createIndividual(data)
      .then((res) => {
        dispatch({ type: CREATE_INDIVIDUA_SUCCESS, payload: res });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised', relink: '/create_patient' },
          });
        }
        dispatch({ type: CREATE_INDIVIDUA_FAIL, payload: error.response.data.error });
      });
  };
};
