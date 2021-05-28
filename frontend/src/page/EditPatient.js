import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CssBaseline, Typography, Box, Container, Divider } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getIndividualInformation } from '../redux/actions/individual';

import InformationUpdate from '../components/EditPatient/InformationUpdate';
import FileUpload from '../components/EditPatient/FileUpload';
import PatientDelete from '../components/EditPatient/PatientDelete';

const EditPatient = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    dispatch(getIndividualInformation(props.match.params.individualId));
  }, [location]);

  let { individualInfo, loaded, error } = useSelector((state) => ({
    individualInfo: state.Individual.data[0],
    loaded: state.Individual.loaded,
    error: state.Individual.error,
  }));

  useEffect(() => {
    if (loaded) {
      console.log(individualInfo);
    }
  }, [loaded]);

  const handleActionSuccess = (action) => {
    if (action === 'update') {
      dispatch(getIndividualInformation(props.match.params.individualId));
    } else if (action === 'delete') {
      history.push('/dashboard');
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <div className="individual-container" style={{ minHeight: '83vh' }}>
        <Container maxWidth="md">
          <Typography component="div">
            <Box fontWeight="900" fontSize="h4.fontSize" mb={2}>
              {'Edit Patient '}
              <span style={{ color: '#f2cc8f' }}> {props.match.params.individualId}</span>
            </Box>
          </Typography>

          {loaded ? (
            <div id="info">
              <InformationUpdate
                userInfo={individualInfo.metadata.data[0]}
                actionSuccess={(action) => handleActionSuccess(action)}
              />
              <div className="mt-5 mb-5" id="file" />
              <FileUpload Patient_ID={props.match.params.individualId} />
              <div className="mt-5 mb-5" id="delete" />
              <PatientDelete
                Patient_ID={props.match.params.individualId}
                actionSuccess={(action) => handleActionSuccess(action)}
              />
            </div>
          ) : (
            <div>
              <Skeleton variant="rect" height={450} />
              <div className="mt-5 mb-5" />
              <Skeleton variant="rect" height={550} />
              <div className="mt-5 mb-5" />
              <Skeleton variant="rect" height={200} />
            </div>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: '#eeeee',
    opacity: 1,
    flexGrow: 1,
  },
}));

export default EditPatient;
