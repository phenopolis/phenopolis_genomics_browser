import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  FormControlLabel,
  Card,
  Divider,
  Container,
  Typography,
  Box,
  RadioGroup,
  Radio,
  TextField,
  Button,
  Dialog,
  DialogActions,
  Paper,
  Collapse,
} from '@material-ui/core';

import { useDispatch, useSelector } from 'react-redux';
import { createNewUser, ResetCreate } from '../../redux/actions/user';
import { setSnack } from '../../redux/actions/snacks';

export default function CreateUser(props) {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ConfirmOpen, setConfirmOpen] = useState(false);

  const { newUserInfo, createLoaded } = useSelector((state) => ({
    newUserInfo: state.User.newUserInfo,
    createLoaded: state.User.createLoaded,
  }));

  useEffect(() => {
    if (createLoaded) {
      dispatch(setSnack('User Created!', 'success'));
      dispatch(ResetCreate());
      setUsername('');
      setPassword('');
      handleCloseDialog();
    }
  }, [createLoaded]);

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseDialog = () => {
    props.onClose();
  };

  const handleSubmitNewUser = () => {
    if (username === '') {
      dispatch(setSnack('User name can not be empty.', 'error'));
      return;
    }

    if (password === '') {
      dispatch(setSnack('Password can not be empty.', 'error'));
      return;
    }
    dispatch(createNewUser([{ user: username, argon_password: password }]));
  };

  return (
    <Fragment>
      <Card className="p-4">
        <div className="font-size-xl font-weight-bold">New User</div>
        <Divider className="my-4" />
        <Container>
          <Grid container direction="row" alignItems="center" justify="center" className="mb-2">
            <Grid item xs={3}>
              <Typography component="div">
                <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                  User Name
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                className="mt-0 mb-1 ml-4"
                id="standard-basic"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                error={username === ''}
                helperText={username === '' ? 'User name can not be Empty!' : ' '}
              />
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            alignItems="center"
            className="mt-4 mb-4"
            justify="center">
            <Grid item xs={3}>
              <Typography component="div">
                <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                  Password
                </Box>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                className="mt-0 mb-1 ml-4"
                id="standard-basic"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={password === ''}
                helperText={password === '' ? 'Password can not be Empty!' : ' '}
              />
            </Grid>
          </Grid>
        </Container>
        <DialogActions>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            disabled={ConfirmOpen}
            onClick={() => handleOpenConfirm()}>
            Save
          </Button>
          <Button color="primary" onClick={() => handleCloseDialog()}>
            Cancel
          </Button>
        </DialogActions>

        <Collapse in={ConfirmOpen}>
          <Paper
            elevation={5}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '1.5em',
              margin: '0.5em 0em',
            }}>
            <Grid container direction="row" justify="space-around" alignItems="center">
              <Grid item xs={6}>
                This action will add a new user, are you sure you want to do this?
              </Grid>
              <Grid item xs={6}>
                <Grid container direction="row" justify="flex-end" alignItems="center">
                  <Button
                    variant="outlined"
                    style={{ color: 'white', border: '1px solid white', 'margin-right': '1em' }}
                    onClick={() => setConfirmOpen(false)}>
                    Give up
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ color: 'white', border: '1px solid white' }}
                    onClick={() => handleSubmitNewUser()}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Card>
    </Fragment>
  );
}
