import {
  INDIVIDUAL_INFO_REQUEST,
  INDIVIDUAL_INFO_REQUEST_FAIL,
  INDIVIDUAL_INFO_REQUEST_SUCCESS,
} from '../types/individual';

const initialState = {
  data: [],
  loaded: false,
  error: false,
};

const IndividualInformation = (state = initialState, action) => {
  switch (action.type) {
    case INDIVIDUAL_INFO_REQUEST: {
      return {
        ...state,
        loaded: false,
        error: false,
      };
    }
    case INDIVIDUAL_INFO_REQUEST_SUCCESS: {
      return {
        ...state,
        loaded: true,
        data: action.payload.data,
      };
    }
    case INDIVIDUAL_INFO_REQUEST_FAIL: {
      return {
        ...state,
        loaded: false,
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default IndividualInformation;
