import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container } from '@material-ui/core';
import { Redirect } from 'react-router';

import MetaData from '../components/Gene/MetaData';

import Variants from '../components/Gene/Variants';
import ReactVirtualizedTable from '../components/Table/ReactVirtualizedTable'
import VirtualGrid from '../components/Table/VirtualGrid'

import Loading from '../components/General/Loading';

import compose from 'recompose/compose';
import { withTranslation, Trans } from 'react-i18next';
import i18next from "i18next";

class Gene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geneInfo: {},
      variants: [],
      loaded: false,
      redirect: false
    };
  }

  getGeneInformation = (geneId) => {
    var self = this;
    axios
      .get('/api/' + i18next.t('Gene.entry') + '/gene/' + geneId, {
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
        // console.log(err);
        // if (err.response.data.error === 'Unauthenticated') {
        //   this.setState({ redirect: true });
        // }
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
      return <Redirect to={'/login?link=' + window.location.pathname} />;
    }

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.geneInfo.metadata} name={this.state.geneInfo.metadata.data[0].gene_name + ' - ' + this.state.geneInfo.metadata.data[0].full_gene_name} />

            <Container maxWidth='xl'>
              <Paper className={classes.paper}>
                <VirtualGrid mycolumns={this.state.geneInfo.variants.colNames} myrows={this.state.geneInfo.variants.data} />
                {/* <ReactVirtualizedTable results={this.state.geneInfo.variants} data={this.state.geneInfo.variants.data} mycolumn={this.state.geneInfo.variants.colNames} /> */}
                {/* <Variants variants={this.state.geneInfo.variants} title={t('Gene.Variants_Analysis')} subtitle={t('Gene.Variants Analysis_subtitle')} configureLink="gene/variants" /> */}
              </Paper>
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

export default compose(withStyles(styles), withTranslation())(Gene)
