import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUser } from '../redux/actions/user';

import { Container, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import UserList from '../components/ManageUser/UserList';

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
          <Grid container spacing={4}>
            <Grid item xs={12} lg={4}>
              <Skeleton height={50} width={200} />
              <Skeleton height={30} width={200} />
              <Skeleton variant="rect" height={550} />
            </Grid>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rect" height={550} />
            </Grid>
          </Grid>
        )}
      </div>
    </>
  );
};

export default ManageUser;
