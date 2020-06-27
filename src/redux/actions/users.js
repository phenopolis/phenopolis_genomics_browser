import {SET_USER} from "../types/users";

export const setUser = (newUsername) => ({
    type: SET_USER,
    payload: {
        newUsername,
    },
});