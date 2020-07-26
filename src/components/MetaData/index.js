import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  CssBaseline,
  Paper,
  Container,
  Grid,
  Typography,
  Box,
  IconButton,
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import TypeChip from '../Chip/TypeChip';

import blue from '@material-ui/core/colors/blue';

import { Collapse } from 'react-collapse';
import { SizeMe } from 'react-sizeme';

class MetaData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expandNumber: 3,
    };
  }

  handleExpendAll = (n) => {
    this.setState({ expandNumber: n });
  };

  render() {
    const { classes } = this.props;
    const metadata = this.props.metadata;

    return (
      <React.Fragment>
        <CssBaseline />
        <Container maxWidth="xl">
          <Typography component="div">
            <Box fontWeight="900" fontSize="h4.fontSize" mb={2}>
              {this.props.name}
            </Box>
          </Typography>

          <Paper className={classes.paper} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: '100' }}>
              <IconButton aria-label="expand">
                {this.state.expandNumber === 3 ? (
                  <ExpandMoreIcon onClick={() => this.handleExpendAll(100)} />
                ) : (
                  <ExpandLessIcon onClick={() => this.handleExpendAll(3)} />
                )}
              </IconButton>
            </div>
            <SizeMe>
              {({ size }) => (
                <div className={classes.root}>
                  <Collapse isOpened={true}>
                    {metadata.colNames.slice(0, this.state.expandNumber).map((item, index) => {
                      return (
                        <Grid container spacing={3} key={index} className={classes.blockgrid}>
                          <Grid item xs={4} md={2} className={classes.namegrid}>
                            {item.name}
                          </Grid>

                          <Grid item xs={8} md={10}>
                            {typeof metadata.data[0][item.key] !== 'object' ? (
                              <span>
                                {(item.key === 'start') | (item.key === 'stop')
                                  ? Number(metadata.data[0][item.key]).toLocaleString()
                                  : metadata.data[0][item.key]}
                              </span>
                            ) : (
                              metadata.data[0][item.key].map((chip, m) => {
                                return chip.href ? (
                                  <TypeChip
                                    label={chip.display}
                                    type="other"
                                    size="small"
                                    action="forward"
                                    popover={false}
                                    to={chip.href}
                                  />
                                ) : (
                                  <TypeChip
                                    label={chip.display}
                                    type={
                                      item.base_href
                                        ? item.base_href.replace(/[^a-zA-Z0-9_-]/g, '')
                                        : item.href.replace(/[^a-zA-Z0-9_-]/g, '')
                                    }
                                    size="small"
                                    action="forward"
                                    popover={true}
                                    to={
                                      chip.end_href
                                        ? (item.base_href + '/' + chip.end_href).replace(
                                            /\/\//g,
                                            '/'
                                          )
                                        : item.base_href
                                        ? (item.base_href + '/' + chip.display).replace(
                                            /\/\//g,
                                            '/'
                                          )
                                        : (item.href + '/' + chip.display).replace(/\/\//g, '/')
                                    }
                                  />
                                );
                              })
                            )}
                          </Grid>
                        </Grid>
                      );
                    })}
                    {this.state.expandNumber === 3 ? (
                      <div className={classes.blockFade}>
                        <span
                          onClick={() => this.handleExpendAll(100)}
                          className={classes.expandButton}
                          style={{ width: size.width }}>
                          Expand More
                        </span>
                      </div>
                    ) : null}
                  </Collapse>
                </div>
              )}
            </SizeMe>
          </Paper>
        </Container>
      </React.Fragment>
    );
  }
}

MetaData.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  paper: {
    padding: theme.spacing(3),
    backgroundImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 100%)',
  },
  root: {
    flexGrow: 1,
    backgroundImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 100%)',
  },
  blockgrid: {
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
      backgroundColor: '#f5f5f5',
    },
  },
  blockFade: {
    position: 'absolute',
    bottom: '0px',
    display: 'block',
    height: '100px',
    textAlign: 'center',
    paddingTop: '80px',
    marginLeft: 'auto',
    marginRight: 'auto',
    left: '0',
    right: '0',
    backgroundImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9) 100%)',
  },
  expandButton: {
    color: blue[500],
    fontWeight: '500',
    cursor: 'pointer',
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
    },
  },
  namegrid: {
    borderRight: '1px solid #e0e0e0',
  },
  datagrid: {
    borderBottom: '1px solid #e0e0e0',
  },
});

export default withStyles(styles)(MetaData);
