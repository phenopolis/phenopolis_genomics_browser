import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Grid, Card, Typography, Tabs, Tab } from '@material-ui/core';

import InformationUpdate from './InformationUpdate';
import FileUpload from './FileUpload';
import PatientDelete from './PatientDelete';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default function NewPatient(props) {
  const [value, setValue] = React.useState(props.tabIndex);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Fragment>
      <Card className="card-box" elevation={0}>
        <Grid container direction="row" justify="center">
          <Grid item xs={12} lg={12}>
            <div className="bg-secondary">
              <div className="card-header py-0 pr-0 pl-4">
                <div className="card-header--actions">
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
                    <Tab className="text-capitalize p-4" label="Information" />
                    <Tab className="text-capitalize p-4" label="Files" />
                    <Tab className="text-capitalize p-4" label="Delete" />
                  </Tabs>
                </div>
              </div>

              {value === 0 && (
                <TabContainer>
                  <InformationUpdate
                    userInfo={props.userInfo}
                    actionSuccess={(action) => props.actionSuccess(action)}
                  />
                </TabContainer>
              )}
              {value === 1 && (
                <TabContainer>
                  <FileUpload />
                </TabContainer>
              )}
              {value === 2 && (
                <TabContainer>
                  <PatientDelete
                    Patient_ID={props.userInfo.internal_id[0].display}
                    actionSuccess={(action) => props.actionSuccess(action)}
                  />
                </TabContainer>
              )}
            </div>
          </Grid>
        </Grid>
      </Card>
    </Fragment>
  );
}
