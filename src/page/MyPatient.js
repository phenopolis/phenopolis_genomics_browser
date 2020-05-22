import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container } from '@material-ui/core';
import { Redirect } from 'react-router';

import VirtualGrid from '../components/Table/VirtualGrid'
// import Variants from '../components/Gene/Variants';
import Loading from '../components/General/Loading';

import compose from 'recompose/compose';
import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

class MyPatient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      AllPatientInfo: {},
      loaded: false,
      redirect: false
    };
  }

  getAllPatientInformation = () => {
    var self = this;
    axios
      .get('/api/' + i18next.t('MyPatient.entry') + '/hpo/HP:0000001', {
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
        if (err.response.data.error === 'Unauthenticated') {
          this.setState({ redirect: true });
        }
      });
  }

  componentDidMount() {
    this.getAllPatientInformation()
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    if (this.state.redirect) {
      return <Redirect to={'/login?link=' + window.location.pathname} />;
    }

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <Container maxWidth='xl'>
              <Paper className={classes.paper}>
                <VirtualGrid tableData={this.state.AllPatientInfo.individuals} title={t('MyPatient.My_Patients') + ' (' + t('MyPatient.Total') + ' ' + this.state.AllPatientInfo.preview[0][1] + ')'} subtitle=' ' />
                {/* <Variants variants={this.state.AllPatientInfo.individuals} title={t('MyPatient.My_Patients') + ' (' + t('MyPatient.Total') + ' ' + this.state.AllPatientInfo.preview[0][1] + ')'} subtitle=' ' /> */}
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={t("MyPatient.message")} />;
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

export default compose(withStyles(styles), withTranslation())(MyPatient)
