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

const initialState = {
  // Below are states for adding new user individual relationship
  addUserInidividualInfo: null,
  addUserIndividualLoaded: false,
  addUserIndividualError: false,
  // Below are status for deleting user individual relationship
  deleteUserInidividualInfo: null,
  deleteUserIndividualLoaded: false,
  deleteUserIndividualError: false,
};

const UserIndividual = (state = initialState, action) => {
  switch (action.type) {
    // Below are 4 reducers for adding new user individual relationship
    case ADD_USER_INIDIVIDUAL_REQUEST: {
      return {
        ...state,
        addUserInidividualInfo: null,
        addUserIndividualLoaded: false,
        addUserIndividualError: false,
      };
    }
    case ADD_USER_INIDIVIDUAL_SUCCESS: {
      return {
        ...state,
        addUserInidividualInfo: action.payload.data,
        addUserIndividualLoaded: true,
      };
    }
    case ADD_USER_INIDIVIDUAL_FAIL: {
      return {
        ...state,
        addUserIndividualLoaded: false,
        addUserIndividualError: action.payload,
      };
    }
    case ADD_USER_INIDIVIDUAL_RESET: {
      return {
        ...state,
        addUserInidividualInfo: null,
        addUserIndividualLoaded: false,
        addUserIndividualError: false,
      };
    }
    // Below are 4 reducers for adding new user individual relationship
    case DELETE_USER_INIDIVIDUAL_REQUEST: {
      return {
        ...state,
        deleteUserInidividualInfo: null,
        deleteUserIndividualLoaded: false,
        deleteUserIndividualError: false,
      };
    }
    case DELETE_USER_INIDIVIDUAL_SUCCESS: {
      return {
        ...state,
        deleteUserInidividualInfo: action.payload.data,
        deleteUserIndividualLoaded: true,
      };
    }
    case DELETE_USER_INIDIVIDUAL_FAIL: {
      return {
        ...state,
        deleteUserIndividualLoaded: false,
        deleteUserIndividualError: action.payload,
      };
    }
    case DELETE_USER_INIDIVIDUAL_RESET: {
      return {
        ...state,
        deleteUserInidividualInfo: null,
        deleteUserIndividualLoaded: false,
        deleteUserIndividualError: false,
      };
    }
    default:
      return state;
  }
};

export default UserIndividual;
