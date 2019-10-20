import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import {
  CssBaseline, Paper, Typography, Box, Chip, Grid, Collapse,
  Checkbox, FormControlLabel, Tooltip, Table, TableBody, TableCell,
  TableRow, TablePagination, Button, Popover, Container, CircularProgress
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import "../../assets/css/arrowbox.css";

import TableHeader from '../Table/TableHeader';
import TablePaginationActions from '../Table/TablePaginationActions';

import { setSnack } from '../../redux/actions';
const qs = require('querystring');


function desc(a, b, orderBy) {
  if (!isNaN(b[orderBy])) {
    if (Number(b[orderBy]) < Number(a[orderBy])) {
      return -1;
    }
    if (Number(b[orderBy]) > Number(a[orderBy])) {
      return 1;
    }
    return 0;
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy);
}

class Variant extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variants: JSON.parse(JSON.stringify(this.props.variants.data)),
      filtered: JSON.parse(JSON.stringify(this.props.variants.data)),
      header: JSON.parse(JSON.stringify(this.props.variants.colNames)),
      filter: JSON.parse(
        JSON.stringify(
          this.props.variants.colNames.map(element => {
            return { column: element.key, operation: null, filter: '' };
          })
        )
      ),
      rowsPerPage: 10,
      page: 0,
      order: 'asc',
      orderBy: 'variant_id',
      checkfilter: false,
      checkedB: false,
      openPreview: false,
      anchorEl: null,
      previewName: null,
      previewInfo: null,
      previewLoaded: false
    };
  }

  handleChangePage = (event, newPage) => {
    this.setState({ page: newPage });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
    this.setState({ page: 0 });
  };

  handleRequestSort = (event, property) => {
    const isDesc =
      this.state.orderBy === property && this.state.order === 'desc';
    this.setState({ order: isDesc ? 'asc' : 'desc' });
    this.setState({ orderBy: property, page: 0 });
  };

  handleUpdateFilter = (operation, filter, index) => {
    const newFilter = [...this.state.filter];
    newFilter[index].operation = operation;
    newFilter[index].filter = filter;
    this.setState({ filter: newFilter });
    this.columnFilter(this.state.variants, this.state.filter);
  };

  handleCheckFilter = () => {
    this.setState({ checkfilter: !this.state.checkfilter });
  };

  handleCheckChange = index => event => {
    // console.log(index);
    // console.log(event.target.checked);
    // this.setState({ checkedB: event.target.checked });

    const newHeader = [...this.state.header];
    newHeader[index].default = event.target.checked;
    this.setState({ header: newHeader });
  };

  columnFilter = (data, filters) => {
    var filtered = data.filter(item => {
      var judge = true;
      Array.prototype.forEach.call(filters, (filter, index) => {
        switch (filter.operation) {
          case '>':
            if (Number(item[filter.column]) > filter.filter) {
              break;
            } else {
              judge = false;
              break;
            }
          case '>=':
            if (Number(item[filter.column]) >= filter.filter) {
              break;
            } else {
              judge = false;
              break;
            }
          case '<':
            if (Number(item[filter.column]) < filter.filter) {
              break;
            } else {
              judge = false;
              break;
            }
          case '<=':
            if (Number(item[filter.column]) <= filter.filter) {
              break;
            } else {
              judge = false;
              break;
            }
          case 'search':
            if (typeof item[filter.column] !== 'object') {
              if (RegExp(filter.filter).test(item[filter.column])) {
                break;
              } else {
                judge = false;
                break;
              }
            } else {
              if (typeof item[filter.column][0] === 'object' & item[filter.column][0] !== null) {
                let displays = item[filter.column].filter(chip => {
                  return RegExp(filter.filter).test(chip.display);
                });
                if (displays.length > 0) {
                  break;
                } else {
                  judge = false;
                  break;
                }
              } else {
                if (RegExp(filter.filter).test(item[filter.column].join(','))) {
                  break;
                } else {
                  judge = false;
                  break;
                }
              }
            }

          default:
            break;
        }
      });
      return judge;
    });
    // return filtered;
    this.setState({ filtered: filtered, page: 0 });
  };

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

  handleSaveConfigure = () => {

    var formData = qs.stringify({
    });

    this.state.header.forEach((h, index) => {
      if (h.default) {
        if (index === 0) {
          formData = formData + 'colNames%5B%5D=' + h.key.split(" ").join("+")
        } else {
          formData = formData + '&' + 'colNames%5B%5D=' + h.key.split(" ").join("+")
        }
      }
    })

    axios
      .post('/api/save_configuration/' + this.props.configureLink, formData, { withCredentials: true })
      .then(res => {
        let respond = res.data;
        console.log(respond)
        // if (respond.success === true) {
        //   this.props.refreshData(this.props.patientName)
        //   this.handleClose()
        // }
        this.props.setSnack('Save Configuration Success!', 'success')
      })
      .catch(err => {
        this.props.setSnack('Save Configuration Failed.', 'error')
      });

  }

  render() {
    const { classes } = this.props;
    const open = Boolean(this.state.anchorEl);

    return (
      <React.Fragment>
        <CssBaseline />
        <Typography component='div'>
          <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' mb={0}>
            {this.props.title}
          </Box>
          <Box fontWeight='fontWeightLight' mb={2}>
            {this.props.subtitle}
          </Box>
        </Typography>

        <Button
          variant='outlined'
          className={classes.button}
          onClick={event => this.handleCheckFilter(event)}>
          Select Table Column
            </Button>
        <div className={classes.container}>
          <Collapse in={this.state.checkfilter}>
            <Paper elevation={0} className={classes.paper}>
              <Grid container>
                {this.state.header.map((h, i) => {
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={3}
                      lg={2}
                      key={i}
                      style={{ margin: 0, padding: 0 }}>
                      {
                        h.description ?
                          (
                            <StyledTooltip title={h.description} placement='top'>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={h.default}
                                    onChange={this.handleCheckChange(i)}
                                    // value='checkedB'
                                    color='primary'
                                  />
                                }
                                label={h.name}
                              />
                            </StyledTooltip>
                          ) :
                          (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={h.default}
                                  onChange={this.handleCheckChange(i)}
                                  // value='checkedB'
                                  color='primary'
                                />
                              }
                              label={h.name}
                            />
                          )
                      }

                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
            <Grid
              container
              direction="row"
              justify="flex-end"
              alignItems="center"
            >
              <Button
                variant="outlined"
                color="secondary"
                className={classes.button2}
                onClick={this.handleSaveConfigure}>
                <SaveIcon className={classes.leftIcon} />
                Save Column Configuration
              </Button>
            </Grid>
          </Collapse>
        </div>

        <div className={classes.root}>
          <Grid
            container
            direction='column'
            justify='center'
            alignItems='stretch'>
            <Grid container
              direction="row"
              justify="flex-end"
              alignItems="center">
              <TablePagination
                className={classes.pagination}
                rowsPerPageOptions={[10, 25, 50, 75, 100]}
                count={this.state.filtered.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </Grid>
            <Grid item xs={12}>
              <div className={classes.tableWrapper}>
                <Table className={classes.table}>
                  <TableHeader
                    header={this.state.header}
                    filter={this.state.filter}
                    order={this.state.order}
                    orderBy={this.state.orderBy}
                    onRequestSort={this.handleRequestSort}
                    onUpdateFilter={this.handleUpdateFilter}
                  />
                  <TableBody>
                    {
                      stableSort(
                        this.state.filtered,
                        getSorting(this.state.order, this.state.orderBy)
                      )
                        .slice(
                          this.state.page * this.state.rowsPerPage,
                          this.state.page * this.state.rowsPerPage +
                          this.state.rowsPerPage
                        )
                        .map((row, m) => {
                          return (
                            <TableRow key={m} className={classes.tableRow}>
                              {
                                this.state.header.map((h, i) => {
                                  if (h.default) {
                                    return (
                                      <TableCell align='center' key={i}>
                                        {typeof row[h.key] !== 'object' | row[h.key] === null
                                          ? row[h.key]
                                          : typeof row[h.key][0] === 'object' & row[h.key][0] !== null
                                            ? row[h.key].map((chip, j) => {
                                              if (chip !== null) {
                                                return (
                                                  <Chip
                                                    key={j}
                                                    size='small'
                                                    variant="outlined"
                                                    label={chip.display}
                                                    className={classes.chip}
                                                    component={Link}
                                                    to={chip.end_href ? (h.base_href + '/' + chip.end_href).replace(/\/\//g, '/') : (h.base_href + '/' + chip.display).replace(/\/\//g, '/')}
                                                    clickable
                                                    aria-owns={open ? 'mouse-over-popover' : undefined}
                                                    aria-haspopup="true"
                                                    onMouseEnter={(event) => this.handlePopoverOpen(chip.display,
                                                      chip.end_href ? (h.base_href + '/' + chip.end_href).replace(/\/\//g, '/') : (h.base_href + '/' + chip.display).replace(/\/\//g, '/')
                                                      , event)}
                                                    onMouseLeave={this.handlePopoverClose}
                                                  />
                                                )
                                              } else {
                                                return null
                                              }
                                            }) :
                                            <div>
                                              {row[h.key].join(',')}
                                            </div>
                                        }
                                      </TableCell>
                                    );
                                  } else {
                                    return null;
                                  }
                                })}
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </div>
            </Grid>
            <Grid container
              direction="row"
              justify="flex-end"
              alignItems="center">
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 75, 100]}
                className={classes.pagination}
                count={this.state.filtered.length}
                rowsPerPage={this.state.rowsPerPage}
                page={this.state.page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </Grid>
          </Grid>
        </div>
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
      </React.Fragment >
    );
  }
}

Variant.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3)
  },
  paper: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  tableWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '80vh'
  },
  table: {
    Width: '100%',
    maxHeight: '80vh'
  },
  head: {
    backgroundColor: 'black',
    color: 'white'
  },
  headcell: {
    color: 'white',
    fontSize: '1.1em'
  },
  tableRow: {
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
      backgroundColor: '#f5f5f5'
    }
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
    }
  },
  pagination: {
    // float: 'right',
    border: '0px'
  },
  button: {
    margin: theme.spacing(1),
    borderColor: '#2E84CF',
    color: '#2E84CF'
  },
  button2: {
    margin: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
  tooltip: {
    fontSize: '3em'
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
  namegrid: {
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray'
  },
  datagrid: {
    borderBottom: '1px solid gray'
  }
});

const StyledTooltip = withStyles({
  tooltip: {
    fontSize: '1em'
  }
})(Tooltip);

export default compose(connect(null, { setSnack }), withStyles(styles))(Variant);