import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, CssBaseline, TextField, Typography, Container } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Trans } from 'react-i18next';
import { login } from '../../redux/actions/auth';
import { setSnack } from '../../redux/actions/snacks';
import i18next from 'i18next';

const LoginBox = (props) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { error, user } = useSelector((state) => ({
    user: state.Login.data,
    error: state.Login.error,
  }));
  const qs = require('querystring');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
  }, [username, password])

  useEffect(() => {
    if(error) {
      dispatch(setSnack(i18next.t('HomePage.HomeBanner.login_fail'), 'error'));
    }
  }, [dispatch, error, user]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const loginData = {
      user: username,
      password: password,
    };


    dispatch(login(loginData));
  };

  const handleNameChange = (event) => {
    setUsername(event.target.value)
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  };

  const DemoLogin = (event) => {
    const loginData = {
      user: 'demo',
      password: 'demo123',
    };

    dispatch(login(loginData));
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className='loginbox-paper'>
        <Avatar className='loginbox-avatar'>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h6">
          {t('AppBar.LoginBox.title')}
        </Typography>

        <form className='loginbox-form' noValidate onSubmit={(event) => handleSubmit(event)}>
          <TextField
            className='loginbox-textfield'
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
            className='loginbox-textfield'
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className='loginbox-submit'
            style={{ backgroundColor: '#2E84CF', color: 'white' }}>
            {t('AppBar.LoginBox.Button')}
          </Button>
          <div style={{ textAlign: 'center' }}>
              <span className='loginBox-demolink-try' onClick={(event) => DemoLogin(event)}>
                <Trans i18nKey="AppBar.LoginBox.Hint">
                  Click{' '}
                  <span>
                    {' '}
                    Demo Login
                  </span>{' '}
                  to have a try!
                </Trans>
              </span>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default LoginBox;