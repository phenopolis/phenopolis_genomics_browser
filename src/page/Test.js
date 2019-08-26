import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Container, Button, Popover } from '@material-ui/core';

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewInfo: [],
      loaded: false
    };
  }

  getTestInformation = () => {
    var self = this;
    axios
      .get('/api/individual/PH00002672/preview', {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        console.log(respond[0]);
        self.setState({
          previewInfo: respond[0],
          loaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    this.getTestInformation()
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <CssBaseline />
        <Container>
          <Popover
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
          >
            The content of the Popover.
</Popover>
        </Container>
      </React.Fragment>
    )
  }
}

Test.propTypes = {
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

export default withStyles(styles)(Test);
