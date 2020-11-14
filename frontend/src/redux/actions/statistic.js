import { GET_STATISTICS, GET_STATISTICS_SUCCESS, GET_STATISTICS_FAIL } from '../types/statistic';
import Service from '../service';

export const getStatistics = () => {
  return (dispatch) => {
    dispatch({ type: GET_STATISTICS });
    Service.getStatistics()
      .then((res) => {
        console.log(res);
        dispatch({ type: GET_STATISTICS_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        console.log(error);
        dispatch({ type: GET_STATISTICS_FAIL, payload: { error: error.response } });
      });
  };
};
