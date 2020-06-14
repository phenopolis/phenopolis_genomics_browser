import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, AppBar, Tabs, Tab, Container, Paper } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

import Loading from '../components/General/Loading';
import TabPanel from '../components/Tab/Tabpanel'

import MetaData from '../components/Gene/MetaData';
import VirtualGrid from '../components/Table/VirtualGrid'
// import Variants from '../components/Gene/Variants';

import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { setSnack } from '../redux/actions'

import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

class Variant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variantInfo: {},
      loaded: false,
      value: 0,
      redirect: false,
      reLink: ""
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

  getVariantInformation = (variantId) => {
    var self = this;
    axios
      // .get('/api/' + i18next.t('Variant.entry') + '/variant/' + this.props.match.params.variantId, {
      .get('/api/variant/' + this.props.match.params.variantId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);

        if (respond[0] === undefined) {
          this.setState({ redirect: true, reLink: "/search" });
          this.props.setSnack("Variant not exist.", "warning")
        } else {
          self.setState({
            variantInfo: respond[0],
            loaded: true
          });
        }
      })
      .catch(err => {
        console.log(err);
        if (err.response.status === 401) {
          this.setState({ redirect: true, reLink: '/login?link=' + window.location.pathname });
        }
      });
  }

  componentDidMount() {
    this.getVariantInformation(this.props.match.params.variantId)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.variantId !== this.props.match.params.variantId) {
      this.setState({
        variantInfo: [],
        loaded: false
      });
      this.getVariantInformation(nextProps.match.params.variantId)
    }
  }

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    if (this.state.redirect) {
      return <Redirect to={this.state.reLink} />;
    }

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.variantInfo.metadata} name={this.state.variantInfo.metadata.data[0].variant_id[0].display} />

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
                    {[t('Variant.FREQUENCY'), t('Variant.CONSEQUENCES'), t('Variant.QUALITY'), t('Variant.INDIVIDUALS'), t('Variant.GENOTYPES')].map((item, index) => {
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
                    <VirtualGrid tableData={this.state.variantInfo.frequency} title={t("Variant.Frequency")} subtitle={t("Variant.Frequency_subtitle")} configureLink="variant/frequency" />
                    {/* <Variants variants={this.state.variantInfo.frequency} title={t("Variant.Frequency")} subtitle={t("Variant.Frequency_subtitle")} configureLink="variant/frequency" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.variantInfo.consequence} title={t("Variant.Consequences")} subtitle={t("Variant.Consequences_subtitle")} configureLink="variant/consequence" />
                    {/* <Variants variants={this.state.variantInfo.consequence} title={t("Variant.Consequences")} subtitle={t("Variant.Consequences_subtitle")} configureLink="variant/consequence" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.variantInfo.quality} title={t("Variant.Quality")} subtitle={t("Variant.Quality_subtitle")} configureLink="variant/quality" />
                    {/* <Variants variants={this.state.variantInfo.quality} title={t("Variant.Quality")} subtitle={t("Variant.Quality_subtitle")} configureLink="variant/quality" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={3} dir={this.props.theme.direction}>
                    <VirtualGrid tableData={this.state.variantInfo.individuals} title={t("Variant.Individuals")} subtitle={t("Variant.Individuals_subtitle")} configureLink="variant/individuals" />
                    {/* <Variants variants={this.state.variantInfo.individuals} title={t("Variant.Individuals")} subtitle={t("Variant.Individuals_subtitle")} configureLink="variant/individuals" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={4} dir={this.props.theme.direction} >
                    <VirtualGrid tableData={this.state.variantInfo.genotypes} title={t("Variant.Genotypes")} subtitle={t("Variant.Genotypes_subtitle")} configureLink="variant/genotypes" />
                    {/* <Variants variants={this.state.variantInfo.genotypes} title={t("Variant.Genotypes")} subtitle={t("Variant.Genotypes_subtitle")} configureLink="variant/genotypes" /> */}
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={t("Variant.message")} />;
    }
  }
}

Variant.propTypes = {
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
  }
});

export default compose(
  withStyles(styles, { withTheme: true }),
  withTranslation(),
  connect(
    null,
    { setSnack }
  )
)(Variant)
