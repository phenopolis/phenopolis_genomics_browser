import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useDispatch, useSelector } from 'react-redux';
import { getOneUser, enableUser, ResetEnableUser } from '../../redux/actions/user';

import { Grid, Card, Tooltip, Tabs, Tab, Typography } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNurse, faCheckCircle, faTimesCircle } from '@fortawesome/pro-solid-svg-icons';

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

  const listItems = [
    { name: 'Email', key: 'email' },
    { name: 'Full Name', key: 'full_name' },
    { name: 'Enabled', key: 'enabled' },
    { name: 'Confirmed', key: 'confirmed' },
    { name: 'Registered On', key: 'registered_on' },
    { name: 'Confirmed On', key: 'confirmed_on' },
  ];

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
        <Card className="card-box">
          <div className="p-4">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <div className="text-center pt-4 pb-2">
                  <div className="avatar-icon-wrapper rounded-circle m-0">
                    <div className="bg-white border-primary border-2 text-center text-primary font-size-xl d-80 rounded-circle py-1 mb-3 mt-3 mb-sm-0">
                      <FontAwesomeIcon icon={faUserNurse} style={{ fontSize: '40' }} />
                    </div>
                  </div>
                  <h3 className="font-weight-bold mt-3">{oneUserInfo.user}</h3>
                  <Grid container direction="row" justify="center" alignItems="center">
                    <div style={{ marginRight: '10px' }}>
                      {oneUserInfo.enabled ? (
                        <Tooltip title="Click to Disable this User">
                          <span
                            className="mt-2 text-success font-size-md px-4 py-1 h-auto badge badge-neutral-success"
                            onClick={handleEnableUser}
                            style={{ cursor: 'pointer' }}>
                            &nbsp;Enabled&nbsp;
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Click to Enable this User">
                          <span
                            className="mt-2 text-danger font-size-md px-4 py-1 h-auto badge badge-neutral-danger"
                            onClick={handleEnableUser}
                            style={{ cursor: 'pointer' }}>
                            &nbsp;Disabled&nbsp;
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                      {oneUserInfo.confirmed ? (
                        <span className="mt-2 text-success font-size-md px-4 py-1 h-auto badge badge-neutral-success">
                          Confirmed
                        </span>
                      ) : (
                        <span className="mt-2 text-danger font-size-md px-4 py-1 h-auto badge badge-neutral-danger">
                          Unconfirmed
                        </span>
                      )}
                    </div>
                  </Grid>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className="font-size-sm py-3 rounded-sm">
                  {listItems.map((item, index) => {
                    return (
                      <div key={index} className="d-flex justify-content-between py-2">
                        <span className="font-weight-bold">{item.name}</span>
                        {oneUserInfo[item.key] === true ? (
                          <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                        ) : oneUserInfo[item.key] === false ? (
                          <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'red' }} />
                        ) : (
                          <span className="text-black-50">{oneUserInfo[item.key]}</span>
                        )}
                      </div>
                    );
                  })}
                  <div className="d-flex justify-content-between py-2">
                    <span className="font-weight-bold">No. Patients</span>
                    <span className="text-black-50"> {oneUserInfo.individuals.length} </span>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>

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
