import {
  GET_SEARCH_AUTOCOMPLETE,
  GET_SEARCH_AUTOCOMPLETE_SUCCESS,
  GET_SEARCH_AUTOCOMPLETE_FAIL,
  GET_SEARCH_BEST,
  GET_SEARCH_BEST_SUCCESS,
  GET_SEARCH_BEST_FAIL,
  CLEAR_SEARCH_BEST,
} from '../types/search';
import Service from '../service';

export const getSearchAutocomplete = (text) => {
  return (dispatch) => {
    dispatch({ type: GET_SEARCH_AUTOCOMPLETE });
    Service.getSearchAutocomplete(text)
      .then((res) => {
        dispatch({ type: GET_SEARCH_AUTOCOMPLETE_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_SEARCH_AUTOCOMPLETE_FAIL, payload: error.response });
      });
  };
};

export const getSearchBest = (text) => {
  return (dispatch) => {
    dispatch({ type: GET_SEARCH_BEST });
    Service.getSearchBest(text)
      .then((res) => {
        dispatch({ type: GET_SEARCH_BEST_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_SEARCH_BEST_FAIL, payload: error.response });
      });
  };
};

export const clearSearchBest = () => {
  return (dispatch) => {
    dispatch({ type: CLEAR_SEARCH_BEST });
  };
};
