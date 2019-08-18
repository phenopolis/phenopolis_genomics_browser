import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import {
  CssBaseline, Paper, Typography, Box, Chip, Grid, Collapse,
  Checkbox, FormControlLabel, Tooltip, Table, TableBody, TableCell,
  TableRow, TablePagination, Button
} from '@material-ui/core';

import TableHeader from '../Table/TableHeader';
import TablePaginationActions from '../Table/TablePaginationActions';

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
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
      checkedB: false
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
    this.setState({ orderBy: property });
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
              let displays = item[filter.column].filter(chip => {
                return RegExp(filter.filter).test(chip.display);
              });
              if (displays.length > 0) {
                break;
              } else {
                judge = false;
                break;
              }
            }

          default:
            break;
        }
      });
      return judge;
    });
    // return filtered;
    this.setState({ filtered: filtered });
  };

  render() {
    const { classes } = this.props;

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
          onClick={event => this.handleCheckFilter('test', event)}>
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
          </Collapse>
        </div>

        <div className={classes.root}>
          <Grid
            container
            direction='column'
            justify='center'
            alignItems='stretch'>
            <Grid item xs={12}>
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
                                          : row[h.key].map((chip, j) => {
                                            if (chip !== null) {
                                              if (typeof chip === 'object') {
                                                return (
                                                  <Chip
                                                    key={j}
                                                    size='small'
                                                    label={chip.display}
                                                    className={classes.chip}
                                                    component={Link}
                                                    to={chip.end_href ? h.base_href + chip.end_href : h.base_href + chip.display}
                                                    clickable
                                                  />
                                                )
                                              } else {
                                                return (
                                                  chip.toString() + ', '
                                                )
                                              }
                                            } else {
                                              return null
                                            }

                                          })}
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
            <Grid item xs={12}>
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
      </React.Fragment>
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
    padding: theme.spacing(3),
    marginTop: theme.spacing(5)
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    Width: '100%'
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
    float: 'right',
    border: '0px'
  },
  button: {
    margin: theme.spacing(1),
    borderColor: '#2E84CF',
    color: '#2E84CF'
  },
  tooltip: {
    fontSize: '3em'
  }
});

const StyledTooltip = withStyles({
  tooltip: {
    fontSize: '1em'
  }
})(Tooltip);

export default withStyles(styles)(Variant);
