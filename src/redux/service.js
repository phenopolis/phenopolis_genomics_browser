import api from './api';
import axios from 'axios';

function getStatistics() {
  return axios.get(api.STATISTICS, {
    withCredentials: true,
  });
}

function getSearchAutocomplete(param) {
  console.log(param);
  return axios.get(
    api.SEARCH_AUTOCOMPLETE + param.query + '?query_type=' + param.query_type + '&limit=1000',
    {
      withCredentials: true,
    }
  );
}

function getSearchBest(param) {
  return axios.get(api.SEARCH_BEST_GUESS + param, {
    withCredentials: true,
  });
}

function getPreviewInformation(param) {
  return axios.get(api.BASE_URL + param + api.FETCH_PREVIEW, {
    withCredentials: true,
  });
}

function login(data) {
  return axios.post(api.LOGIN, data, {
    withCredentials: true,
  });
}

function logout() {
  return axios.post(api.LOGOUT, {
    withCredentials: true,
  });
}

function isLoggedIn() {
  return axios.get(api.IS_LOGGED_IN, {
    withCredentials: true,
  });
}

function getPatients() {
  return axios.get(api.PATIENTS, {
    withCredentials: true,
  });
}

export default {
  getStatistics,
  getSearchAutocomplete,
  getSearchBest,
  getPreviewInformation,
  login,
  logout,
  isLoggedIn,
  getPatients,
};
