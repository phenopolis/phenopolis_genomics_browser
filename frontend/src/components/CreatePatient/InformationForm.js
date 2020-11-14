import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  FormControlLabel,
  Card,
  Divider,
  Container,
  Typography,
  Box,
  RadioGroup,
  Radio,
  TextField,
  Button,
  Dialog,
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClipboardCheck } from '@fortawesome/pro-solid-svg-icons';

import SearchAutoComplete from '../Search/AutoComplete';

import { useDispatch, useSelector } from 'react-redux';
import { createIndividual } from '../../redux/actions/individuals';
import { setSnack } from '../../redux/actions/snacks';

export default function InformationForm() {
  const dispatch = useDispatch();
  const { newPatientInfo, error, username } = useSelector((state) => ({
    newPatientInfo: state.Individuals.newPatientInfo,
    error: state.Individuals.error,
    username: state.Auth.username,
  }));

  useEffect(() => {
    if (newPatientInfo !== null) {
      dispatch(setSnack(newPatientInfo.id + ' is created!', 'success'));
      setNewID(newPatientInfo.id);
      toggleSuccessModal();
      ResetValue();
    }
  }, [newPatientInfo, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(setSnack(error, 'error'));
    }
  }, [error, dispatch]);

  const [externalID, setExternalID] = useState('');
  const [gender, setGender] = useState(null);
  const [consanguinity, setConsanguinity] = useState(null);
  const [featureArray, setFeatureArray] = useState([]);
  const [geneArray, setGeneArray] = useState([]);

  const [ConfirmModal, setConfirmModal] = useState(false);
  const [newID, setNewID] = useState('');
  const [SuccessModal, setSuccessModal] = useState(false);
  const toggleConfirmModal = () => setConfirmModal(!ConfirmModal);
  const toggleSuccessModal = () => setSuccessModal(!SuccessModal);

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleConsanguinityChange = (event) => {
    setConsanguinity(event.target.value);
  };

  const handleModifyFeatureChip = (item, action, type) => {
    if (type === 'phenotype') {
      if (action === 'Add') {
        setFeatureArray([
          ...featureArray,
          {
            type: item.split('::')[0],
            name: item.split('::')[1],
            feature: item.split('::')[2],
            full: item,
          },
        ]);
      } else {
        setFeatureArray(
          featureArray.filter((x, index) => {
            return x.name !== item;
          })
        );
      }
    } else {
      if (action === 'Add') {
        setGeneArray([
          ...geneArray,
          {
            type: item.split('::')[0],
            name: item.split('::')[1],
            feature: item.split('::')[2],
            full: item,
          },
        ]);
      } else {
        setGeneArray(
          geneArray.filter((x) => {
            return x.name !== item;
          })
        );
      }
    }
  };

  const reviewInfo = () => {
    if (externalID === '') {
      dispatch(setSnack('External ID can not be empty.', 'error'));
      return;
    }

    if (gender === null) {
      dispatch(setSnack('Gender need to be selected.', 'error'));
      return;
    }

    if (consanguinity === null) {
      dispatch(setSnack('Consanguinity need to be selected.', 'error'));
      return;
    }

    toggleConfirmModal();
  };

  const handleSubmit = () => {
    const NewIndividualData = [
      {
        external_id: externalID,
        sex: gender,
        observed_features: featureArray.map((x) => x.feature).join(','),
        unobserved_features: '',
        pi: username,
        consanguinity: consanguinity,
        simplified_observed_features_names: featureArray.map((x) => x.name).join(';'),
        simplified_observed_features: featureArray.map((x) => x.feature).join(','),
        genes: geneArray.map((x) => x.name).join(','),
        ancestor_observed_features: 'HP:0000001',
        ancestor_observed_features_names: 'All',
      },
    ];

    if (NewIndividualData[0].observed_features === '') {
      NewIndividualData[0].observed_features = 'HP:0000001';
      NewIndividualData[0].simplified_observed_features = 'HP:0000001';
      NewIndividualData[0].simplified_observed_features_names = 'All';
    }

    dispatch(createIndividual(NewIndividualData));
    toggleConfirmModal();
  };

  const ResetValue = () => {
    setExternalID('');
    setGender(null);
    setConsanguinity(null);
    setFeatureArray([]);
    setGeneArray([]);
  };

  return (
    <Fragment>
      <Container className="mt-3 px-5 py-3">
        <Card className="p-4 mb-5">
          <div className="font-size-lg font-weight-bold">Basic</div>
          <Divider className="my-4" />
          <Container>
            <Grid container direction="row" alignItems="center">
              <Grid item xs={3}>
                <Typography component="div">
                  <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                    External ID
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  className="mt-3 ml-4"
                  id="standard-basic"
                  value={externalID}
                  onChange={(event) => setExternalID(event.target.value)}
                  error={externalID === ''}
                  helperText={externalID === '' ? 'External ID can not be Empty!' : ' '}
                />
              </Grid>
            </Grid>

            <Grid container direction="row" alignItems="center" style={{ 'margin-top': '2em' }}>
              <Grid item xs={3}>
                <Typography component="div">
                  <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                    Gender
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <RadioGroup
                  aria-label="position"
                  className="ml-4"
                  name="position"
                  value={gender}
                  spacing={5}
                  onChange={handleGenderChange}
                  row>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="M"
                        control={<Radio color="primary" />}
                        label="Male"
                        labelPlacement="Male"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="F"
                        control={<Radio color="primary" />}
                        label="Female"
                        labelPlacement="Female"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="unknown"
                        control={<Radio color="primary" />}
                        label="Unknow"
                        labelPlacement="Unknown"
                      />
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Grid>
            </Grid>

            <Grid container direction="row" style={{ 'margin-top': '2em' }}>
              <Grid item xs={3} style={{ 'margin-top': '1em' }}>
                <Typography component="div">
                  <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                    Features
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <SearchAutoComplete
                  featureArray={featureArray.map((x) => x.name)}
                  type={'phenotype'}
                  ModifyFeature={handleModifyFeatureChip}
                />
              </Grid>
            </Grid>

            <Grid container direction="row" style={{ 'margin-top': '3em' }}>
              <Grid item xs={3} style={{ 'margin-top': '1em' }}>
                <Typography component="div">
                  <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                    Candidate Genes
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <SearchAutoComplete
                  featureArray={geneArray.map((x) => x.name)}
                  type={'gene'}
                  ModifyFeature={handleModifyFeatureChip}
                />
              </Grid>
            </Grid>

            <Grid container direction="row" alignItems="center" style={{ 'margin-top': '3em' }}>
              <Grid item xs={3}>
                <Typography component="div">
                  <Box fontWeight="fontWeightLight" fontSize="subtitle1.fontSize">
                    Consanguinity
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <RadioGroup
                  aria-label="position"
                  className="ml-4"
                  name="position"
                  value={consanguinity}
                  onChange={handleConsanguinityChange}
                  row>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="yes"
                        control={<Radio color="primary" />}
                        label="Yes"
                        labelPlacement="Yes"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                        labelPlacement="No"
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <FormControlLabel
                        value="unknown"
                        control={<Radio color="primary" />}
                        label="Unknown"
                        labelPlacement="Unknown"
                      />
                    </Grid>
                  </Grid>
                </RadioGroup>
              </Grid>
            </Grid>
          </Container>
        </Card>
      </Container>

      <div className="card-footer bg-secondary p-4 text-center">
        <Button color="secondary" variant="contained" onClick={reviewInfo}>
          <span className="btn-wrapper--label">Save Information</span>
        </Button>
      </div>

      <Dialog open={ConfirmModal} onClose={toggleConfirmModal}>
        <div className="text-center p-5">
          <div className="avatar-icon-wrapper rounded-circle m-0">
            <div className="d-inline-flex justify-content-center p-0 rounded-circle avatar-icon-wrapper bg-neutral-warning text-warning m-0 d-130">
              <FontAwesomeIcon icon={faUser} className="d-flex align-self-center display-3" />
            </div>
          </div>
          <h4 className="font-weight-bold mt-4">
            Do you want to create <b className="text-success">{externalID + ' '}</b>?
          </h4>
          <p className="mb-0 font-size-md text-muted">You can later update the information</p>
          <div className="pt-4">
            <Button
              onClick={toggleConfirmModal}
              variant="outlined"
              color="default"
              className="mx-1">
              <span className="btn-wrapper--label">Cancel</span>
            </Button>
            <Button onClick={handleSubmit} color="secondary" variant="contained" className="mx-1">
              <span className="btn-wrapper--label">Create</span>
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={SuccessModal} onClose={toggleSuccessModal}>
        <div className="text-center p-5">
          <div className="avatar-icon-wrapper rounded-circle m-0">
            <div className="d-inline-flex justify-content-center p-0 rounded-circle avatar-icon-wrapper bg-neutral-success text-success m-0 d-130">
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className="d-flex align-self-center display-3"
              />
            </div>
          </div>
          <h4 className="font-weight-bold mt-4">
            <b className="text-success">{newID}</b> is created successfully
          </h4>
          <p className="mb-0 font-size-md text-muted">Do you want to check in patient page now?</p>
          <div className="pt-4">
            <Button
              color="Primary"
              fullWidth={true}
              variant="contained"
              className="mx-1"
              component={Link}
              to={'/individual/' + newID}
              onClick={toggleSuccessModal}>
              <span className="btn-wrapper--label">Turn to patient page</span>
            </Button>
            <Button onClick={toggleSuccessModal} style={{ color: 'darkgrey' }}>
              Not now
            </Button>
          </div>
        </div>
      </Dialog>
    </Fragment>
  );
}
