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

const initialState = {
  // Below are states for fetch all patient
  allPatientInfo: null,
  fetchLoaded: false,
  fetchError: false,
  // Below are states for create new patient/indivitual
  newPatientInfo: null,
  createloaded: false,
  error: false,
  // Below are states for Update an existing patient
  updateLoaded: false,
  updateError: false,
  // Below are states for Delete an existing patient
  deleteLoaded: false,
  deleteError: false,
};

const Individuals = (state = initialState, action) => {
  switch (action.type) {
    // Below are 3 reducer for Create User
    case CREATE_INDIVIDUA_REQUEST: {
      return {
        ...state,
        newPatientInfo: null,
        createloaded: false,
        error: false,
      };
    }
    case CREATE_INDIVIDUA_SUCCESS: {
      return {
        ...state,
        createloaded: true,
        newPatientInfo: action.payload.data,
      };
    }
    case CREATE_INDIVIDUA_FAIL: {
      return {
        ...state,
        createloaded: false,
        error: action.payload,
      };
    }
    // Below are 3 reducer for Fetching User
    case FETCH_INDIVIDUA_REQUEST: {
      return {
        ...state,
        allPatientInfo: null,
        fetchLoaded: false,
        fetchError: false,
      };
    }
    case FETCH_INDIVIDUA_SUCCESS: {
      return {
        ...state,
        allPatientInfo: action.payload.data,
        fetchLoaded: true,
      };
    }
    case FETCH_INDIVIDUA_FAIL: {
      return {
        ...state,
        fetchLoaded: false,
        error: action.payload,
      };
    }
    // Below are 4 reducer for Update one User
    case UPDATE_INDIVIDUA_REQUEST: {
      return {
        ...state,
        updateLoaded: false,
        updateError: false,
      };
    }
    case UPDATE_INDIVIDUA_SUCCESS: {
      return {
        ...state,
        updateLoaded: true,
      };
    }
    case UPDATE_INDIVIDUA_FAIL: {
      return {
        ...state,
        updateLoaded: false,
        updateError: action.payload,
      };
    }
    case UPDATE_INDIVIDUA_RESET: {
      return {
        ...state,
        updateLoaded: false,
        updateError: false,
      };
    }
    // Below are 4 reducer for Update one User
    case DELETE_INDIVIDUA_REQUEST: {
      return {
        ...state,
        deleteLoaded: false,
        deleteError: false,
      };
    }
    case DELETE_INDIVIDUA_SUCCESS: {
      return {
        ...state,
        deleteLoaded: true,
      };
    }
    case DELETE_INDIVIDUA_FAIL: {
      return {
        ...state,
        deleteLoaded: false,
        deleteError: action.payload,
      };
    }
    case DELETE_INDIVIDUA_RESET: {
      return {
        ...state,
        deleteLoaded: false,
        deleteError: false,
      };
    }
    default:
      return state;
  }
};

export default Individuals;
