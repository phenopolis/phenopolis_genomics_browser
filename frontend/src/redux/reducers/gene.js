import { GET_GENE, GET_GENE_SUCCESS, GET_GENE_FAIL } from '../types/gene';

const initialState = {
  data: [],
  loaded: false,
  error: false,
};

const Gene = (state = initialState, action) => {
  switch (action.type) {
    case GET_GENE: {
      return {
        ...state,
        loaded: false,
        error: false,
      };
    }
    case GET_GENE_SUCCESS: {
      return {
        ...state,
        loaded: true,
        data: action.payload.data,
      };
    }
    case GET_GENE_FAIL: {
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

export default Gene;
