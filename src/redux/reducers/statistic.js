import { GET_STATISTICS, GET_STATISTICS_SUCCESS, GET_STATISTICS_FAIL } from '../types/statistic';

const initialState = {
    data: {
        exac_variants: null,
        exomes: null,
        females: null,
        males: null,
        nonpass_variants: null,
        pass_variants: null,
        total_variants: null,
        unknowns: null,
        version_number: null,
    },
    loading: true
};

const Statistics = (state = initialState, action) => {
    switch (action.type) {
        case GET_STATISTICS: {
            return {
                ...state,
                loading: true
            };
        }
        case GET_STATISTICS_SUCCESS: {
            return {
                ...state,
                loading: false,
                data: action.payload.data
            };
        }
        case GET_STATISTICS_FAIL: {
            return {
                ...state,
                loading: false,
                data: action.payload.data
            };
        }
        default:
            return state;
    }
}

export default Statistics;