import React from 'react';

import { CssBaseline, Paper, Container, Box, Typography, Grid } from '@material-ui/core';

const Loading = ({ message }) => {
  return (
    <React.Fragment>
      <CssBaseline />
      <div className={'loading-root'} style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}>
        <Container maxWidth="md">
          <Paper elevation={0} className={'loading-paper'} style={{ backgroundColor: '#eeeeee' }}>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              className={'loading-height--md'}>
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
                  <Box fontSize="h5.fontSize" className={'loading-message'} m={2}>
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

export default Loading;
