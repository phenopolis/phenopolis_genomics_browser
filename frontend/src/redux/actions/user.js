import {
  // Below are 4 actions to fetch all user information
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAIL,
  FETCH_USER_RESET,
  // Below are 4 actions to fetch one user information
  FETCH_ONE_USER_REQUEST,
  FETCH_ONE_USER_SUCCESS,
  FETCH_ONE_USER_FAIL,
  FETCH_ONE_USER_RESET,
  // Below are 4 actions to fetch all patient name
  FETCH_ALL_PATIENT_REQUEST,
  FETCH_ALL_PATIENT_SUCCESS,
  FETCH_ALL_PATIENT_FAIL,
  FETCH_ALL_PATIENT_RESET,
  // Below are 4 actions to create new user
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  CREATE_USER_RESET,
  // Below are 4 actions to enable user
  ENABLE_USER_REQUEST,
  ENABLE_USER_SUCCESS,
  ENABLE_USER_FAIL,
  ENABLE_USER_RESET,
  // Below are 4 reducers to change password
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  CHANGE_PASSWORD_RESET,
  // Below are 4 reducers for confirm user registration
  CONFIRM_REGISTRATION_REQUEST,
  CONFIRM_REGISTRATION_SUCCESS,
  CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_RESET,
  // Below are 4 reducers for delete user
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  DELETE_USER_RESET,
} from '../types/user';

import { SET_STATUS } from '../types/status';
import { SET_SNACK } from '../types/snacks';
import { SET_DIALOG } from '../types/dialog';
import Service from '../service';
import { DELETE_USER_INIDIVIDUAL_REQUEST } from '../types/userIndividual';

export const getAllUser = () => {
  return (dispatch) => {
    dispatch({ type: FETCH_USER_REQUEST });
    Service.getAllUser()
      .then((res) => {
        dispatch({ type: FETCH_USER_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: FETCH_USER_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetFetch = () => {
  return (dispatch) => {
    dispatch({ type: FETCH_USER_RESET });
  };
};

export const getOneUser = (param) => {
  return (dispatch) => {
    dispatch({ type: FETCH_ONE_USER_REQUEST });
    Service.getOneUser(param)
      .then((res) => {
        dispatch({ type: FETCH_ONE_USER_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: FETCH_ONE_USER_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const getAllPatients = () => {
  return (dispatch) => {
    dispatch({ type: FETCH_ALL_PATIENT_REQUEST });
    Service.getAllPatients()
      .then((res) => {
        dispatch({ type: FETCH_ALL_PATIENT_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: FETCH_ALL_PATIENT_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const createNewUser = (data) => {
  return (dispatch) => {
    dispatch({ type: CREATE_USER_REQUEST });
    Service.createUser(data)
      .then((res) => {
        dispatch({ type: SET_DIALOG, payload: { dialogName: false } });
        dispatch({ type: CREATE_USER_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        } else if (error.response.status === 500) {
          dispatch({
            type: SET_SNACK,
            payload: {
              newMessage: 'Register Failed, maybe user(email) has exist.',
              newVariant: 'error',
            },
          });
        }
        dispatch({ type: CREATE_USER_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetCreate = () => {
  return (dispatch) => {
    dispatch({ type: CREATE_USER_RESET });
  };
};

export const enableUser = (param) => {
  return (dispatch) => {
    dispatch({ type: ENABLE_USER_REQUEST });
    Service.enableUser(param)
      .then((res) => {
        if (param.status === true) {
          dispatch({
            type: SET_SNACK,
            payload: { newMessage: 'User ' + param.id + ' enabled.', newVariant: 'success' },
          });
        } else {
          dispatch({
            type: SET_SNACK,
            payload: { newMessage: 'User ' + param.id + ' disabled.', newVariant: 'warning' },
          });
        }

        dispatch({ type: ENABLE_USER_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({ type: ENABLE_USER_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetEnableUser = () => {
  return (dispatch) => {
    dispatch({ type: ENABLE_USER_RESET });
  };
};

export const changePassword = (data) => {
  return (dispatch) => {
    dispatch({ type: CHANGE_PASSWORD_REQUEST });
    Service.changePassword(data)
      .then((res) => {
        dispatch({
          type: SET_SNACK,
          payload: { newMessage: 'Change Password Success.', newVariant: 'success' },
        });
        dispatch({ type: SET_DIALOG, payload: { dialogName: false } });

        dispatch({ type: CHANGE_PASSWORD_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_SNACK,
            payload: { newMessage: 'Change Password Failed.', newVariant: 'error' },
          });
        }
        dispatch({ type: CHANGE_PASSWORD_FAIL, payload: { error: error.response.data.error } });
      });
  };
};

export const ResetChangePassword = () => {
  return (dispatch) => {
    dispatch({ type: CHANGE_PASSWORD_RESET });
  };
};

export const confirmRegistration = (token) => {
  return (dispatch) => {
    dispatch({ type: CONFIRM_REGISTRATION_REQUEST });
    Service.confirmRegistration(token)
      .then((res) => {
        dispatch({ type: CONFIRM_REGISTRATION_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({
          type: CONFIRM_REGISTRATION_FAIL,
          payload: { error: error.response.data },
        });
      });
  };
};

export const ResetConfirmRegistration = () => {
  return (dispatch) => {
    dispatch({ type: CONFIRM_REGISTRATION_RESET });
  };
};

export const deleteUser = (param) => {
  return (dispatch) => {
    dispatch({ type: DELETE_USER_REQUEST });
    Service.deleteUser(param)
      .then((res) => {
        dispatch({ type: DELETE_USER_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        console.log(error.response);
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: 'UnAuthorised' },
          });
        }
        dispatch({
          type: DELETE_USER_FAIL,
          payload: { error: error.response.data },
        });
      });
  };
};

export const ResetDeleteUser = () => {
  return (dispatch) => {
    dispatch({ type: DELETE_USER_RESET });
  };
};
