import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Grid, IconButton, Button, Tooltip } from '@material-ui/core';

import Loading from '../components/General/Loading';

export default function ConfirmPage() {
  return (
    <Fragment>
      <Loading message={'Confirming User Registration'} />
    </Fragment>
  );
}
