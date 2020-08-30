import { GET_GENE, GET_GENE_SUCCESS, GET_GENE_FAIL } from '../types/gene';
import Service from '../service';

export const getGene = (param) => {
  return (dispatch) => {
    dispatch({ type: GET_GENE });
    Service.getGene(param)
      .then((res) => {
        console.log(res);
        dispatch({ type: GET_GENE_SUCCESS, payload: res });
      })
      .catch((error) => {
        dispatch({ type: GET_GENE_FAIL, payload: error.response });
      });
  };
};
