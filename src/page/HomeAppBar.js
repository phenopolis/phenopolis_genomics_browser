import React, { useEffect } from 'react';
import NoLoginBar from '../components/AppBar/NoLoginBar';
import LoginBar from '../components/AppBar/LoginBar';
import { useSelector } from 'react-redux';

const HomeAppBar = (props) => {

  const { username } = useSelector((state) => ({
    username: state.users.username,
  }));

  useEffect(() => {
  }, [username])

  return (
    <div>
      {/* <AppBar position="relative" className={classes.appbar}> */}
      {username === '' ? (
        <NoLoginBar> {props.children} </NoLoginBar>
      ) : (
        <LoginBar username={username}>{props.children}</LoginBar>
      )}
      {/* </AppBar> */}
    </div>
  );

}

export default HomeAppBar;