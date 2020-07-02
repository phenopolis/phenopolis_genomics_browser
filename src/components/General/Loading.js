import React from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';

import { CssBaseline, Paper, Container, Box, Typography, Grid } from '@material-ui/core';

import '../../assets/css/loading.css';

const Loading = ({ message }) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.root}>
        <Container maxWidth="md">
          <Paper className={classes.paper}>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: '30vh' }}>
              <Grid item xs={3}>
                <div class="loader">
                  <div class="dot dot1">
                    <i></i>
                  </div>
                  <div class="dot dot2">
                    <i></i>
                  </div>
                  <div class="dot dot3">
                    <i></i>
                  </div>
                  <div class="dot dot4">
                    <i></i>
                  </div>
                  <div class="dot dot5">
                    <i></i>
                  </div>
                  <div class="dot dot6">
                    <i></i>
                  </div>
                  <div class="dot dot7">
                    <i></i>
                  </div>
                  <div class="dot dot8">
                    <i></i>
                  </div>
                  <div class="dot dot9">
                    <i></i>
                  </div>
                </div>
              </Grid>
              <Grid item xs={10} className="mt-5 mb-3">
                <Typography component="div">
                  <Box fontSize="h5.fontSize" style={{ color: 'grey', fontWeight: '700' }} m={2}>
                    {message}
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </div>
    </React.Fragment>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '5em',
  },
  paper: {
    padding: '5em',
  },
  progress: {
    color: '#2E84CF',
    marginTop: '3em',
  },
}));

Loading.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default Loading;
