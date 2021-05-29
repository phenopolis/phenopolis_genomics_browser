import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmRegistration, ResetConfirmRegistration } from '../redux/actions/user';

import { Container, Paper, Typography, Box } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

export default function ConfirmPage() {
  const dispatch = useDispatch();

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);

  const { confirmResult, confirmLoaded, confirmError } = useSelector((state) => ({
    confirmResult: state.User.confirmResult,
    confirmLoaded: state.User.confirmLoaded,
    confirmError: state.User.confirmError,
  }));

  useEffect(() => {
    let token = window.location.pathname.split('/').slice(-1)[0];
    dispatch(confirmRegistration(token));
  }, []);

  useEffect(() => {
    if (confirmError) {
      setStatus('Failed');
      setMessage(confirmError.message);
    }
    if (confirmLoaded) {
      setStatus('Success');
      setMessage(confirmResult.message);
    }

    dispatch(ResetConfirmRegistration());
  }, [confirmLoaded, confirmError]);

  return (
    <Fragment>
      <div className={'login-root'}>
        <Container maxWidth="md">
          {status !== null ? (
            <Paper className={'login-paper2'}>
              <Typography component="div">
                <Box fontWeight="900" fontSize="h4.fontSize" m={1}>
                  Confirm Registration {status}
                </Box>
                <Box fontWeight="fontWeightLight" m={1}>
                  {message}
                </Box>
              </Typography>
            </Paper>
          ) : (
            <Skeleton height={300} />
          )}
        </Container>
      </div>
    </Fragment>
  );
}
