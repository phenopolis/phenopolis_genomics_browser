import {
  GET_SEARCH_AUTOCOMPLETE,
  GET_SEARCH_AUTOCOMPLETE_SUCCESS,
  GET_SEARCH_AUTOCOMPLETE_FAIL,
  GET_SEARCH_BEST,
  GET_SEARCH_BEST_SUCCESS,
  GET_SEARCH_BEST_FAIL,
  CLEAR_SEARCH_BEST,
} from '../types/search';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getSearchAutocomplete = (params) => {
  return (dispatch) => {
    dispatch({ type: GET_SEARCH_AUTOCOMPLETE });
    Service.getSearchAutocomplete(params)
      .then((res) => {
        dispatch({ type: GET_SEARCH_AUTOCOMPLETE_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error },
          });
        }
        dispatch({ type: GET_SEARCH_AUTOCOMPLETE_FAIL, payload: { error: error.response } });
      });
  };
};

export const getSearchBest = (text) => {
  return (dispatch) => {
    dispatch({ type: GET_SEARCH_BEST });
    Service.getSearchBest(text)
      .then((res) => {
        dispatch({ type: GET_SEARCH_BEST_SUCCESS, payload: { best: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.message },
          });
        }
        dispatch({ type: GET_SEARCH_BEST_FAIL, payload: { error: error.response } });
      });
  };
};

export const clearSearchBest = () => {
  return (dispatch) => {
    dispatch({ type: CLEAR_SEARCH_BEST });
  };
};
