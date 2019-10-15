import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container } from '@material-ui/core';

import MetaData from '../components/Gene/MetaData';
import Variants from '../components/Gene/Variants';
import Loading from '../components/General/Loading';

class Gene extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geneInfo: {},
      loaded: false
    };
  }

  getGeneInformation = (geneId) => {
    var self = this;
    axios
      .get('/api/gene/' + geneId, {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          geneInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
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

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.geneInfo.metadata} name={this.state.geneInfo.metadata.data[0].gene_name + ' - ' + this.state.geneInfo.metadata.data[0].full_gene_name} />

            <Container maxWidth='xl'>
              <Paper className={classes.paper}>
                <Variants variants={this.state.geneInfo.variants} title="Variants Analysis" subtitle="Here are a list of variants found within this gene." configureLink="gene/variants" />
              </Paper>
            </Container>
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading message={'Loading Gene Information from Server...'} />;
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
    padding: theme.spacing(3),
    marginTop: theme.spacing(5)
  }
});

export default withStyles(styles)(Gene);
