import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardMedia } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsersMedical,
  faUsersClass,
  faUserPlus,
  faUsers,
  faSitemap,
} from '@fortawesome/pro-solid-svg-icons';

const AdminPanel = (props) => {
  const adminActions = [
    {
      name: 'Create New Patient',
      sub: 'You can create a new patient here.',
      icon: faUsersMedical,
      color: '#ffc107',
      to: '/create_patient',
    },
    {
      name: 'Manage Patients',
      sub: 'View/Delete all Patients.',
      icon: faUsersClass,
      color: '#43a047',
      to: '/manage_patient',
    },
    {
      name: 'Create New Acount',
      sub: 'You may create a new user/account for this website.',
      icon: faUserPlus,
      color: '#ffc107',
      to: '/dashboard',
    },
    {
      name: 'Manage Accounts',
      sub: 'View/Delete all User/Account.',
      icon: faUsers,
      color: '#43a047',
      to: '/dashboard',
    },
    {
      name: 'Assign User/Patient',
      sub: 'Assign Patient to Users(Doctors)',
      icon: faSitemap,
      color: '#2E84CF',
      to: '/dashboard',
    },
  ];

  return (
    <Fragment>
      <Card elevation={1} className="mb-5" style={{ border: '3px solid #d32f2f' }}>
        <CardMedia
          style={{
            padding: '0.3em 2em 0.3em 2em',
            borderBottom: '1px solid #eeeeee',
            backgroundColor: red[700],
          }}>
          <div className="text-white">
            <h2 className="display-4" style={{ fontWeight: '900' }}>
              Admin Panel
            </h2>
            <p className="font-size-md text-white-50"> Actions only avaliable for Admin </p>
          </div>
        </CardMedia>

        <div className="d-flex p-4 bg-secondary card-footer flex-wrap ">
          {adminActions.map((action, index) => {
            return (
              <div className="w-25 p-2">
                <Link to={action.to} style={{ textDecoration: 'none' }}>
                  <button className="btn card card-box d-flex align-items-center px-4 py-3 w-100 h-100 account-panel-button">
                    <div>
                      <FontAwesomeIcon
                        icon={action.icon}
                        style={{ fontSize: '25', color: action.color }}
                      />
                      <div className="font-weight-bold font-size-md text-black mt-3">
                        {action.name}
                      </div>
                      <div className="font-size-sm mb-1 text-black-50 mt-1">{action.sub}</div>
                    </div>
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      </Card>
    </Fragment>
  );
};

export default AdminPanel;
