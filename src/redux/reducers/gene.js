import { GET_GENE, GET_GENE_SUCCESS, GET_GENE_FAIL } from '../types/gene';

const initialState = {
  data: [],
  loading: true,
  error: false,
};

const Gene = (state = initialState, action) => {
  switch (action.type) {
    case GET_GENE: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_GENE_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    }
    case GET_GENE_FAIL: {
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

export default Gene;
