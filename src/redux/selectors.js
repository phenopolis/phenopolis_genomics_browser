export const getUserState = (store) => store.users;

export const getUsername = (store) => (getUserState(store) ? getUserState(store).username : '');
