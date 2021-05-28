import {
  CREATE_INDIVIDUA_REQUEST,
  CREATE_INDIVIDUA_SUCCESS,
  CREATE_INDIVIDUA_FAIL,
  FETCH_INDIVIDUA_REQUEST,
  FETCH_INDIVIDUA_SUCCESS,
  FETCH_INDIVIDUA_FAIL,
  UPDATE_INDIVIDUA_REQUEST,
  UPDATE_INDIVIDUA_SUCCESS,
  UPDATE_INDIVIDUA_FAIL,
  UPDATE_INDIVIDUA_RESET,
  DELETE_INDIVIDUA_REQUEST,
  DELETE_INDIVIDUA_SUCCESS,
  DELETE_INDIVIDUA_FAIL,
  DELETE_INDIVIDUA_RESET,
} from '../types/individuals';
import { SET_STATUS } from '../types/status';
import { SET_SNACK } from '../types/snacks';
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
            payload: { code: 401, message: 'UnAuthorised' },
          });
        } else if (error.response.status === 405) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: error.response.data.error },
          });
        }
        dispatch({ type: CREATE_INDIVIDUA_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const getAllIndividual = () => {
  return (dispatch) => {
    dispatch({ type: FETCH_INDIVIDUA_REQUEST });
    Service.getAllIndividual()
      .then((res) => {
        dispatch({ type: FETCH_INDIVIDUA_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: FETCH_INDIVIDUA_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const updateOneIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: UPDATE_INDIVIDUA_REQUEST });
    Service.updateOneIndividual(data)
      .then((res) => {
        dispatch({
          type: SET_SNACK,
          payload: { newMessage: data.patient_id + ' Updated Success.', newVariant: 'success' },
        });

        dispatch({ type: UPDATE_INDIVIDUA_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: UPDATE_INDIVIDUA_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetUpdate = (data) => {
  return (dispatch) => {
    dispatch({ type: UPDATE_INDIVIDUA_RESET });
  };
};

export const deleteOneIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: DELETE_INDIVIDUA_REQUEST });
    Service.deleteOneIndividual(data)
      .then((res) => {
        dispatch({
          type: SET_SNACK,
          payload: { newMessage: res.data.message, newVariant: 'success' },
        });

        dispatch({ type: DELETE_INDIVIDUA_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: DELETE_INDIVIDUA_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetDelete = (data) => {
  return (dispatch) => {
    dispatch({ type: DELETE_INDIVIDUA_RESET });
  };
};
