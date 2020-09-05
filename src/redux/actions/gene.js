import { GET_GENE, GET_GENE_SUCCESS, GET_GENE_FAIL } from '../types/gene';
import { SET_STATUS } from '../types/status';
import Service from '../service';

export const getGene = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_GENE });
    Service.getGene(param)
      .then((res) => {
        dispatch({ type: GET_GENE_SUCCESS, payload: { data: res.data } });
      })
      .catch((error) => {
        if (error.response.status === 401) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 401, message: error.response.data.error, relink: '/gene/' + param },
          });
        } else if (error.response.status === 404) {
          dispatch({
            type: SET_STATUS,
            payload: { code: 404, message: error.response.data.message, relink: '/' },
          });
        }
        dispatch({ type: GET_GENE_FAIL, payload: { error: error.response } });
      });
  };
};
