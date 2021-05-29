import React, { useEffect } from 'react';
import { CssBaseline, Container, Typography, Box, Button } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import Loading from '../components/General/Loading';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/pro-solid-svg-icons';

import { useDispatch, useSelector } from 'react-redux';
import { getHPO } from '../redux/actions/hpo';

const VersatileTable = React.lazy(() => import('../components/BaseTable/VersatileTable'));

const MyPatient = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { hpoInfo, loaded } = useSelector((state) => ({
    hpoInfo: state.HPO.data[0],
    loaded: state.HPO.loaded,
  }));

  useEffect(() => {
    dispatch(getHPO('HP:0000001'));
  }, [dispatch]);

  return (
    <React.Fragment>
      <CssBaseline />
      <div className="myPatients-container">
        <Container maxWidth="xl">
          {loaded ? (
            <Typography component="div">
              <Box fontWeight="900" fontSize="h4.fontSize" mb={0}>
                {t('MyPatient.My_Patients') +
                  ' (' +
                  t('MyPatient.Total') +
                  ' ' +
                  hpoInfo.preview[0][1] +
                  ')'}
              </Box>
            </Typography>
          ) : (
            <Skeleton height={50} width={200} />
          )}

          {loaded ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlusSquare} />}
              style={{ backgroundColor: 'orange' }}
              component={Link}
              to="/create_patient">
              Create New Patient
            </Button>
          ) : (
            <Skeleton height={30} width={200} />
          )}

          {loaded ? (
            <VersatileTable tableData={hpoInfo.individuals} genomePlot={false} />
          ) : (
            <>
              <div className="mt-4 mb-4" />
              <Skeleton variant="rect" height={150} />
              <div className="mt-4 mb-4" />
              <Skeleton variant="rect" height={450} />
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MyPatient;
