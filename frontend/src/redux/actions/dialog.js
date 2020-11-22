import { SET_DIALOG } from '../types/dialog';

export const setDialog = (dialogName) => ({
  type: SET_DIALOG,
  payload: {
    dialogName: dialogName,
  },
});