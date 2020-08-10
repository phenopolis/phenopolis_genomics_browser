import { GET_PATIENTS, GET_PATIENTS_SUCCESS, GET_PATIENTS_FAIL } from '../types/patients';
import Service from '../service';

export const getPatients = () => {
  return (dispatch) => {
    dispatch({ type: GET_PATIENTS });
    Service.getPatients()
      .then((res) => {
        dispatch({ type: GET_PATIENTS_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_PATIENTS_FAIL, payload: error.response });
      });
  };
};
