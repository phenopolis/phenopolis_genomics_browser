import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/actions/users';
import { isLoggedIn } from '../redux/actions/users';

const AuthCheck = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { error, data } = useSelector((state) => ({
    data: state.IsLoggedIn.data,
    username: state.users.username,
    error: state.IsLoggedIn.error,
  }));

  useEffect(() => {
    dispatch(isLoggedIn());
  }, []);

  useEffect(() => {
    if (data) {
      dispatch(setUser(data.username));
    }
  }, [dispatch, data]);

  useEffect(() => {
    if (error) {
      if (
        (window.location.pathname !== '/') &
        (window.location.pathname !== '/publications') &
        (window.location.pathname !== '/login') &
        (window.location.pathname !== '/about')

      ) {
        history.push(`/login?link=${window.location.pathname}`);
      }
    }
  }, [error, history])

  return <></>;
};

export default AuthCheck;
