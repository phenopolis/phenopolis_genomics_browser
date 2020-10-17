import React, { useState, useEffect, Fragment } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { getOneUser } from '../../redux/actions/user';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserNurse,
  faHospital,
  faUser,
  faTimes,
  faBan,
  faKey,
  faPlusSquare,
} from '@fortawesome/pro-solid-svg-icons';

import {
  Grid,
  Fab,
  IconButton,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  Tooltip,
  Divider,
  CardMedia,
  FormControlLabel,
  Switch,
  Dialog,
  Typography,
} from '@material-ui/core';

import CreateUser from './CreatUser';
import UserProfile from './UserProfile';

export default function UserList(props) {
  const [userID, setUserID] = useState('demo');
  const [open, setOpen] = useState(false);

  const handleClickAssignPatient = (id) => {
    console.log(id);
    setUserID(id);
  };

  const openDialog = () => {
    setOpen(!open);
  };

  return (
    <Fragment>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={4}>
          <Typography component="div">
            <Box fontWeight="900" fontSize="h4.fontSize" mb={0}>
              Manage All User Here
            </Box>
            <Box fontWeight="fontWeightLight" mb={2}>
              Here you can create/enable/update patient, like assign them patients.
            </Box>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faPlusSquare} />}
            style={{ backgroundColor: 'orange' }}
            onClick={() => openDialog()}>
            Create New User
          </Button>
          <Card className="card-box mb-2 mt-3">
            <CardMedia
              style={{
                padding: '0.3em 2em 0.3em 2em',
                borderBottom: '1px solid #eeeeee',
              }}>
              <div className="text-black">
                <h2 className="display-4" style={{ fontWeight: '900' }}>
                  User List ({props.userlist.length})
                </h2>
                <p className="font-size-md text-black-50">
                  {' '}
                  Here you can create/enable/update user, like assign them patients.{' '}
                </p>
              </div>
            </CardMedia>
            <CardContent className="p-0" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <List className="mb-0">
                {props.userlist.map((item, index) => {
                  return (
                    <>
                      {index !== 0 ? <Divider /> : null}
                      <ListItem className=" d-flex justify-content-between align-items-center py-2 border-0">
                        <div>
                          <div className="bg-white border-primary border-2 text-center text-primary font-size-xl d-40 rounded-circle mb-3 mb-sm-0">
                            <FontAwesomeIcon icon={faUserNurse} />
                          </div>
                        </div>
                        <div className="font-weight-bold flex-grow-1 ml-3">
                          <div className="text-second font-size-md">
                            {' '}
                            {item}
                            {item === 'Admin' ? (
                              <span className="text-danger ml-2 badge badge-neutral-danger">
                                Admin
                              </span>
                            ) : null}
                          </div>
                          <span className="opacity-4 font-size-sm">
                            <FontAwesomeIcon icon={faHospital} className="mr-1" />
                            <b className="pr-1">xxxx </b> Hospital
                          </span>
                        </div>
                        <div className="text-right">
                          <Tooltip arrow title="Assign Patients">
                            <IconButton
                              className="bg-white text-first d-40 rounded-circle p-0 ml-1"
                              onClick={() => handleClickAssignPatient(item)}>
                              <FontAwesomeIcon icon={faUser} className="font-size-md mx-auto" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </ListItem>
                    </>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={8}>
          <UserProfile id={userID} />
        </Grid>
      </Grid>

      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={() => openDialog()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <CreateUser onClose={() => openDialog()} />
      </Dialog>
    </Fragment>
  );
}
