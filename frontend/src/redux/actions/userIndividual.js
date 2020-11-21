import {
  // Below 4 reducers are for add user individual action
  ADD_USER_INIDIVIDUAL_REQUEST,
  ADD_USER_INIDIVIDUAL_SUCCESS,
  ADD_USER_INIDIVIDUAL_FAIL,
  ADD_USER_INIDIVIDUAL_RESET,
  // Below 4 reducers are for delete user individual action
  DELETE_USER_INIDIVIDUAL_REQUEST,
  DELETE_USER_INIDIVIDUAL_SUCCESS,
  DELETE_USER_INIDIVIDUAL_FAIL,
  DELETE_USER_INIDIVIDUAL_RESET,
} from '../types/userIndividual';

import { SET_STATUS } from '../types/status';
import { SET_SNACK } from '../types/snacks';
import Service from '../service';

export const addUserIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: ADD_USER_INIDIVIDUAL_REQUEST });
    Service.addUserIndividual(data)
      .then((res) => {
        dispatch({
          type: SET_SNACK,
          payload: { newMessage: data.length + ' patients added.', newVariant: 'success' },
        });
        dispatch({ type: ADD_USER_INIDIVIDUAL_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/manage_user' },
          });
        }
        dispatch({ type: ADD_USER_INIDIVIDUAL_FAIL, payload: { error: error.response } });
      });
  };
};

export const ResetAdd = () => {
  return (dispatch) => {
    dispatch({ type: ADD_USER_INIDIVIDUAL_RESET });
  };
};

export const deleteUserIndividual = (data) => {
  return (dispatch) => {
    dispatch({ type: DELETE_USER_INIDIVIDUAL_REQUEST });
    Service.deleteUserIndividual(data)
      .then((res) => {
        dispatch({
          type: SET_SNACK,
          payload: { newMessage: data.length + ' patients removed.', newVariant: 'warning' },
        });
        dispatch({ type: DELETE_USER_INIDIVIDUAL_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/manage_user' },
          });
        }
        dispatch({ type: DELETE_USER_INIDIVIDUAL_FAIL, payload: { error: error.response } });
      });
  };
};

export const ResetDelete = () => {
  return (dispatch) => {
    dispatch({ type: DELETE_USER_INIDIVIDUAL_RESET });
  };
};
