import React, { useEffect } from 'react';
import { CssBaseline, Container } from '@material-ui/core';
import VirtualGrid from '../components/Table/VirtualGrid';
import Loading from '../components/General/Loading';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getHPO } from '../redux/actions/hpo';

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
    <>
      {loaded ? (
        <React.Fragment>
          <CssBaseline />
          <div className="myPatients-container">
            <Container maxWidth="xl">
              <VirtualGrid
                tableData={hpoInfo.individuals}
                title={
                  t('MyPatient.My_Patients') +
                  ' (' +
                  t('MyPatient.Total') +
                  ' ' +
                  hpoInfo.preview[0][1] +
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
