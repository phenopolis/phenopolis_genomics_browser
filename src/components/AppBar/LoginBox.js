import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import Cookies from 'universal-cookie';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import { Avatar, Button, CssBaseline, TextField, Typography, Container } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { setUser } from '../../redux/actions';
import { setSnack } from '../../redux/actions'

import axios from 'axios';

import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

const qs = require('querystring');

class LoginBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      redirect: false
    };
  }

  handleSubmit = event => {
    event.preventDefault();

    const cookies = new Cookies();

    const loginData = qs.stringify({
      name: this.state.name,
      password: this.state.password
    });

    axios
      .post('/api/login', loginData, { withCredentials: true })
      .then(res => {
        let respond = res.data;
        if (respond.success === 'Authenticated') {
          cookies.set('username', respond.username, {
            path: '/',
            // maxAge: 10
            maxAge: 60 * 60 * 2
            // maxAge: 86400 * 60 * 24 * 30
          });
          this.setState({ redirect: true });
          this.props.setUser(respond.username);

          this.props.setSnack(respond.username + i18next.t('AppBar.LoginBox.Login_Success'), "success")
          this.props.onLoginSuccess();
        } else {
          this.props.setSnack(i18next.t('AppBar.LoginBox.Login_Failed'), "error")
        }
      })
      .catch(err => {
        this.props.setSnack(i18next.t('AppBar.LoginBox.Login_Failed'), "error")

      });
  };

  handleNameChange = event => {
    this.setState({ name: event.target.value });
  };

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };

  DemoLogin = (event) => {
    this.setState({ name: 'demo', password: 'demo123' }, () => {
      this.handleSubmit(event)
    });
  }

  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;

    if (this.state.redirect) {
      return <Redirect to={this.props.redirectLink & this.props.redirectLink !== 'timeout' ? this.props.redirectLink : '/search'} />;
    }

    return (
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h6'>
            {t('AppBar.LoginBox.title')}
          </Typography>

          <form
            className={classes.form}
            noValidate
            onSubmit={this.handleSubmit}>
            <CssTextField
              className={classes.textfild}
              value={this.state.name}
              onChange={this.handleNameChange}
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='name'
              label={t('AppBar.LoginBox.Label_User_Name')}
              name='name'
              placeholder='demo'
              autoFocus
            />
            <CssTextField
              className={classes.textfild}
              value={this.state.password}
              onChange={this.handlePasswordChange}
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              placeholder='demo123'
              label={t('AppBar.LoginBox.Label_Password')}
              type='password'
              id='password'
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              className={classes.submit}
              style={{ backgroundColor: '#2E84CF', color: 'white' }}>
              {t('AppBar.LoginBox.Button')}
            </Button>
            <div style={{ textAlign: 'center', }}>
              <span style={{ color: 'grey' }}>
                <Trans i18nKey="AppBar.LoginBox.Hint">
                  Click <a className={classes.demolink} onClick={this.DemoLogin}> Demo Login</a> to have a try!
                </Trans>
              </span>
            </div>
          </form>
        </div>
      </Container>
    );
  }
}

LoginBox.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  paper: {
    margin: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  textfild: {
    color: '#2E84CF'
  },
  demolink: {
    '&:hover': {
      cursor: 'pointer',
      textShadow: '-0.06ex 0 grey, 0.06ex 0 grey',
      textDecoration: 'underline'
    }
  }
});

const CssTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: '#2E84CF'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'green'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'lightgray'
      },
      '&:hover fieldset': {
        borderColor: 'black'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2E84CF'
      }
    }
  }
})(TextField);

export default compose(
  withStyles(styles),
  connect(
    null,
    { setUser, setSnack }
  ),
  withTranslation()
)(LoginBox);
