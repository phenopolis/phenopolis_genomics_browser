import React, { Fragment } from 'react';

import { Card, CardMedia } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/pro-solid-svg-icons';

import { useDispatch } from 'react-redux';
import { setDialog } from '../../redux/actions/dialog';

const AccountPanel = (props) => {
  const dispatch = useDispatch();
  const actions = [{ name: 'Change Password', sub: 'You need to input your current password', icon: faKey, dialogName: 'ChangePassword' }];

  const handleTriggerDialog = (dialogName) => {
    dispatch(setDialog(dialogName));
  }

  return (
    <Fragment>
      <Card elevation={1} className="mb-5">
        <CardMedia style={{ padding: '0.3em 2em 0.3em 2em', borderBottom: '1px solid #eeeeee' }}>
          <div className="text-black">
            <h2 className="display-4" style={{ fontWeight: '900' }}>
              Account Panel
            </h2>
            <p className="font-size-md text-black-50"> Actions related to your account </p>
          </div>
        </CardMedia>

        <div className="d-flex p-4 bg-secondary card-footer flex-wrap ">
          {actions.map((action, index) => {
            return (
              <div className="w-25 p-2">
                <button className="btn card card-box d-flex align-items-center px-4 py-3 w-100 h-100 account-panel-button" onClick={() => handleTriggerDialog(action.dialogName)}>
                  <div>
                    <FontAwesomeIcon
                      icon={action.icon}
                      style={{ fontSize: '25', color: '#2E84CF' }}
                    />
                    <div className="font-weight-bold font-size-lg text-black mt-3">
                      {action.name}
                    </div>
                    <div className="font-size-sm mb-1 text-black-50 mt-1">{action.sub}</div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </Fragment>
  );
};

export default AccountPanel;
