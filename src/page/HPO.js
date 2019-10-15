import React from 'react';
import axios from 'axios';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, AppBar, Tabs, Tab, Container, Paper, Box, Typography } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

import Loading from '../components/General/Loading';
import TabPanel from '../components/Tab/Tabpanel'

import MetaData from '../components/Gene/MetaData';
import Variants from '../components/Gene/Variants';


class HPO extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hpoInfo: {},
      loaded: false,
      value: 0,
      phenogenonvalue: 0
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue })
  }

  handleChangeIndex = (index) => {
    this.setState({ value: index })
  }

  handleChangePhenogenon = (event, newValue) => {
    this.setState({ phenogenonvalue: newValue })
  }

  handleChangePhenogenonIndex = (index) => {
    this.setState({ phenogenonvalue: index })
  }

  a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  getHPOinformation = (hpoId) => {
    var self = this;
    axios
      .get('/api/hpo/' + hpoId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          hpoInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getHPOinformation(this.props.match.params.hpoId)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.hpoId !== this.props.match.params.hpoId) {
      this.setState({
        hpoInfo: [],
        loaded: false
      });
      this.getHPOinformation(nextProps.match.params.hpoId)
    }
  }


  render() {
    const { classes } = this.props;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.hpoInfo.metadata} name={this.state.hpoInfo.metadata.data[0].name + ' - ' + this.state.hpoInfo.metadata.data[0].id} />

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
                    {['INDIVIDUALS', 'LITERATURE GENES', 'PHENOGENON', 'SKAT'].map((item, index) => {
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
                    <Variants variants={this.state.hpoInfo.individuals} title="Individuals" subtitle="Below is a list of individuals who have this phenotype or a descendant of it." configureLink="hpo/individuals" />
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <Variants variants={this.state.hpoInfo.literature_genes} title="Literature Genes" subtitle="Below is a list of the literature genes from OMIM which are associated with this phenotype." configureLink="hpo/literature_genes" />
                  </TabPanel>

                  {/* Phenogenon tab is more complex. */}
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <Typography component='div'>
                      <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' mb={0}>Phenogenon</Box>
                      <Box fontWeight='fontWeightLight' mb={2}>Below is a list of the significant Phenogenon genes.</Box>
                    </Typography>
                    <AppBar position="static" color="white" elevation="0" m={0} p={0}>
                      <Tabs
                        value={this.state.phenogenonvalue}
                        onChange={this.handleChangePhenogenon}
                        indicatorColor='primary'
                        textColor='primary'
                        variant="fullWidth"
                        aria-label="full width tabs example"
                        classes={{ indicator: classes.bigIndicator }}
                      >
                        {['RECESSIVE', 'DOMINANT'].map((item, index) => {
                          return (
                            <Tab label={item} {...this.a11yProps(index)} />
                          )
                        })}
                      </Tabs>
                    </AppBar>
                    <SwipeableViews
                      axis={this.props.theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                      index={this.state.phenogenonvalue}
                      onChangeIndex={this.handleChangePhenogenonIndex}
                    >
                      <TabPanel value={this.state.phenogenonvalue} index={0} dir={this.props.theme.direction}>
                        <Variants variants={this.state.hpoInfo.phenogenon_recessive} title="Recessive" subtitle={[<strong>Genotype</strong>, ": With at least two variants on a given gene that have ExAC homozygous count not higher than ", <b style={{ color: '#2E84CF' }}>2</b>, ", and CADD phred score not lower than ", <b style={{ color: '#2E84CF' }}>15</b>, "."]} configureLink="hpo/phenogenon_recessive" />
                      </TabPanel>
                      <TabPanel value={this.state.phenogenonvalue} index={1} dir={this.props.theme.direction}>
                        <Variants variants={this.state.hpoInfo.phenogenon_dominant} title="Dominant" subtitle={[<strong>Genotype</strong>, ": With at least one variant on a given gene that has an ExAC heterozygous count not higher than ", <b style={{ color: '#2E84CF' }}>0.0001</b>, ", and CADD phred score not lower than ", <b style={{ color: '#2E84CF' }}>15</b>, "."]} configureLink="hpo/phenogenon_dominant" />
                      </TabPanel>
                    </SwipeableViews>
                  </TabPanel>

                  <TabPanel value={this.state.value} index={3} dir={this.props.theme.direction}>
                    <Variants variants={this.state.hpoInfo.skat} title="SKAT" subtitle="Below is a list of genes and their variants from the Sequence Kernel Association Test (SKAT)." configureLink="hpo/skat" />
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={'Loading HPO Information from Server...'} />;
    }
  }
}

HPO.propTypes = {
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

export default withStyles(styles, { withTheme: true })(HPO);
