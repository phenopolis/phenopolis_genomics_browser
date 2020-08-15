import { GET_VARIANT, GET_VARIANT_SUCCESS, GET_VARIANT_FAIL } from '../types/variant';

const initialState = {
  data: [],
  loading: true,
  error: false,
};

const Variant = (state = initialState, action) => {
  switch (action.type) {
    case GET_VARIANT: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_VARIANT_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    }
    case GET_VARIANT_FAIL: {
      return {
        ...state,
        loading: false,
        error: action.payload.status,
      };
    }
    default:
      return state;
  }
};

export default Variant;
