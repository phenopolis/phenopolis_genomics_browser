import { SET_COMPACT } from '../types/tableStatus';

const initialState = {
  compact: false,
};

const TableStatus = (state = initialState, action) => {
  switch (action.type) {
    case SET_COMPACT: {
      return {
        ...state,
        compact: !state.compact,
      };
    }
    default:
      return state;
  }
};

export default TableStatus;
