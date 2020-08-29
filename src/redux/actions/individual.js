import Service from '../service';
import {
  INDIVIDUAL_INFO_REQUEST,
  INDIVIDUAL_INFO_REQUEST_FAIL,
  INDIVIDUAL_INFO_REQUEST_SUCCESS,
} from '../types/individual';

export const getIndividualInformation = (data) => {
  return (dispatch) => {
    dispatch({ type: INDIVIDUAL_INFO_REQUEST });
    Service.getIndividualInformation(data)
      .then((res) => {
        dispatch({ type: INDIVIDUAL_INFO_REQUEST_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: INDIVIDUAL_INFO_REQUEST_FAIL, payload: error.response });
      });
  };
};
