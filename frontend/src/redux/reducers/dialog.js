import { SET_DIALOG } from '../types/dialog';

const initialState = {
  dialogName: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_DIALOG: {
      return {
        ...state,
        dialogName: action.payload.dialogName,
      };
    }
    default:
      return state;
  }
}
