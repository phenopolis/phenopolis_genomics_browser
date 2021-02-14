import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { Grid, Card, Container, Typography, Tabs, Tab } from '@material-ui/core';

import InformationForm from './InformationForm';

import svgImage1 from '../../assets/image/CreatePatient.png';

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

export default function NewPatient() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Fragment>
      <Card className="card-box">
        <Grid container direction="row" justify="center">
          <Grid item xs={12} lg={4}>
            <div className="p-5">
              <img alt="..." className="w-60 d-block img-fluid" src={svgImage1} />
              <h1 className="display-4 my-3 font-weight-bold">Create New Patient</h1>
              <p className="font-size-lg text-black ">
                Please follow the steps on the right tabs to finish new patient creation.
              </p>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                className="m-2 font-size-sm mb-3 text-black-50 text-left"
                style={{ paddingTop: '1em', color: 'darkgrey', whiteSpace: 'pre-wrap' }}>
                {'1. You may skip file upload step for now.\n' +
                  '2. Patient detail can be modified later.\n' +
                  '3. You may delete patient in Patient Management page.'}
              </Grid>
            </div>
          </Grid>
          <Grid item xs={12} lg={8}>
            <div
              className="bg-secondary"
              style={{ minHeight: '600px', borderLeft: '1px solid #eeeeee' }}>
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
                    {/* <Tab className="text-capitalize p-4" label="Files" /> */}
                  </Tabs>
                </div>
              </div>

              {value === 0 && (
                <TabContainer>
                  <InformationForm />
                </TabContainer>
              )}
            </div>
          </Grid>
        </Grid>
      </Card>
    </Fragment>
  );
}
