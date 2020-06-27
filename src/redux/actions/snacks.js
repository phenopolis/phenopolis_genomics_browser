import { SET_SNACK, SET_MESSAGE } from '../types/snacks';

export const setMessage = (newMessage) => ({
    type: SET_MESSAGE,
    payload: {
        newMessage,
    },
});

export const setSnack = (newMessage, newVariant) => ({
    type: SET_SNACK,
    payload: {
        newMessage,
        newVariant,
    },
});