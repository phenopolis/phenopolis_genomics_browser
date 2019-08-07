import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

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

  componentDidMount() {
    var self = this;
    axios
      .get('/api/gene/' + this.props.match.params.geneId, {
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

  render() {
    const { classes } = this.props;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.geneInfo.metadata} />
            <Variants variants={this.state.geneInfo.variants} />
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading />;
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
  }
});

export default withStyles(styles)(Gene);
