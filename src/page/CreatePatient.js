import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';

import NewPatient from '../components/CreatePatient/NewPatient';

const Dashboard = () => {
  return (
    <>
      <CssBaseline />
      <div className="myPatients-container">
        <NewPatient />
      </div>
    </>
  );
};

export default Dashboard;
