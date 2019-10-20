import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import { IconButton, Snackbar, SnackbarContent, withWidth } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { getSnackMessage, getSnackVariant } from '../redux/selectors';

import { setMessage } from '../redux/actions';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

// **************************************************************

class CustomizedSnackbars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  handleClose = () => {
    this.props.setMessage("");
  }
  render() {
    const { classes } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={this.props.reduxSnackMessage !== ''}
        autoHideDuration={6000}
        onClose={this.handleClose}
      >
        <MySnackbarContentWrapper
          onClose={this.handleClose}
          variant={this.props.reduxSnackVariant}
          message={this.props.reduxSnackMessage}
        />
      </Snackbar>
      // <MySnackbarContentWrapper
      //   variant="error"
      //   className={classes.margin}
      //   message="This is an error message!"
      // />
      // <MySnackbarContentWrapper
      //   variant="warning"
      //   className={classes.margin}
      //   message="This is a warning message!"
      // />
      // <MySnackbarContentWrapper
      //   variant="info"
      //   className={classes.margin}
      //   message="This is an information message!"
      // />
      // <MySnackbarContentWrapper
      //   variant="success"
      //   className={classes.margin}
      //   message="This is a success message!"
      // />
    );
  }
}

CustomizedSnackbars.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired
};

const styles = (theme) => ({
  margin: {
    margin: theme.spacing(1),
  }
})

const mapStateToProps = (state) => ({ reduxSnackMessage: getSnackMessage(state), reduxSnackVariant: getSnackVariant(state) });
export default compose(connect(null, { setMessage }), withStyles(styles), withWidth(), connect(mapStateToProps, {}))(CustomizedSnackbars);


// **************************************************************