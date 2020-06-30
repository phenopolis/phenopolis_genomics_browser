import { GET_STATISTICS, GET_STATISTICS_SUCCESS, GET_STATISTICS_FAIL } from '../types/statistic';
import Service from '../service';

export const getStatistics = () => {
  return (dispatch) => {
    dispatch({ type: GET_STATISTICS });
    Service.getStatistics()
      .then((res) => {
        dispatch({ type: GET_STATISTICS_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_STATISTICS_FAIL, payload: error.response });
      });
  };
};
