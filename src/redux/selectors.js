export const getUserState = (store) => store.users;
export const getSnackState = (store) => store.snacks;

export const getUsername = (store) => (getUserState(store) ? getUserState(store).username : '');

export const getSnackMessage = (store) =>
  getSnackState(store) ? getSnackState(store).snackMessage : '';

export const getSnackVariant = (store) =>
  getSnackState(store) ? getSnackState(store).snackVariant : '';
