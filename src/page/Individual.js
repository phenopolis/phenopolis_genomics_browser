import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, AppBar, Tabs, Tab, Container, Paper } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

import Loading from '../components/General/Loading';
import TabPanel from '../components/Tab/Tabpanel'

import MetaData from '../components/Gene/MetaData';
import Variants from '../components/Gene/Variants';


class Individual extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      individualInfo: {},
      loaded: false,
      value: 0
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
      .get('/api/individual/' + individualId, {
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

  render() {
    const { classes } = this.props;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
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
                    {['RARE HOMS', 'RARE COMP HETS', 'RARE VARIANTS'].map((item, index) => {
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
                    <Variants variants={this.state.individualInfo.rare_homs} title="Rare HOMs" subtitle="This is the list of rare homozygous variants in this individual obtained with thresholds." />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <Variants variants={this.state.individualInfo.rare_comp_hets} title="Rare Comp Hets" subtitle="This is the list of rare compound heterozgote variants (more than one variant in a given gene) found in this individual obtained with allele frequency thresholds." />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <Variants variants={this.state.individualInfo.rare_variants} title="Rare Variants" subtitle="This is the list of rare compound heterozgote variants (more than one variant in a given gene) found in this individual obtained with allele frequency thresholds." />
                  </TabPanel>
                </SwipeableViews>
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
  }
});

export default withStyles(styles, { withTheme: true })(Individual);
