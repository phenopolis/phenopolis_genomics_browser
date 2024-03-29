import React from 'react';
import NoLoginBar from '../components/AppBar/NoLoginBar';
import LoginBar from '../components/AppBar/LoginBar';
import { useSelector } from 'react-redux';

const HomeAppBar = (props) => {
  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));

  return (
    <div>
      {username === '' ? (
        <NoLoginBar> {props.children} </NoLoginBar>
      ) : (
        <LoginBar username={username}>{props.children}</LoginBar>
      )}
    </div>
  );
};

export default HomeAppBar;
