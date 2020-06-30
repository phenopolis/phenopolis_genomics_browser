import api from './api';
import axios from 'axios';

function getStatistics() {
  return axios.get(api.STATISTICS, {
    withCredentials: true,
  });
}

export default {
  getStatistics,
};
