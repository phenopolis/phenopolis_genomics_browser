import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { CssBaseline, Paper, Container, Box, Typography,
         LinearProgress } from '@material-ui/core';

class Loading extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        <div className={classes.root}>
          <Container maxWidth='md'>
            <Paper className={classes.paper}>
              <Typography component='div'>
                <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
                  {this.props.message}
                </Box>
              </Typography>
              <LinearProgress color='secondary' className={classes.progress} />
            </Paper>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '5em'
  },
  paper: {
    padding: theme.spacing(5)
  },
  progress: {
    color: '#2E84CF',
    marginTop: '3em'
  }
});

Loading.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Loading);
