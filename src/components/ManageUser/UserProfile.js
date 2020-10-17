import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { getOneUser, enableUser, ResetEnableUser } from '../../redux/actions/user';

import { Grid, IconButton, Card, Button, Tooltip, Tabs, Tab, Typography } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNurse } from '@fortawesome/pro-solid-svg-icons';

import AssignPatient from './AssignPatient';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }} className="bg-secondary">
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function UserProfile(props) {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState(0);

  const { oneUserInfo, fetchOneLoaded, enableUserLoaded } = useSelector((state) => ({
    oneUserInfo: state.User.oneUserInfo,
    fetchOneLoaded: state.User.fetchOneLoaded,
    enableUserLoaded: state.User.enableUserLoaded,
  }));

  const { addUserIndividualLoaded, deleteUserIndividualLoaded } = useSelector((state) => ({
    addUserIndividualLoaded: state.UserIndividual.addUserIndividualLoaded,
    deleteUserIndividualLoaded: state.UserIndividual.deleteUserIndividualLoaded,
  }));

  useEffect(() => {
    if (
      (addUserIndividualLoaded | deleteUserIndividualLoaded | enableUserLoaded) &
      (props.id !== null)
    ) {
      dispatch(getOneUser(props.id));
    }

    if (enableUserLoaded) {
      dispatch(ResetEnableUser());
    }
  }, [addUserIndividualLoaded, deleteUserIndividualLoaded, enableUserLoaded]);

  useEffect(() => {
    if (props.id !== null) {
      dispatch(getOneUser(props.id));
    }
  }, [props.id]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleEnableUser = () => {
    dispatch(enableUser({ id: props.id, status: !oneUserInfo.enabled }));
  };

  return (
    <Fragment>
      {fetchOneLoaded ? (
        <Card className="card-box mb-4">
          <div className="text-center pt-4 pb-2">
            <div className="avatar-icon-wrapper rounded-circle m-0">
              <div className="bg-white border-primary border-2 text-center text-primary font-size-xl d-80 rounded-circle py-1 mb-3 mt-3 mb-sm-0">
                <FontAwesomeIcon icon={faUserNurse} style={{ fontSize: '40' }} />
              </div>
            </div>
            <div>
              {oneUserInfo.enabled ? (
                <span
                  className="mt-2 text-success font-size-md px-4 py-1 h-auto badge badge-neutral-success"
                  onClick={handleEnableUser}
                  style={{ cursor: 'pointer' }}>
                  Enabled
                </span>
              ) : (
                <span
                  className="mt-2 text-danger font-size-md px-4 py-1 h-auto badge badge-neutral-danger"
                  onClick={handleEnableUser}
                  style={{ cursor: 'pointer' }}>
                  Disabled
                </span>
              )}
            </div>
            <h3 className="font-weight-bold mt-3">{oneUserInfo.user}</h3>
            <p className="mb-0 text-black-50">
              XXX <b>Hospital</b>
            </p>
            <div className="card-header">
              <Tabs
                TabIndicatorProps={{
                  style: {
                    height: '0px',
                  },
                }}
                value={value}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                onChange={handleChange}>
                <Tab className="text-capitalize" label="Assign Patients" />
                {/* <Tab className="text-capitalize" label="Change Password" /> */}
              </Tabs>
            </div>

            {value === 0 && (
              <TabContainer>
                <AssignPatient patients={oneUserInfo.individuals} id={props.id} />
              </TabContainer>
            )}
          </div>
        </Card>
      ) : (
        <Grid
          container
          spacing={0}
          alignItems="center"
          justify="center"
          style={{ minHeight: '50vh' }}>
          <span className="opacity-5 font-size-xxl font-weight-bold">
            Loading {props.id} Information...{' '}
          </span>
        </Grid>
      )}
    </Fragment>
  );
}
