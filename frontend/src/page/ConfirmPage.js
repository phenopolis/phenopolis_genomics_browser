import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmRegistration } from '../redux/actions/user';

import { Grid, IconButton, Button, Tooltip } from '@material-ui/core';

import Loading from '../components/General/Loading';

export default function ConfirmPage() {

  const dispatch = useDispatch();

  useEffect(() => {
    let token = window.location.pathname.split('/').slice(-1)[0]
    dispatch(confirmRegistration(token));
  }, []);

  return (
    <Fragment>
      <Loading message={'Confirming User Registration'} />
    </Fragment>
  );
}
