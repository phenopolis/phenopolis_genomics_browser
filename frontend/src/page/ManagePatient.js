import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { getAllIndividual } from '../redux/actions/individuals';

import { Container, Dialog, Button, Typography, Box } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare } from '@fortawesome/pro-solid-svg-icons';

import Loading from '../components/General/Loading';

const VersatileTable = React.lazy(() => import('../components/BaseTable/VersatileTable'));

const ManagePatient = () => {
  const dispatch = useDispatch();
  const [DataReady, setDataReady] = useState(false);
  const [PatientData, setPatientData] = useState(null);

  useEffect(() => {
    dispatch(getAllIndividual());
  }, []);

  const { allPatientInfo, loaded } = useSelector((state) => ({
    allPatientInfo: state.Individuals.allPatientInfo,
    loaded: state.Individuals.fetchLoaded,
  }));

  useEffect(() => {
    if (loaded) {
      const colList = [
        'action',
        'internal_id',
        'external_id',
        'sex',
        'consanguinity',
        'genes',
        'users',
        'ancestor_observed_features',
        'ancestor_observed_features_names',
        'observed_features',
        'observed_features_names',
        'simplified_observed_features',
        'simplified_observed_features_names',
        'unobserved_features',
      ];
      // let myColname = Object.keys(allPatientInfo[0]).map((item) => {
      let myColname = colList.map((item) => {
        if (item == 'genes') {
          return {
            default: true,
            description: '',
            key: item,
            name: item.toUpperCase(),
            base_href: '/gene/',
            type: 'links',
          };
        } else if (item == 'internal_id') {
          return {
            default: true,
            description: '',
            key: item,
            name: item.toUpperCase(),
            base_href: '/individual/',
            type: 'links',
          };
        } else {
          return {
            default: true,
            description: '',
            key: item,
            name: item.toUpperCase(),
            base_href: '/hpo/',
            type: 'links',
          };
        }
      });

      let myData = JSON.parse(JSON.stringify(allPatientInfo));

      let splitCols = [
        'ancestor_observed_features',
        'ancestor_observed_features_names',
        'observed_features',
        'observed_features_names',
        'simplified_observed_features',
        'simplified_observed_features_names',
        'unobserved_features',
        'genes',
        'internal_id',
      ];

      myData.forEach((element) => {
        splitCols.forEach((sc) => {
          if (element[[sc]]) {
            element[[sc]] = element[[sc]].split(/,|;/).map((chip) => {
              return {
                display: chip,
              };
            });
          } else {
            element[[sc]] = [];
          }
        });
      });

      setPatientData({ colNames: myColname, data: myData });
      setDataReady(true);
    }
  }, [allPatientInfo, loaded]);

  return (
    <>
      <CssBaseline />
      <div className="myPatients-container">
        {DataReady ? (
          <>
            <Container maxWidth="xl">
              <Typography component="div">
                <Box fontWeight="900" fontSize="h4.fontSize" mb={0}>
                  Manage All Patient Here
                </Box>
                <Box fontWeight="fontWeightLight" mb={2}>
                  Here you can create/update/delete patient.
                </Box>
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faPlusSquare} />}
                style={{ backgroundColor: 'orange' }}
                component={Link}
                to="/create_patient">
                Create New Patient
              </Button>

              <VersatileTable
                tableData={PatientData}
                genomePlot={false}
                // onActionClick={handleActionClick}
              />
            </Container>
          </>
        ) : (
          <Loading message={"Fetching all Patients' information..."} />
        )}
      </div>
    </>
  );
};

export default ManagePatient;
