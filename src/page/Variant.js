import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import MetaData from '../components/Gene/MetaData';
import Loading from '../components/General/Loading';

class Variant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variantInfo: {},
      loaded: false
    };
  }

  componentDidMount() {
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
      });
  }

  render() {
    const { classes } = this.props;

    if (this.state.loaded) {
      return (
        <React.Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <MetaData metadata={this.state.variantInfo.metadata} name={this.state.variantInfo.metadata.data[0].variant_id[0].display} />
          </div>
        </React.Fragment>
      );
    } else {
      return <Loading />;
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
  }
});

export default withStyles(styles)(Variant);
