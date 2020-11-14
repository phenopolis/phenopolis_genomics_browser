import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import StatisticPanel from '../components/Dashboard/StatisticPanel';
import AdminPanel from '../components/Dashboard/AdminPanel';
import AccountPanel from '../components/Dashboard/AccountPanel';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));

  return (
    <>
      <CssBaseline />
      <div className="myPatients-container">
        <StatisticPanel />
        <AccountPanel />
        {username === 'Admin' ? <AdminPanel /> : null}
      </div>
    </>
  );
};

export default Dashboard;
