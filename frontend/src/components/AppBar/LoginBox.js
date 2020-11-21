import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Avatar, Button, CssBaseline, TextField, Typography, Container, Grid } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Trans } from 'react-i18next';
import { userLogin } from '../../redux/actions/auth';

const LoginBox = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const loginForm = {
      user: username,
      password: password,
    };
    dispatch(userLogin({ loginForm: loginForm, relink: props.redirectLink }));
  };

  const DemoLogin = (event) => {
    const loginForm = {
      user: 'demo',
      password: 'demo123',
    };
    dispatch(userLogin({ loginForm: loginForm, relink: props.redirectLink }));
  };

  const handleNameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleCloseDialog = () => {
    props.onClose();
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className="loginbox-paper">
        <Avatar className="loginbox-avatar" style={{ backgroundColor: '#fb8c00' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h6">
          {t('AppBar.LoginBox.title')}
        </Typography>

        <form className="loginbox-form" noValidate onSubmit={(event) => handleSubmit(event)}>
          <TextField
            className="loginbox-textfield"
            value={username}
            onChange={(event) => handleNameChange(event)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label={t('AppBar.LoginBox.Label_User_Name')}
            name="name"
            placeholder="demo"
            autoFocus
          />
          <TextField
            className="loginbox-textfield"
            value={password}
            onChange={(event) => handlePasswordChange(event)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            placeholder="demo123"
            label={t('AppBar.LoginBox.Label_Password')}
            type="password"
            id="password"
          />

          <Grid container className="mt-4 mb-2">
            <Grid item xs={6}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                {t('AppBar.LoginBox.Button')}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button color="default" fullWidth onClick={() => handleCloseDialog()}>
                Cancel
          </Button>
            </Grid>
          </Grid>



          <div style={{ textAlign: 'center' }}>
            <span className="loginBox-demolink-try">
              <Trans i18nKey="AppBar.LoginBox.Hint">
                Click
                <span className="loginBox-demolink" onClick={(event) => DemoLogin(event)}>
                  Demo Login
                </span>
                to have a try!
              </Trans>
            </span>
          </div>
        </form>
      </div>
    </Container >
  );
};

export default LoginBox;
