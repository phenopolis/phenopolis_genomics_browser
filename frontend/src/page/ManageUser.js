import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUser } from '../redux/actions/user';

import { Container, Dialog } from '@material-ui/core';

import Loading from '../components/General/Loading';
import UserList from '../components/ManageUser/UserList';
// const VirtualGrid = React.lazy(() => import('../components/Table/VirtualGrid'));

const ManageUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUser());
  }, []);

  const { allUserInfo, fetchLoaded, createLoaded } = useSelector((state) => ({
    allUserInfo: state.User.allUserInfo,
    fetchLoaded: state.User.fetchLoaded,
    createLoaded: state.User.createLoaded,
  }));

  useEffect(() => {
    if (createLoaded) {
      dispatch(getAllUser());
    }
  }, [createLoaded]);

  return (
    <>
      <CssBaseline />
      <div className="myPatients-container">
        {fetchLoaded ? (
          <>
            <Container maxWidth="xl">
              <UserList userlist={allUserInfo} />
            </Container>
          </>
        ) : (
          <Loading message={"Fetching all User' information..."} />
        )}
      </div>
    </>
  );
};

export default ManageUser;
