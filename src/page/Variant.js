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
import Variants from '../components/Gene/Variants';


class Variant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variantInfo: {},
      loaded: false,
      value: 0,
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

  getVariantInformation = (variantId) => {
    var self = this;
    axios
      .get('/api/variant/' + this.props.match.params.variantId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          variantInfo: respond[0],
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

    if (this.state.redirect) {
      return <Redirect to={'/login?link=' + window.location.pathname} />;
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
                    {['FREQUENCY', 'CONSEQUENCES', 'QUALITY', 'INDIVIDUALS', 'GENOTYPES'].map((item, index) => {
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
                    <Variants variants={this.state.variantInfo.frequency} title="Frequency" subtitle="Frequency of the variant in external databases and internally." configureLink="variant/frequency" />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <Variants variants={this.state.variantInfo.consequence} title="Consequences" subtitle="Consequence of the variant on transcripts." configureLink="variant/consequence" />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <Variants variants={this.state.variantInfo.quality} title="Quality" subtitle="Quality of the variant on transcripts." configureLink="variant/quality" />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={3} dir={this.props.theme.direction}>
                    <Variants variants={this.state.variantInfo.individuals} title="Individuals" subtitle="Genotypes of individuals." configureLink="variant/individuals" />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={4} dir={this.props.theme.direction} >
                    <Variants variants={this.state.variantInfo.genotypes} title="Genotypes" subtitle="Genotypes of individuals." configureLink="variant/genotypes" />
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={'Loading Variant Information from Server...'} />;
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

export default withStyles(styles, { withTheme: true })(Variant);
