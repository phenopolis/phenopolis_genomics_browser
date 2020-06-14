import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container } from '@material-ui/core';
import { Redirect } from 'react-router';

import Loading from '../components/General/Loading';

import compose from 'recompose/compose';

import { connect } from 'react-redux';
import { setSnack } from '../redux/actions'

import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

const MetaData = React.lazy(() => import('../components/Gene/MetaData'));
const VirtualGrid = React.lazy(() => import('../components/Table/VirtualGrid'));

class Gene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geneInfo: {},
      variants: [],
      loaded: false,
      redirect: false,
      reLink: ""
    };
  }

  getGeneInformation = (geneId) => {
    var self = this;
    axios
      // .get('/api/' + i18next.t('Gene.entry') + '/gene/' + geneId, {
      .get('/api/gene/' + geneId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        respond[0].variants.colNames[0].key = "CHROM"
        console.log(respond[0]);
        self.setState({
          geneInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err.response);
        if (err.response.status === 401) {
          this.setState({ redirect: true, reLink: '/login?link=' + window.location.pathname });
        } else if (err.response.status === 404) {
          this.setState({ redirect: true, reLink: "/search" });
          this.props.setSnack("Gene not exist.", "warning")
        }
      });
  }

  componentDidMount() {
    this.getGeneInformation(this.props.match.params.geneId)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.geneId !== this.props.match.params.geneId) {
      this.setState({
        geneInfo: [],
        loaded: false
      });
      this.getGeneInformation(this.props.match.params.geneId)
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
            <MetaData metadata={this.state.geneInfo.metadata} name={this.state.geneInfo.metadata.data[0].gene_name + ' - ' + this.state.geneInfo.metadata.data[0].full_gene_name} />

            <Container maxWidth='xl'>
              {/* <Paper elevation={0} className={classes.paper}> */}
              <VirtualGrid tableData={this.state.geneInfo.variants} title={t('Gene.Variants_Analysis')} subtitle={t('Gene.Variants Analysis_subtitle')} configureLink="gene/variants" />
              {/* <ReactVirtualizedTable results={this.state.geneInfo.variants} data={this.state.geneInfo.variants.data} mycolumn={this.state.geneInfo.variants.colNames} /> */}
              {/* <Variants variants={this.state.geneInfo.variants} title={t('Gene.Variants_Analysis')} subtitle={t('Gene.Variants Analysis_subtitle')} configureLink="gene/variants" /> */}
              {/* </Paper> */}
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={t('Gene.message')} />;
    }
  }
}

Gene.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    backgroundColor: '#eeeeee',
    padding: '4em'
  },
  paper: {
    overflowX: 'auto',
    marginTop: theme.spacing(5)
  }
});

export default compose(
  withStyles(styles),
  withTranslation(),
  connect(
    null,
    { setSnack }
  ))(Gene)
