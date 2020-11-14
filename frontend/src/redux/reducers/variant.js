import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';

const initialState = {
  data: [],
  loaded: false,
  error: false,
};

const Variant = (state = initialState, action) => {
  switch (action.type) {
    case GET_VARIANT: {
      return {
        ...state,
        loaded: false,
        error: false,
      };
    }
    case GET_VARIANT_SUCCESS: {
      return {
        ...state,
        loaded: true,
        data: action.payload.data,
      };
    }
    case GET_VARIANT_FAIL: {
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

export default Variant;
