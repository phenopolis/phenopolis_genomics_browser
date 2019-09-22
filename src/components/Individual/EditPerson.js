import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';



class EditPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {

    return (
      <div>
      <DialogTitle id="alert-dialog-title">
      Patient Data
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous location data to
          Google, even when no apps are running.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary">
          Disagree
        </Button>
        <Button color="primary" autoFocus>
          Agree
        </Button>
      </DialogActions>
      </div>
    )
  }
}

EditPerson.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({

});

export default withStyles(styles, { withTheme: true })(EditPerson);
