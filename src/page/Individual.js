import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import compose from 'recompose/compose';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, AppBar, Tabs, Tab, Container, Paper, Fab } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

import Loading from '../components/General/Loading';
import TabPanel from '../components/Tab/Tabpanel'

import MetaData from '../components/Gene/MetaData';
// import Variants from '../components/Gene/Variants';
import VirtualGrid from '../components/Table/VirtualGrid'

import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';

import EditPerson from '../components/Individual/EditPerson'

import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

class Individual extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: i18next.t('Individual.message'),
      individualInfo: {},
      loaded: false,
      value: 0,
      EditOpen: false,
      redirect: false
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue })
  }

  handleChangeIndex = (index) => {
    this.setState({ value: index })
  }

  a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  getIndividualInformation = (individualId) => {
    var self = this;
    axios
      .get('/api/' + i18next.t('Individual.entry') + '/individual/' + individualId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          individualInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
        // if (err.response.data.error === 'Unauthenticated') {
        //   this.setState({ redirect: true });
        // }
      });
  }

  componentDidMount() {
    this.getIndividualInformation(this.props.match.params.individualId)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.individualId !== this.props.match.params.individualId) {
      this.setState({
        individualInfo: [],
        loaded: false
      });
      this.getIndividualInformation(nextProps.match.params.individualId)
    }
  }

  OpenDialog() {
    this.setState({
      EditOpen: !this.state.EditOpen
    });
  }

  refreshPage = (patientName) => {
    this.setState({
      loaded: false,
      message: i18next.t('Individual.edit_message')
    });
    this.getIndividualInformation(patientName)
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

            <Fab className={classes.fab} size="middle" color="primary" aria-label="add" onClick={() => this.OpenDialog()}>
              <EditIcon />
            </Fab>

            <MetaData metadata={this.state.individualInfo.metadata} name={this.props.match.params.individualId} />

            <Container maxWidth='xl'>
              <Paper className={classes.paper}>
                <AppBar position="static" color="white" elevation="0" m={0} p={0}>
                  <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor='primary'
                    textColor='primary'
                    variant="fullWidth"
                    aria-label="full width tabs example"
                    classes={{ indicator: classes.bigIndicator }}
                  >
                    {[t('Individual.RARE_HOMS'), t('Individual.RARE_COMP_HETS'), t('Individual.RARE_VARIANTS')].map((item, index) => {
                      return (
                        <Tab label={item} {...this.a11yProps(index)} />
                      )
                    })}
                  </Tabs>
                </AppBar>
                <SwipeableViews
                  axis={this.props.theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={this.state.value}
                  onChangeIndex={this.handleChangeIndex}
                >
                  <TabPanel value={this.state.value} index={0} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.individualInfo.rare_homs} title={t('Individual.Rare_HOMs')} subtitle={t('Individual.Rare_HOMs_subtitle')} configureLink="individual/rare_homs" />
                    {/* <Variants variants={this.state.individualInfo.rare_homs} title={t("Individual.Rare_HOMs")} subtitle={t("Individual.Rare_HOMs_subtitle")} configureLink="individual/rare_homs" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.individualInfo.rare_comp_hets} title={t('Individual.Rare_Comp_Hets')} subtitle={t('Individual.Rare_Comp_Hets_subtitle')} configureLink="individual/rare_comp_hets" />
                    {/* <Variants variants={this.state.individualInfo.rare_comp_hets} title={t("Individual.Rare_Comp_Hets")} subtitle={t("Individual.Rare_Comp_Hets_subtitle")} configureLink="individual/rare_comp_hets" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.individualInfo.rare_variants} title={t('Individual.Rare_Variants')} subtitle={t('Individual.Rare_Variants_subtitle')} configureLink="individual/rare_variants" />
                    {/* <Variants variants={this.state.individualInfo.rare_variants} title={t("Individual.Rare_Variants")} subtitle={t("Individual.Rare_Variants_subtitle")} configureLink="individual/rare_variants" /> */}
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Container>
          </div>
          <Dialog
            fullWidth={true}
            maxWidth={'md'}
            open={this.state.EditOpen}
            onClose={() => this.OpenDialog()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <EditPerson patientName={this.props.match.params.individualId} metadata={this.state.individualInfo.metadata} dialogClose={() => this.OpenDialog()} refreshData={this.refreshPage} />
          </Dialog>
        </React.Fragment>
      );
    } else {
      return <Loading message={this.state.message} />;
    }
  }
}

Individual.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    backgroundColor: '#eeeeee',
    padding: '4em'
  },
  tabroot: {
    backgroundColor: 'white'
  },
  bigIndicator: {
    height: 3,
    backgroundColor: '#2E84CF'
  },
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(5)
  },
  fab: {
    position: 'absolute',
    right: theme.spacing(15),
    top: theme.spacing(18),
  }
});

export default compose(withStyles(styles, { withTheme: true }), withTranslation())(Individual)
