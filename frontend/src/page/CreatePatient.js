import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';

import NewPatient from '../components/CreatePatient/NewPatient';
import { Container } from '@material-ui/core';

const Dashboard = () => {
  return (
    <>
      <CssBaseline />
      <div className="myPatients-container">
        <Container maxWidth="lg">
          <NewPatient />
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
