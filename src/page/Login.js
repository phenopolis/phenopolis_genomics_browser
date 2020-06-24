import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { connect } from 'react-redux';
import { setUser } from '../redux/actions';
import { getUsername } from '../redux/selectors';

import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Typography, Container, Paper, Box } from '@material-ui/core';

import LoginBox from '../components/AppBar/LoginBox';

import { withTranslation, Trans } from 'react-i18next';
import i18next from 'i18next';

class Login extends React.Component {
  getReduxName() {
    return this.props.reduxName;
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;
    const query = new URLSearchParams(this.props.location.search);
    const mylink = query.get('link');

    return (
      <>
        <CssBaseline />
        {this.props.reduxName === '' ? (
          <div className={classes.root}>
            {query.get('link') ? (
              mylink === 'timeout' ? (
                <span>
                  {' '}
                  <b style={{ color: '#2E84CF' }}> Token Expired </b>, please re-login.
                </span>
              ) : (
                <Trans i18nKey="Login.redirectionLink">
                  <span>
                    {' '}
                    Oops, seems you don't have access to{' '}
                    <b style={{ color: '#2E84CF' }}> {{ mylink }} </b> yet, try login?
                  </span>
                </Trans>
              )
            ) : null}

            <LoginBox
              onLoginSuccess={() => {}}
              redirectLink={query.get('link') ? query.get('link') : null}>
              /
            </LoginBox>
          </div>
        ) : (
          <div className={classes.root}>
            <Container maxWidth="md">
              <Paper className={classes.paper2}>
                <Typography component="div">
                  <Box fontWeight="fontWeightBold" fontSize="h4.fontSize" m={1}>
                    {t('Login.login')}
                  </Box>
                  <Box fontWeight="fontWeightLight" m={1}>
                    {t('Login.login_subtitle')}
                  </Box>
                </Typography>
              </Paper>
            </Container>
          </div>
        )}
      </>
    );
  }
}

Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '4em',
    textAlign: 'center',
  },
  paper2: {
    padding: theme.spacing(5),
  },
});

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });
export default compose(
  withStyles(styles),
  connect(mapStateToProps, { setUser }),
  withTranslation()
)(Login);
