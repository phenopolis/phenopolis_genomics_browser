import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Paper, Container, Grid, Chip, Typography,
  Box
} from '@material-ui/core';
import { Link } from 'react-router-dom';

class MetaData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    const metadata = this.props.metadata;

    return (
      <React.Fragment>
        <CssBaseline />
        <Container maxWidth='xl'>
          <Paper className={classes.paper}>
            <div className={classes.root}>
              <Typography component='div'>
                <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' mb={2}>
                  {this.props.name}
                </Box>
              </Typography>

              {metadata.colNames.map((item, index) => {
                return (
                  <Grid
                    container
                    spacing={3}
                    key={index}
                    className={classes.blockgrid}>
                    <Grid item xs={2} className={classes.namegrid}>
                      {item.name}
                    </Grid>

                    <Grid item xs={10}>
                      {typeof metadata.data[0][item.key] !== 'object' ? (
                        <span> {metadata.data[0][item.key]} </span>
                      ) : (
                          metadata.data[0][item.key].map((chip, m) => {
                            return (
                              chip.href ? (
                                <Chip
                                  key={m}
                                  size='small'
                                  label={chip.display}
                                  className={classes.chip}
                                  component='a'
                                  href={chip.href}
                                  clickable
                                />
                              ) : (
                                  <Chip
                                    key={m}
                                    size='small'
                                    label={chip.display}
                                    className={classes.chip}
                                    component={Link}
                                    to={chip.end_href ? (item.base_href + '/' + chip.end_href).replace(/\/\//g, '/') : (item.base_href + '/' + chip.display).replace(/\/\//g, '/') }
                                    clickable
                                  />
                                )
                            );
                          })
                        )}
                    </Grid>
                  </Grid>
                );
              })}
            </div>
          </Paper>
        </Container>
      </React.Fragment>
    );
  }
}

MetaData.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  paper: {
    padding: theme.spacing(3)
  },
  root: {
    flexGrow: 1
  },
  blockgrid: {
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
      backgroundColor: '#f5f5f5'
    }
  },
  namegrid: {
    borderRight: '1px solid gray'
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
    }
  }
});

export default withStyles(styles)(MetaData);
