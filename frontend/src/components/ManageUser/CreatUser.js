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
  CssBaseline,
  Avatar,
} from '@material-ui/core';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { useDispatch, useSelector } from 'react-redux';
import { createNewUser, ResetCreate } from '../../redux/actions/user';
import { setSnack } from '../../redux/actions/snacks';

export default function CreateUser(props) {
  const dispatch = useDispatch();

  const listItems = [
    { name: 'User', key: 'user' },
    { name: 'Password', key: 'argon_password' },
    { name: 'Email', key: 'email' },
    { name: 'Full Name', key: 'full_name' },
  ];

  const [values, setValues] = useState({
    user: '',
    argon_password: '',
    email: '',
    full_name: '',
    confirmation_url: 'https://phenopolis.org/confirm',
  });

  const handleSetValue = (value, key) => {
    var newValues = { ...values };
    newValues[key] = value;
    setValues(newValues);
  };

  const [ConfirmOpen, setConfirmOpen] = useState(false);

  const { newUserInfo, createLoaded } = useSelector((state) => ({
    newUserInfo: state.User.newUserInfo,
    createLoaded: state.User.createLoaded,
  }));

  useEffect(() => {
    if (createLoaded) {
      dispatch(setSnack('User Created!', 'success'));
      dispatch(ResetCreate());
      handleCloseDialog();
    }
  }, [createLoaded]);

  const handleOpenConfirm = () => {
    if (
      Object.keys(values).some((x) => {
        return values[x] === '';
      })
    ) {
      dispatch(setSnack('You have empty value to fill.', 'error'));
    } else {
      setConfirmOpen(true);
    }
  };

  const handleCloseDialog = () => {
    props.onClose();
  };

  const handleSubmitNewUser = () => {
    dispatch(createNewUser(values));
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className="loginbox-paper">
        <Avatar className="loginbox-avatar" style={{ backgroundColor: '#fb8c00' }}>
          <AccountCircleIcon />
        </Avatar>
        <Typography component="h1" variant="h6">
          {'Register'}
        </Typography>

        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={12}>
            <div className="font-size-md py-3 rounded-sm">
              {listItems.map((item, index) => {
                return (
                  <TextField
                    className="loginbox-textfield"
                    value={values[item.key]}
                    onChange={(event) => handleSetValue(event.target.value, item.key)}
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label={item.name}
                    name="name"
                    placeholder="demo"
                    autoFocus
                    size="small"
                    type={item.name === 'Password' ? 'password' : null}
                    style={{ marginTop: '10px', marginBottom: '10px' }}
                  />
                );
              })}
            </div>
          </Grid>
        </Grid>

        <Grid container className="mt-4 mb-2">
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={ConfirmOpen}
              onClick={() => handleOpenConfirm()}>
              Create
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button color="default" fullWidth onClick={() => handleCloseDialog()}>
              Cancel
            </Button>
          </Grid>
        </Grid>

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
              <Grid item xs={7}>
                Thanks for joining Phenopolis. Please confirm your information.
              </Grid>
              <Grid item xs={5}>
                <Grid container direction="column" justify="center" alignItems="flex-end">
                  <Grid item style={{ marginBottom: '1em' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      style={{ color: 'white', border: '1px solid white' }}
                      onClick={() => handleSubmitNewUser()}>
                      Confirm
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      size="small"
                      color="secondary"
                      style={{ color: 'white', 'margin-right': '0.5em' }}
                      onClick={() => setConfirmOpen(false)}>
                      Give up
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </div>
    </Container>
  );
}
