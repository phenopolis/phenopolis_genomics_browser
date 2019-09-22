import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Paper, Container, Grid, Chip, Typography,
  Box, Popover, CircularProgress
} from '@material-ui/core';
import { Link } from 'react-router-dom';

class MetaData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openPreview: false,
      anchorEl: null,
      previewName: null,
      previewInfo: null,
      previewLoaded: false
    };
  }

  getPreviewInformation = (link) => {
    var self = this;
    axios
      .get('/api/' + link + '/preview', {
        withCredentials: true
      })
      .then(res => {
        let respond = res.data;
        self.setState({
          previewInfo: respond[0],
          previewLoaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handlePopoverOpen = (name, link, event) => {
    this.setState({ anchorEl: event.currentTarget, previewName: name });
    this.getPreviewInformation(link)
  }

  handlePopoverClose = () => {
    this.setState({
      anchorEl: null, previewInfo: [],
      previewName: null,
      previewLoaded: false
    });
  }

  render() {
    const { classes } = this.props;
    const metadata = this.props.metadata;
    const open = Boolean(this.state.anchorEl);

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
                                  variant="outlined"
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
                                    variant="outlined"
                                    size='small'
                                    label={chip.display}
                                    className={classes.chip}
                                    component={Link}
                                    to={chip.end_href ? (item.base_href + '/' + chip.end_href).replace(/\/\//g, '/') : (item.base_href + '/' + chip.display).replace(/\/\//g, '/')}
                                    clickable
                                    aria-owns={open ? 'mouse-over-popover' : undefined}
                                    aria-haspopup="true"
                                    onMouseEnter={(event) => this.handlePopoverOpen(chip.display,
                                      chip.end_href ? (item.base_href + '/' + chip.end_href).replace(/\/\//g, '/') : (item.base_href + '/' + chip.display).replace(/\/\//g, '/')
                                      , event)}
                                    onMouseLeave={this.handlePopoverClose}
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
        <Popover
          id="mouse-over-popover"
          className={classes.popover}
          classes={{
            paper: classes.paperPopover,
          }}
          open={open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
          elevation={0}
        >
          < Container className="arrow_box">
            <Typography variant="subtitle1" style={{ 'font-weight': 'bold', color: 'yellow' }}>
              {this.state.previewName}

              {
                this.state.previewLoaded !== true &&
                <small style={{ color: 'white' }}>  &nbsp;(Loading ...
                <CircularProgress size={18} color="white" />
                  &nbsp; &nbsp;)
                </small>
              }
            </Typography>
          </Container>

          {
            this.state.previewLoaded === true &&
            < Container style={{ background: '#242424', 'min-width': '25em', 'border-radius': '0.3em', 'padding-bottom': '1em' }}>
              {
                this.state.previewInfo.preview.map((item, index) => {
                  return (
                    <Grid
                      container
                      spacing={1}
                      key={index}
                      className={classes.blockgrid}>
                      <Grid item xs={4} className={classes.namegrid}>
                        {item[0]}
                      </Grid>

                      <Grid item xs={8} className={classes.datagrid}>
                        {item[1]}
                      </Grid>
                    </Grid>
                  )
                })
              }
            </Container>
          }
        </Popover>
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
  },
  popover: {
    pointerEvents: 'none',
    marginLeft: '0.2em'
  },
  paperPopover: {
    padding: theme.spacing(1),
    color: 'white',
    backgroundColor: 'transparent'
  },
  datagrid: {
    borderBottom: '1px solid gray'
  }
});

export default withStyles(styles)(MetaData);
