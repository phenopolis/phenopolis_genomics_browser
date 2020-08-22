import React from 'react';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton, Snackbar, SnackbarContent } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../../redux/actions/snacks';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const MySnackbarContentWrapper = (props) => {
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={`snackbar-${variant}`}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={'snackbar-message'}>
          <Icon className={'snackbar-icon snackbar-iconVariant'} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
          <CloseIcon className={'snackbar-icon'} />
        </IconButton>,
      ]}
      {...other}
    />
  );
};

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

// **************************************************************

const CustomizedSnackbars = () => {
  const dispatch = useDispatch();
  const { reduxSnackMessage, reduxSnackVariant } = useSelector((state) => ({
    reduxSnackMessage: state.snacks.snackMessage,
    reduxSnackVariant: state.snacks.snackVariant,
  }));
  const handleClose = () => {
    dispatch(setMessage(''));
  };
  return (
    <Snackbar
      style={{ zIndex: 100000000 }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={reduxSnackMessage !== ''}
      autoHideDuration={6000}
      onClose={handleClose}>
      <MySnackbarContentWrapper
        onClose={handleClose}
        variant={reduxSnackVariant}
        message={reduxSnackMessage}
      />
    </Snackbar>
  );
};

export default CustomizedSnackbars;
