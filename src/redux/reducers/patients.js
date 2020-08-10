import { GET_PATIENTS, GET_PATIENTS_SUCCESS, GET_PATIENTS_FAIL } from '../types/patients';

const initialState = {
  data: [],
  loading: true,
  error: false,
};

const Patients = (state = initialState, action) => {
  switch (action.type) {
    case GET_PATIENTS: {
      return {
        ...state,
        loading: true,
      };
    }
    case GET_PATIENTS_SUCCESS: {
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    }
    case GET_PATIENTS_FAIL: {
      return {
        ...state,
        loading: false,
        error: 'Something Went Wrong',
      };
    }
    default:
      return state;
  }
};

export default Patients;
