import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Typography, Box, FormControlLabel, RadioGroup, Radio, Grid, IconButton, Collapse, Paper } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';

import SearchAutoComplete from './SearchAutoComplete'
const qs = require('querystring');

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography>
        <Box fontWeight='fontWeightBold' fontSize='h5.fontSize'>{children}</Box>
      </Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

class EditPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      genderValue: this.props.metadata.data[0].sex === 'M' ? 'male' : this.props.metadata.data[0].sex === 'F' ? 'female' : 'unknown',
      consanguinityValue: this.props.metadata.data[0].consanguinity,
      featureArray: this.props.metadata.data[0].simplified_observed_features.map(x => { return x.display }),
      geneArray: this.props.metadata.data[0].genes.map(x => { return x.display }),
      ConfirmOpen: false,
    };
  }

  handleGenderChange = event => {
    this.setState({ genderValue: event.target.value });
  };

  handleConsanguinityChange = event => {
    this.setState({ consanguinityValue: event.target.value });
  };

  handleClose = () => {
    this.props.dialogClose()
  }

  ModifyFeatureChip = (item, action, type) => {
    if (type === 'phenotype') {
      if (action === 'Add') {
        this.setState({ featureArray: [...this.state.featureArray, item] })
      } else {
        this.setState({ featureArray: this.state.featureArray.filter((x, index) => { return (index !== item) }) })
      }
    } else {
      if (action === 'Add') {
        this.setState({ geneArray: [...this.state.geneArray, item] })
      } else {
        this.setState({ geneArray: this.state.geneArray.filter((x, index) => { return (index !== item) }) })
      }
    }
  }

  handleReset = () => {
    this.setState({
      genderValue: this.props.metadata.data[0].sex === 'M' ? 'male' : this.props.metadata.data[0].sex === 'F' ? 'female' : 'unknown',
      consanguinityValue: this.props.metadata.data[0].consanguinity,
      featureArray: this.props.metadata.data[0].simplified_observed_features.map(x => { return x.display }),
      geneArray: this.props.metadata.data[0].genes.map(x => { return x.display }),
    })
  }

  handleConfirm = () => {
    this.setState({ ConfirmOpen: true })
  }

  handleGiveup = () => {
    this.setState({ConfirmOpen: false})
  }

  handleSave = () => {

    var formData = qs.stringify({
      'gender_edit[]': this.state.genderValue,
      'consanguinity_edit[]': this.state.consanguinityValue
    });

    this.state.featureArray.forEach(x => {
      formData = formData + '&' + 'feature%5B%5D=' + x.split(" ").join("+")
    })

    this.state.geneArray.forEach(x => {
      formData = formData + '&' + 'genes%5B%5D=' + x.split(" ").join("+")
    })

    axios
      .post('/api/update_patient_data/' + this.props.patientName, formData, { withCredentials: true })
      .then(res => {
        let respond = res.data;
        if (respond.success === true) {
          this.props.refreshData(this.props.patientName)
          this.handleClose()
        }
      })
      .catch(err => {
        window.alert('Save Failed.');
      });
  }


  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
          Modify Patient Data
        </DialogTitle>

        <DialogContent dividers>

          <Typography component='div'>
            <Box fontWeight='fontWeightLight' fontSize='subtitle1.fontSize'>Gender</Box>
          </Typography>
          <RadioGroup aria-label="position" name="position" value={this.state.genderValue} onChange={this.handleGenderChange} row>
            <Grid container className={classes.root} spacing={2}>
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
                  value="unknown"
                  control={<Radio color="primary" />}
                  label="Unknow"
                  labelPlacement="Unknown"
                />
              </Grid>
            </Grid>
          </RadioGroup>

          <Typography component='div' style={{ 'padding-top': '1em' }}>
            <Box fontWeight='fontWeightLight' fontSize='subtitle1.fontSize'>Features</Box>
          </Typography>

          <SearchAutoComplete featureArray={this.state.featureArray} type={'phenotype'} ModifyFeature={this.ModifyFeatureChip} />


          <Typography component='div' style={{ 'padding-top': '1em' }} >
            <Box fontWeight='fontWeightLight' fontSize='subtitle1.fontSize'>Candidate Genes</Box>
          </Typography>
          <SearchAutoComplete featureArray={this.state.geneArray} type={'gene'} ModifyFeature={this.ModifyFeatureChip} />


          <Typography component='div' style={{ 'padding-top': '1em' }}>
            <Box fontWeight='fontWeightLight' fontSize='subtitle1.fontSize'>Consanguinity</Box>
          </Typography>
          <RadioGroup aria-label="position" name="position" value={this.state.consanguinityValue} onChange={this.handleConsanguinityChange} row>
            <Grid container className={classes.root} spacing={2}>
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
        </DialogContent>

        <DialogActions>
          <Button color="primary" onClick={this.handleConfirm}>
            SAVE
        </Button>
          <Button color="primary" autoFocus onClick={this.handleReset}>
            RESET
        </Button>
        </DialogActions>

        <Collapse in={this.state.ConfirmOpen}>
          <Paper elevation={0} className={classes.paperCollapse}>
            <Grid
              container
              direction="row"
              justify="space-around"
              alignItems="center"
            >
              <Grid item xs={6}>
                This will update the database. Are you sure you want to continue?
        </Grid>
              <Grid item xs={6}>
                <Grid
                  container
                  direction="row"
                  justify="flex-end"
                  alignItems="center"
                >
                  <Button variant="outlined" style={{ color: 'white', border: '1px solid white', 'margin-right': '1em' }} onClick={this.handleGiveup}>Give up</Button>
                  <Button variant="outlined" style={{ color: 'white', border: '1px solid white' }} onClick={this.handleSave}>Confirm</Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </div>
    )
  }
}

EditPerson.propTypes = {
  classes: PropTypes.object.isRequired
};

const dialogStyles = theme => ({
  root: {
    minWidth: '40em'
  },
  paperCollapse: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: '#f44336',
    color: 'white'
  }
});

export default withStyles(dialogStyles, { withTheme: true })(EditPerson);
