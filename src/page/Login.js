import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import { connect } from 'react-redux';
import { setUser } from '../redux/actions';
import { getUsername } from '../redux/selectors';

import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Typography, Container, Paper,
         Box } from '@material-ui/core';

import LoginBox from '../components/AppBar/LoginBox';

class Login extends React.Component {
  getReduxName() {
    return this.props.reduxName;
  }

  render() {
    const { classes } = this.props;

    return (
      <>
        <CssBaseline />
        {this.props.reduxName === '' ? (
          <LoginBox onLoginSuccess={() => {}}>/</LoginBox>
        ) : (
          <div className={classes.root}>
            <Container maxWidth='md'>
              <Paper className={classes.paper2}>
                <Typography component='div'>
                  <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
                    You have logge in.
                  </Box>
                  <Box fontWeight='fontWeightLight' m={1}>
                    If you want to log out, click Account Icon on the top right
                    of the page.
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
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '4em'
  },
  paper2: {
    padding: theme.spacing(5)
  }
});

const mapStateToProps = state => ({ reduxName: getUsername(state) });
export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { setUser }
  )
)(Login);
