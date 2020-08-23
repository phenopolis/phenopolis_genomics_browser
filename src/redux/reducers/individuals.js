import {
  CREATE_INDIVIDUA_REQUEST,
  CREATE_INDIVIDUA_SUCCESS,
  CREATE_INDIVIDUA_FAIL,
} from '../types/individuals';

const initialState = {
  newPatientInfo: null,
  loading: false,
  error: false,
};

const Individuals = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_INDIVIDUA_REQUEST: {
      return {
        ...state,
        newPatientInfo: null,
        loading: true,
        error: false,
      };
    }
    case CREATE_INDIVIDUA_SUCCESS: {
      return {
        ...state,
        loading: false,
        newPatientInfo: action.payload.data,
      };
    }
    case CREATE_INDIVIDUA_FAIL: {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    }
    default:
      return state;
  }
};

export default Individuals;
