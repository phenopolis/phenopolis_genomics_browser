import {
  INDIVIDUAL_INFO_REQUEST,
  INDIVIDUAL_INFO_REQUEST_FAIL,
  INDIVIDUAL_INFO_REQUEST_SUCCESS,
} from '../types/individual';

const initialState = {
  data: {},
  error: false,
  loading: true,
};

const IndividualInformation = (state = initialState, action) => {
  switch (action.type) {
    case INDIVIDUAL_INFO_REQUEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case INDIVIDUAL_INFO_REQUEST_SUCCESS: {
      return {
        ...state,
        data: action.payload.data,
        loading: false,
      };
    }
    case INDIVIDUAL_INFO_REQUEST_FAIL: {
      return {
        ...state,
        error: action.payload.status,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default IndividualInformation;
