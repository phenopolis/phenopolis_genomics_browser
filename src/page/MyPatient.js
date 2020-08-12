import React, { useEffect } from 'react';
import { CssBaseline, Container } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import VirtualGrid from '../components/Table/VirtualGrid';
import Loading from '../components/General/Loading';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getPatients } from '../redux/actions/patients';
import { setSnack } from '../redux/actions/snacks';

const MyPatient = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  const { error, patients, username } = useSelector((state) => ({
    username: state.users.username,
    patients: state.Patients.data[0],
    error: state.Patients.error,
  }));

  useEffect(() => {
    dispatch(getPatients());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setSnack(error, 'error'));
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (!username) {
      history.push('/login?link=/my_patients');
    }
  }, [username]);

  return (
    <>
      {patients ? (
        <React.Fragment>
          <CssBaseline />
          <div className="myPatients-container">
            <Container maxWidth="xl">
              <VirtualGrid
                tableData={patients.individuals}
                title={
                  t('MyPatient.My_Patients') +
                  ' (' +
                  t('MyPatient.Total') +
                  ' ' +
                  patients.preview[0][1] +
                  ')'
                }
                subtitle=" "
              />
            </Container>
          </div>
        </React.Fragment>
      ) : (
        <Loading message={t('MyPatient.message')} />
      )}
    </>
  );
};

export default MyPatient;
