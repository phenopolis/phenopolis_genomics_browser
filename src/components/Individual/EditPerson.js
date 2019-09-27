import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, TextField, Typography, Box, FormControlLabel, RadioGroup, Radio, Grid, IconButton } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';

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
      genderValue: this.props.metadata.data[0].sex,
      consanguinityValue: this.props.metadata.data[0].consanguinity
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


  render() {
    const { classes } = this.props;
    const metadata = this.props.metadata;

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
                  value="U"
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
          <TextField
            autoFocus
            margin="dense"
            id="patientFeature"
            fullWidth
          />

          <Typography component='div' style={{ 'padding-top': '1em' }} >
            <Box fontWeight='fontWeightLight' fontSize='subtitle1.fontSize'>Candidate Genes</Box>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="candidateGenes"
            fullWidth
          />

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
          <Button color="primary">
            SAVE
        </Button>
          <Button color="primary" autoFocus>
            RESET
        </Button>
        </DialogActions>
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
  }
});

export default withStyles(dialogStyles, { withTheme: true })(EditPerson);
