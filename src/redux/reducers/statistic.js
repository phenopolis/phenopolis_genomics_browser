import { GET_STATISTICS, GET_STATISTICS_SUCCESS, GET_STATISTICS_FAIL } from '../types/statistic';

const initialState = {
  data: null,
  loaded: false,
  error: false,
};

const Statistics = (state = initialState, action) => {
  switch (action.type) {
    case GET_STATISTICS: {
      return {
        ...state,
        data: null,
        loaded: false,
        error: false,
      };
    }
    case GET_STATISTICS_SUCCESS: {
      return {
        ...state,
        data: action.payload.data,
        loaded: true,
      };
    }
    case GET_STATISTICS_FAIL: {
      return {
        ...state,
        loaded: false,
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
};

export default Statistics;
