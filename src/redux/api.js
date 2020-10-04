const API_URL = '/api';

export default {
  BASE_URL: API_URL,
  STATISTICS: API_URL + '/statistics',
  SEARCH_AUTOCOMPLETE: API_URL + '/autocomplete/',
  SEARCH_BEST_GUESS: API_URL + '/best_guess/',
  FETCH_PREVIEW: '/preview',
  // Below are APIs related to login/logout
  LOGIN: API_URL + '/login',
  LOGOUT: API_URL + '/logout',
  IS_LOGGED_IN: API_URL + '/is_logged_in',
  PATIENTS: API_URL + '/hpo/HP:0000001',
  // Below are 4 APIs for 4 types of data
  GENE: API_URL + '/gene/',
  VARIANT: API_URL + '/variant/',
  HPO: API_URL + '/hpo/',
  INDIVIDUAL: API_URL + '/individual/',
  // Below are 4 APIs related to Patient(individual) CRUD action
  CREATE_INDIVIDUAL: API_URL + '/individual',
  FETCH_ALL_INDIVIDUAL: API_URL + '/individual?limit=100000',
  UPDATE_INDIVIDUAL: API_URL + '/update_patient_data/',
  DELETE_INDIVIDUAL: API_URL + '/individual/',
};
