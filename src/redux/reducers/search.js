import {
  GET_SEARCH_AUTOCOMPLETE,
  GET_SEARCH_AUTOCOMPLETE_SUCCESS,
  GET_SEARCH_AUTOCOMPLETE_FAIL,
  GET_SEARCH_BEST,
  GET_SEARCH_BEST_SUCCESS,
  GET_SEARCH_BEST_FAIL,
  CLEAR_SEARCH_BEST,
} from '../types/search';

const initialState = {
  data: [],
  best: {},
  loading: true,
  error: false,
};

const Search = (state = initialState, action) => {
  switch (action.type) {
    case GET_SEARCH_AUTOCOMPLETE: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_SEARCH_AUTOCOMPLETE_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    }
    case GET_SEARCH_AUTOCOMPLETE_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'Something Went Wrong',
      };
    }
    case GET_SEARCH_BEST: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_SEARCH_BEST_SUCCESS: {
      return {
        ...state,
        loading: false,
        best: action.payload.data,
      };
    }
    case GET_SEARCH_BEST_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'Something Went Wrong',
      };
    }
    case CLEAR_SEARCH_BEST: {
      return {
        ...state,
        loading: false,
        best: {},
      };
    }
    default:
      return state;
  }
};

export default Search;
