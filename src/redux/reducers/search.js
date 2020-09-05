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
  best: [],
  loaded: true,
  error: false,
};

const Search = (state = initialState, action) => {
  switch (action.type) {
    case GET_SEARCH_AUTOCOMPLETE: {
      return {
        ...state,
        data: [],
        best: [],
        loaded: false,
        error: false,
      };
    }
    case GET_SEARCH_AUTOCOMPLETE_SUCCESS: {
      return {
        ...state,
        data: action.payload.data,
        loaded: true,
      };
    }
    case GET_SEARCH_AUTOCOMPLETE_FAIL: {
      return {
        ...state,
        loaded: true,
        error: action.payload.error,
      };
    }
    case GET_SEARCH_BEST: {
      return {
        ...state,
        data: [],
        best: [],
        loaded: false,
        error: false,
      };
    }
    case GET_SEARCH_BEST_SUCCESS: {
      return {
        ...state,
        best: action.payload.best,
      };
    }
    case GET_SEARCH_BEST_FAIL: {
      return {
        ...state,
        error: action.payload.error,
      };
    }
    case CLEAR_SEARCH_BEST: {
      return {
        ...state,
        data: [],
        best: [],
        loaded: false,
        error: false,
      };
    }
    default:
      return state;
  }
};

export default Search;
