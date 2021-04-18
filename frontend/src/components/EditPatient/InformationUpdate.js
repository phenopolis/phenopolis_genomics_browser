import React, { Fragment, useState, useEffect } from 'react';

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
  DialogActions,
  Button,
  Collapse,
  Paper,
} from '@material-ui/core';

import SearchAutoComplete from '../Search/AutoComplete';
import { useDispatch, useSelector } from 'react-redux';
import { updateOneIndividual, ResetUpdate } from '../../redux/actions/individuals';

const qs = require('querystring');

export default function InformationUpdate(props) {
  const dispatch = useDispatch();

  const [internalID, setInternalID] = useState('');
  const [externalID, setExternalID] = useState('');
  const [gender, setGender] = useState(null);
  const [consanguinity, setConsanguinity] = useState(null);
  const [featureArray, setFeatureArray] = useState([]);
  const [geneArray, setGeneArray] = useState([]);

  const [ConfirmOpen, setConfirmOpen] = useState(false);

  const { updateLoaded } = useSelector((state) => ({
    updateLoaded: state.Individuals.updateLoaded,
  }));

  useEffect(() => {
    AssignPropstoStates();
  }, []);

  useEffect(() => {
    if (updateLoaded) {
      handleReset();
      dispatch(ResetUpdate());
      props.actionSuccess('update');
    }
  }, [updateLoaded]);

  const AssignPropstoStates = () => {
    let userInfo = props.userInfo;

    setInternalID(userInfo.internal_id[0].display);
    setExternalID(userInfo.external_id);

    if (userInfo.sex === 'M') {
      setGender('male');
    } else if (userInfo.sex === 'F') {
      setGender('female');
    } else {
      setGender('U');
    }

    setConsanguinity(userInfo.consanguinity);

    const tmpFeature = userInfo.simplified_observed_features.map((name, index) => {
      return {
        type: 'hpo',
        name: name.display,
      };
    });

    setFeatureArray(tmpFeature);
    const tmpGene = userInfo.genes.map((gene, index) => {
      return {
        type: 'gene',
        name: gene.display,
      };
    });
    setGeneArray(tmpGene);
  };

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

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleReset = () => {
    AssignPropstoStates();
    setConfirmOpen(false);
  };

  const handleSubmitUpdate = () => {
    var formData = qs.stringify({
      'gender_edit[]': gender,
      'consanguinity_edit[]': consanguinity,
    });

    featureArray.forEach((x) => {
      formData = `${formData}&feature%5B%5D=${x.name.split(' ').join('+')}`;
    });

    geneArray.forEach((x) => {
      formData = `${formData}&genes%5B%5D=${x.name.split(' ').join('+')}`;
    });
    dispatch(updateOneIndividual({ patient_id: internalID, data: formData }));
  };

  return (
    <Fragment>
      <Card className="p-4 mb-2">
        <div className="font-size-lg font-weight-bold">User Information</div>
        <Divider className="my-4" />
        <Container maxWidth="md" style={{ paddingLeft: '4em', paddingRight: '4em' }}>
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
                disabled={true}
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
                      value="male"
                      control={<Radio color="primary" />}
                      label="Male"
                      labelPlacement="Male"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      value="female"
                      control={<Radio color="primary" />}
                      label="Female"
                      labelPlacement="Female"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      value="U"
                      control={<Radio color="primary" />}
                      label="Unknown"
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

        <Collapse in={ConfirmOpen}>
          <Paper
            elevation={5}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '1.5em',
              margin: '0.5em 0em',
            }}>
            <Grid container direction="row" justify="space-around" alignItems="center">
              <Grid item xs={6}>
                This will update the database. Are you sure you want to continue?
              </Grid>
              <Grid item xs={6}>
                <Grid container direction="row" justify="flex-end" alignItems="center">
                  <Button
                    variant="outlined"
                    style={{ color: 'white', border: '1px solid white', 'margin-right': '1em' }}
                    onClick={() => setConfirmOpen(false)}>
                    Give up
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ color: 'white', border: '1px solid white' }}
                    onClick={() => handleSubmitUpdate()}>
                    Confirm
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            disabled={ConfirmOpen}
            autoFocus
            onClick={() => handleOpenConfirm()}>
            <span className="btn-wrapper--label">Save</span>
          </Button>
          <Button color="primary" onClick={() => handleReset()}>
            <span className="btn-wrapper--label">RESET</span>
          </Button>
        </DialogActions>
      </Card>
    </Fragment>
  );
}
