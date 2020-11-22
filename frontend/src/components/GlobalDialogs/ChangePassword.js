import React, { useState } from 'react';

import { useDispatch } from 'react-redux';
import { changePassword } from '../../redux/actions/user';

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Typography,
  Container,
  Grid,
} from '@material-ui/core';

import VpnKeyIcon from '@material-ui/icons/VpnKey';

const ChangePassword = (props) => {
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const PasswordForm = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    dispatch(changePassword(PasswordForm));
  };

  const handleCurrentPasswordChange = (event) => {
    setCurrentPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleCloseDialog = () => {
    props.onClose();
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className="loginbox-paper">
        <Avatar className="loginbox-avatar" style={{ backgroundColor: '#fb8c00' }}>
          <VpnKeyIcon />
        </Avatar>
        <Typography component="h1" variant="h6">
          Change Password
        </Typography>

        <form className="loginbox-form" noValidate onSubmit={(event) => handleSubmit(event)}>
          <TextField
            className="loginbox-textfield"
            value={currentPassword}
            onChange={(event) => handleCurrentPasswordChange(event)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label={'Current Password'}
            name="currentPassword"
            autoFocus
            type="password"
          />
          <TextField
            className="loginbox-textfield"
            value={newPassword}
            onChange={(event) => handleNewPasswordChange(event)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label={'New Password'}
            type="password"
          />

          <Grid container className="mt-4 mb-2">
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {'Submit'}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button color="default" fullWidth onClick={() => handleCloseDialog()}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};

export default ChangePassword;
