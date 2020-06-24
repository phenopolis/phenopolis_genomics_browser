import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import { TableCell, ButtonGroup, Button, Chip } from '@material-ui/core';
import { AutoSizer, Column, Table, CellMeasurer, CellMeasurerCache } from 'react-virtualized';

import { Link } from 'react-router-dom';

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 25,
  defaultHeight: 65, //currently, this is the height the cell sizes to after calling 'toggleHeight'
});

class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 55,
    rowHeight: 55,
  };

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  // handleClick = (item) => {
  //   this.props.onClick(item)
  // }

  actionRenderer = (model, userid) => {
    return (
      <div>
        <ButtonGroup size="small" aria-label="text primary button group">
          <Button color="primary" component={Link} to={'/' + model + '/' + userid}>
            {' '}
            View{' '}
          </Button>
          {/* <Button color="primary" component={Link} to={"/users/" + userid}> Edit </Button> */}
          <Button color="secondary" onClick={() => this.props.onClick(userid, 'delete')}>
            Delete
          </Button>
        </ButtonGroup>
      </div>
    );
  };

  cellRenderer = ({ cellData, columnIndex, rowData, model }) => {
    const { columns, classes, rowHeight, onRowClick, dataKey, rowIndex, parent } = this.props;
    return (
      <CellMeasurer cache={cache} columnIndex={0} key={dataKey} parent={parent} rowIndex={rowIndex}>
        {({ measure, registerChild }) => (
          // 'style' attribute required to position cell (within parent List)
          <TableCell ref={registerChild} style={{ height: cache.getHeight(rowIndex) }}>
            {typeof cellData === 'object'
              ? cellData.map((chip, j) => {
                  if (chip !== null) {
                    return (
                      <Chip
                        key={j}
                        size="small"
                        variant="outlined"
                        label={chip.display}
                        // className={classes.chip}
                      />
                    );
                  } else {
                    return null;
                  }
                })
              : cellData}
          </TableCell>
        )}
        {/* <Cell
        height={this.getRowHeight(rowIndex)}
      onClick={() => this.toggleHeight(rowIndex)}
      >
        {rowIndex}
      </Cell> */}
      </CellMeasurer>
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        // component="div"
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick,
          classes.tableHeader
        )}
        // variant="head"
        style={{ height: headerHeight }}
        align="center">
        <span>{label}</span>
      </TableCell>
    );
  };

  render() {
    const { classes, columns, rowHeight, headerHeight, ...tableProps } = this.props;
    const model = this.props.model;

    const { width } = this.props;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={8000}
            rowHeight={60}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}>
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={(cellProps) =>
                    this.cellRenderer({
                      ...cellProps,
                      model: model,
                    })
                  }
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      width: PropTypes.number.isRequired,
    })
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  tableHeader: {
    backgroundColor: 'black',
    color: 'white',
    fontWeight: '900',
  },
  table: {
    'flex-basis': 'auto !important',
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0px !important' : undefined,
    },
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    cursor: 'initial',
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
    },
  },
});

export default withStyles(styles)(MuiVirtualizedTable);
