import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  CssBaseline,
  AppBar,
  Tabs,
  Tab,
  Container,
  Paper,
  Box,
  Typography,
} from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';

import Loading from '../components/General/Loading';
import TabPanel from '../components/Tab/Tabpanel';

import MetaData from '../components/Gene/MetaData';
import VirtualGrid from '../components/Table/VirtualGrid';

import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { setSnack } from '../redux/actions/snacks';

import { withTranslation, Trans } from 'react-i18next';

class HPO extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hpoInfo: {},
      loaded: false,
      value: 0,
      phenogenonvalue: 0,
      redirect: false,
      reLink: '',
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  handleChangeIndex = (index) => {
    this.setState({ value: index });
  };

  handleChangePhenogenon = (event, newValue) => {
    this.setState({ phenogenonvalue: newValue });
  };

  handleChangePhenogenonIndex = (index) => {
    this.setState({ phenogenonvalue: index });
  };

  a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  };

  getHPOinformation = (hpoId) => {
    var self = this;
    axios
      // .get('/api/' + i18next.t('HPO.entry') + '/hpo/' + hpoId, {
      .get('/api/hpo/' + hpoId, {
        withCredentials: true,
      })
      .then((res) => {
        let respond = res.data;
        console.log(respond[0]);

        if (respond[0] === undefined) {
          this.setState({ redirect: true, reLink: '/search' });
          this.props.setSnack('HPM not exist.', 'warning');
        } else {
          self.setState({
            hpoInfo: respond[0],
            loaded: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 401) {
          this.setState({ redirect: true, reLink: '/login?link=' + window.location.pathname });
        }
      });
  };

  componentDidMount() {
    this.getHPOinformation(this.props.match.params.hpoId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.hpoId !== this.props.match.params.hpoId) {
      this.setState({
        hpoInfo: [],
        loaded: false,
      });
      this.getHPOinformation(nextProps.match.params.hpoId);
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
            <MetaData
              metadata={this.state.hpoInfo.metadata}
              name={
                this.state.hpoInfo.metadata.data[0].name +
                ' - ' +
                this.state.hpoInfo.metadata.data[0].id
              }
            />

            <Container maxWidth="xl">
              <Paper className={classes.paper}>
                <AppBar position="static" color="white" elevation="0" m={0} p={0}>
                  <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                    classes={{ indicator: classes.bigIndicator }}>
                    {[
                      t('HPO.INDIVIDUALS'),
                      t('HPO.LITERATURE_GENES'),
                      t('HPO.PHENOGENON'),
                      t('HPO.SKAT'),
                    ].map((item, index) => {
                      return <Tab label={item} {...this.a11yProps(index)} />;
                    })}
                  </Tabs>
                </AppBar>
                <SwipeableViews
                  axis={this.props.theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={this.state.value}
                  onChangeIndex={this.handleChangeIndex}>
                  <TabPanel value={this.state.value} index={0} dir={this.props.theme.direction}>
                    <VirtualGrid
                      tableData={this.state.hpoInfo.individuals}
                      title={t('HPO.Individuals')}
                      subtitle={t('HPO.Individuals_subtitle')}
                      configureLink="hpo/individuals"
                    />
                    {/* <Variants variants={this.state.hpoInfo.individuals} title={t("HPO.Individuals")} subtitle={t("HPO.Individuals_subtitle")} configureLink="hpo/individuals" /> */}
                  </TabPanel>
                  <TabPanel value={this.state.value} index={1} dir={this.props.theme.direction}>
                    <VirtualGrid
                      tableData={this.state.hpoInfo.literature_genes}
                      title={t('HPO.Literature_Genes')}
                      subtitle={t('HPO.Literature_Genes_subtitle')}
                      configureLink="hpo/literature_genes"
                    />
                    {/* <Variants variants={this.state.hpoInfo.literature_genes} title={t("HPO.Literature_Genes")} subtitle={t("HPO.Literature_Genes_subtitle")} configureLink="hpo/literature_genes" /> */}
                  </TabPanel>

                  {/* Phenogenon tab is more complex. */}
                  <TabPanel value={this.state.value} index={2} dir={this.props.theme.direction}>
                    <Typography component="div">
                      <Box fontWeight="900" fontSize="h4.fontSize" mb={0}>
                        {t('HPO.Phenogenon')}
                      </Box>
                      <Box fontWeight="fontWeightLight" mb={2}>
                        {t('HPO.Phenogenon_subtitle')}
                      </Box>
                    </Typography>
                    <AppBar position="static" color="white" elevation="0" m={0} p={0}>
                      <Tabs
                        value={this.state.phenogenonvalue}
                        onChange={this.handleChangePhenogenon}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                        classes={{ indicator: classes.bigIndicator }}>
                        {[t('HPO.RECESSIVE'), t('HPO.DOMINANT')].map((item, index) => {
                          return <Tab label={item} {...this.a11yProps(index)} />;
                        })}
                      </Tabs>
                    </AppBar>
                    <SwipeableViews
                      axis={this.props.theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                      index={this.state.phenogenonvalue}
                      onChangeIndex={this.handleChangePhenogenonIndex}>
                      <TabPanel
                        value={this.state.phenogenonvalue}
                        index={0}
                        dir={this.props.theme.direction}>
                        <VirtualGrid
                          tableData={this.state.hpoInfo.phenogenon_recessive}
                          title={t('Recessive')}
                          subtitle={[
                            <Trans i18nKey="HPO.RECESSIVE_subtitle">
                              <b>Genotype</b> : With at least two variants on a given gene that have
                              ExAC homozygous count not higher than{' '}
                              <b style={{ color: '#2E84CF' }}>2</b>, and CADD phred score not lower
                              than <b style={{ color: '#2E84CF' }}>15</b>.
                            </Trans>,
                          ]}
                          configureLink="hpo/phenogenon_recessive"
                        />

                        {/* <Variants variants={this.state.hpoInfo.phenogenon_recessive} title={t("Recessive")} subtitle={[
                          <Trans i18nKey="HPO.RECESSIVE_subtitle">
                            <b>Genotype</b> : With at least two variants on a given gene that have ExAC homozygous count not higher than <b style={{ color: '#2E84CF' }}>2</b>, and CADD phred score not lower than <b style={{ color: '#2E84CF' }}>15</b>.
                          </Trans>
                        ]} configureLink="hpo/phenogenon_recessive" /> */}
                      </TabPanel>
                      <TabPanel
                        value={this.state.phenogenonvalue}
                        index={1}
                        dir={this.props.theme.direction}>
                        <VirtualGrid
                          tableData={this.state.hpoInfo.phenogenon_dominant}
                          title={t('Dominant')}
                          subtitle={[
                            <Trans i18nKey="HPO.DOMINANT_subtitle">
                              <b>Genotype</b> : With at least one variant on a given gene that has
                              an ExAC heterozygous count not higher than ",{' '}
                              <b style={{ color: '#2E84CF' }}>0.0001</b>, ", and CADD phred score
                              not lower than ", <b style={{ color: '#2E84CF' }}>15</b>, "."
                            </Trans>,
                          ]}
                          configureLink="hpo/phenogenon_dominant"
                        />

                        {/* <Variants variants={this.state.hpoInfo.phenogenon_dominant} title={t("Dominant")} subtitle={[
                          <Trans i18nKey="HPO.DOMINANT_subtitle">
                            <b>Genotype</b> : With at least one variant on a given gene that has an ExAC heterozygous count not higher than ", <b style={{ color: '#2E84CF' }}>0.0001</b>, ", and CADD phred score not lower than ", <b style={{ color: '#2E84CF' }}>15</b>, "."
                          </Trans>
                        ]} configureLink="hpo/phenogenon_dominant" /> */}
                      </TabPanel>
                    </SwipeableViews>
                  </TabPanel>

                  <TabPanel value={this.state.value} index={3} dir={this.props.theme.direction}>
                    <VirtualGrid
                      tableData={this.state.hpoInfo.skat}
                      title={t('HPO.SKAT')}
                      subtitle={t('HPO.SKAT_subtitle')}
                      configureLink="hpo/skat"
                    />
                    {/* <Variants variants={this.state.hpoInfo.skat} title={t("HPO.SKAT")} subtitle={t("HPO.SKAT_subtitle")} configureLink="hpo/skat" /> */}
                  </TabPanel>
                </SwipeableViews>
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={t('HPO.message')} />;
    }
  }
}

HPO.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    backgroundColor: '#eeeeee',
    padding: '4em',
  },
  tabroot: {
    backgroundColor: 'white',
  },
  bigIndicator: {
    height: 3,
    backgroundColor: '#2E84CF',
  },
  paper: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(5),
  },
});

export default compose(
  withStyles(styles, { withTheme: true }),
  withTranslation(),
  connect(null, { setSnack })
)(HPO);
