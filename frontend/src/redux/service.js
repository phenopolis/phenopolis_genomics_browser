import api from './api';
import axios from 'axios';

function getStatistics() {
  return axios.get(api.STATISTICS, {
    withCredentials: true,
  });
}

function getSearchAutocomplete(param) {
  const limit = param.component === 'searchAutoComplete' ? '' : '&limit=1000';
  return axios.get(
    api.SEARCH_AUTOCOMPLETE + param.query + '?query_type=' + param.query_type + limit,
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
  // var previewURL = api.BASE_URL + param + api.FETCH_PREVIEW

  if (/variant/.test(param)) {
    var previewURL = api.BASE_URL + '/variant/preview/' + param.split('/').slice(-1)[0];
  } else {
    var previewURL = api.BASE_URL + param + api.FETCH_PREVIEW;
  }
  console.log(previewURL);
  return axios.get(previewURL, {
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

function getGene(param) {
  return axios.get(api.GENE + param, {
    withCredentials: true,
  });
}

function getVariant(param) {
  return axios.get(api.VARIANT + param, {
    withCredentials: true,
  });
}

function getHPO(param) {
  return axios.get(api.HPO + param, {
    withCredentials: true,
  });
}

function createIndividual(data) {
  return axios.post(api.CREATE_INDIVIDUAL, data, {
    withCredentials: true,
  });
}

function getIndividualInformation(param) {
  return axios.get(api.INDIVIDUAL + param, {
    withCredentials: true,
  });
}

function getAllIndividual(param) {
  return axios.get(api.FETCH_ALL_INDIVIDUAL, {
    withCredentials: true,
  });
}

function updateOneIndividual(param) {
  console.log(param);
  return axios.post(api.UPDATE_INDIVIDUAL + param.patient_id, param.data, {
    withCredentials: true,
  });
}

function deleteOneIndividual(param) {
  console.log(param);
  return axios.delete(api.DELETE_INDIVIDUAL + param, {
    withCredentials: true,
  });
}

function getAllUser() {
  return axios.get(api.FETCH_ALL_USER, {
    withCredentials: true,
  });
}

function getOneUser(param) {
  return axios.get(api.FETCH_ONE_USER + param, {
    withCredentials: true,
  });
}

function getAllPatients() {
  return axios.get(api.FETCH_ALL_PATIENT, {
    withCredentials: true,
  });
}

function createUser(data) {
  return axios.post(api.CREATE_USER, data, {
    withCredentials: true,
  });
}

function addUserIndividual(data) {
  return axios.post(api.ADD_USER_INDIVIDUAL, data, {
    withCredentials: true,
  });
}

function deleteUserIndividual(mydata) {
  console.log(mydata);
  return axios.delete(
    api.DELETE_USER_INDIVIDUAL,
    { data: mydata },
    {
      withCredentials: true,
    }
  );
}

function enableUser(param) {
  return axios.put(api.ENABLE_USER + param.id + '/enabled/' + param.status, {
    withCredentials: true,
  });
}

function changePassword(data) {
  return axios.post(api.CHANGE_PASSWORD, data, {
    withCredentials: true,
  });
}

function confirmRegistration(token) {
  return axios.get(api.CONFIRM_REGISTRATION + token, {
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
  getGene,
  getVariant,
  getHPO,
  getIndividualInformation,
  createIndividual,
  getAllIndividual,
  updateOneIndividual,
  deleteOneIndividual,
  getAllUser,
  getOneUser,
  getAllPatients,
  createUser,
  addUserIndividual,
  deleteUserIndividual,
  enableUser,
  changePassword,
  confirmRegistration,
};
