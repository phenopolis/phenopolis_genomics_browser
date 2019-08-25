import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container } from '@material-ui/core';

import Variants from '../components/Gene/Variants';
import Loading from '../components/General/Loading';

class MyPatient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      AllPatientInfo: {},
      loaded: false
    };
  }

  getAllPatientInformation = () => {
    var self = this;
    axios
      .get('/api/hpo/HP:0000001', {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          AllPatientInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getAllPatientInformation()
  }

  render() {
    const { classes } = this.props;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <Container maxWidth='xl'>
              <Paper className={classes.paper}>
                <Variants variants={this.state.AllPatientInfo.individuals} title={"My Patients" + ' (Total: ' + this.state.AllPatientInfo.preview[0][1] + ')'} subtitle=" " />
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading />;
    }
  }
}

MyPatient.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    backgroundColor: '#eeeeee',
    padding: '4em'
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3)
  }
});

export default withStyles(styles)(MyPatient);
