import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';

import { useDispatch, useSelector } from 'react-redux';
import { setDialog } from '../../redux/actions/dialog';

import LoginBox from '../AppBar/LoginBox';
import CreateUser from '../ManageUser/CreatUser';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index && <div>{children}</div>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function GlobalDialogs() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [DialogTab, setDialogTab] = useState(0);

  const { dialogName } = useSelector((state) => ({
    dialogName: state.Dialog.dialogName,
  }));
  const handleClose = () => {
    dispatch(setDialog(false));
  };

  const handleDialogTabChange = (event, newValue) => {
    setDialogTab(newValue);
  };

  return (
    <div>
      <Dialog
        open={dialogName === 'Login/Register'}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <AppBar position="static" color="default">
          <Tabs
            value={DialogTab}
            onChange={handleDialogTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example">
            <Tab label="Log In" {...a11yProps(0)} />
            <Tab label="Register" {...a11yProps(1)} />
          </Tabs>
        </AppBar>

        <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={DialogTab}>
          <TabPanel value={DialogTab} index={0} dir={theme.direction}>
            <LoginBox onClose={handleClose} redirectLink={'/dashboard'} />
          </TabPanel>
          <TabPanel value={DialogTab} index={1} dir={theme.direction}>
            <CreateUser onClose={handleClose} />
          </TabPanel>
        </SwipeableViews>
      </Dialog>

      <Dialog
        open={dialogName === 'ChangePassword'}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous location data to
            Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
