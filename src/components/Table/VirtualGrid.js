import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import calculateSize from 'calculate-size'
import memoize from 'memoize-one'
import CountUp from 'react-countup';

import GridColumn from "./GridColumn"
import StickyHeader from "./StickyHeader"
import VirtualTableFilter from "./VirtualTableFilter"

import "./styles.css";
import { Toolbar, Paper, IconButton, Typography, Box, Icon, Popover, Dialog, Button } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
var focusField;

const getRenderedCursor = children =>
  children.reduce(
    (
      [minRow, maxRow, minColumn, maxColumn],
      { props: { columnIndex, rowIndex } }
    ) => {
      if (rowIndex < minRow) {
        minRow = rowIndex;
      }

      if (rowIndex > maxRow) {
        maxRow = rowIndex;
      }

      if (columnIndex < minColumn) {
        minColumn = columnIndex;
      }

      if (columnIndex > maxColumn) {
        maxColumn = columnIndex;
      }
      return [minRow, maxRow, minColumn, maxColumn];
    },
    [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY
    ]
  );

const headerBuilder = (minColumn, maxColumn, columnWidth, stickyHeight, mycolumns) => {
  const columns = [];
  let left = [0], pos = 0;

  for (let c = 1; c <= maxColumn; c++) {
    pos += columnWidth(c - 1);
    left.push(pos);
  }

  for (let i = minColumn; i <= maxColumn; i++) {
    columns.push({
      height: stickyHeight,
      width: columnWidth(i),
      left: left[i],
      label: mycolumns[i].name
    });
  }

  return columns;
};

const columnsBuilder = (minRow, maxRow, rowHeight, stickyWidth) => {
  const rows = [];
  let top = [0],
    pos = 0;

  for (let c = 1; c <= maxRow; c++) {
    pos += rowHeight(c - 1);
    top.push(pos);
  }

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({
      height: rowHeight(i),
      width: stickyWidth,
      top: top[i],
      label: `Sticky Row ${i}`
    });
  }

  return rows;
};

const StickyColumns = ({ rows, stickyHeight, stickyWidth }) => {
  const leftSideStyle = {
    top: stickyHeight,
    width: stickyWidth,
    height: `calc(100% - ${stickyHeight}px)`
  };

  return (
    <div className={"sticky-grid__sticky-columns__container"} style={leftSideStyle}>
      {
        rows.map(({ label, ...style }, i) => {
          return (
            <div
              className={"sticky-grid__sticky-columns__row"}
              style={style}
              key={i}>
              {label}
            </div>
          )
        })
      }
    </div>
  )
};

const StickyGridContext = React.createContext();
StickyGridContext.displayName = "StickyGridContext";

const innerGridElementType = React.forwardRef(({ children, ...rest }, ref) =>
  <StickyGridContext.Consumer>
    {
      ({
        stickyHeight,
        stickyWidth,
        headerBuilder,
        columnsBuilder,
        columnWidth,
        mycolumns,
        rowHeight
      }) => {

        const [minRow, maxRow, minColumn, maxColumn] = getRenderedCursor(
          children
        ); // TODO maybe there is more elegant way to get this

        const headerColumns = headerBuilder(
          minColumn,
          maxColumn,
          columnWidth,
          stickyHeight,
          mycolumns
        );

        const leftSideRows = columnsBuilder(
          minRow,
          maxRow,
          rowHeight,
          stickyWidth
        );

        const containerStyle = {
          ...rest.style,
          width: `${parseFloat(rest.style.width) + stickyWidth}px`,
          height: `${parseFloat(rest.style.height) + stickyHeight}px`
        };

        const containerProps = {
          ...rest,
          style: containerStyle
        };

        const gridDataContainerStyle = {
          top: stickyHeight,
          left: stickyWidth
        };

        return (
          <div ref={ref} className="sticky-grid__container" {...containerProps}>
            <StickyHeader
              headerColumns={headerColumns}
              stickyHeight={stickyHeight}
              stickyWidth={stickyWidth}
            />
            {/* <StickyColumns
              rows={leftSideRows}
              stickyHeight={stickyHeight}
              stickyWidth={stickyWidth}
            /> */}
            <div className="sticky-grid__data__container" style={gridDataContainerStyle}>
              {children}
            </div>
          </div>
        )
      }
    }
  </StickyGridContext.Consumer>
);


const createItemData = memoize((rows, columns, toggleItemActive, currentRow, currentColumn) => ({
  rows,
  columns,
  toggleItemActive,
  currentRow,
  currentColumn
}));



class StickyGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.listRef = React.createRef();
  }

  listRef = React.createRef();

  componentWillReceiveProps(nextProps) {

    // window.alert("Test")
    if (nextProps.myrows !== this.props.myrows) {
      this.handleActive()
    }
  }

  handleActive = () => {
    if (this.listRef.current) {
      this.listRef.current.resetAfterRowIndex(0);
    }
  }

  render() {
    const { stickyHeight, stickyWidth, columnWidth, rowHeight, myrows, mycolumns, children, toggleItemActive, currentRow, currentColumn, ...rest } = this.props
    const itemData = createItemData(myrows, mycolumns, toggleItemActive, currentRow, currentColumn);

    return (
      <StickyGridContext.Provider
        value={{
          stickyHeight,
          stickyWidth,
          columnWidth,
          rowHeight,
          headerBuilder,
          columnsBuilder,
          mycolumns,
          myrows
        }}
      >
        <Grid
          ref={this.listRef}
          columnWidth={columnWidth}
          rowHeight={rowHeight}
          innerElementType={innerGridElementType}
          itemData={itemData}
          {...rest}>
          {children}
        </Grid>
      </StickyGridContext.Provider>
    );
  }
}

// Cause a grid cell to blur when scrolling
function handleScroll(event) {
  document.activeElement.blur();
}

// Record cell changes
function handleCellChange(props, value) {
  console.log(value + ", " + focusField);
}

// - * - * - * - * - * - * - * - * - * - * - * - * 
// - * - * - * - * - * - * - * - * - * - * - * - * 

class VirtualGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      TableColumnWidth: [120, 140, 160, 180],
      TableRowHeight: [120, 80, 100, 60],
      rowCount: 0,
      colCount: 0,
      currentRow: null,
      currentColumn: null,
      anchorEl: null,
      filterPopoverOpen: false,
      colNames: [],
      tableFilter: [],

      fullData: [],
      fullColumn: [],
      filteredData: [],
      filteredColumn: [],
      filteredColumnWidth: [],
      filteredRowHeight: []
    };
  }

  componentWillMount() {
    var tableData = JSON.parse(JSON.stringify(this.props.tableData))
    var myrows = tableData.data
    var mycolumns = tableData.colNames


    let maxColumn = 400
    let minColumn = 80

    let minHeight = 40
    let HeightIncrease = 30

    let tmpWidth = Array(mycolumns.length).fill(minColumn)
    let tmpHeight = Array(myrows.length).fill(minHeight)

    var tmpColnames = []

    for (let j = 0; j < mycolumns.length; j++) {
      let headSize = calculateSize(mycolumns[j].name, { font: 'Arial', fontSize: '14px' })
      if (headSize.width + 20 > tmpWidth[j]) tmpWidth[j] = headSize.width + 20

      tmpColnames.push({ name: mycolumns[j].name, key: mycolumns[j].key, type: typeof myrows[0][mycolumns[j].key], chips: [] })
    }
    for (let j = 0; j < mycolumns.length; j++) {
      for (let i = 0; i < myrows.length; i++) {

        var key = mycolumns[j].key
        let cellData = myrows[i][key]

        if (typeof cellData === 'object') {

          let chipsSize = 0
          var tmpMax = maxColumn

          cellData.forEach((chip) => {

            tmpColnames[j].chips.push(chip.display)

            let size = calculateSize(chip.display, { font: 'Arial', fontSize: '12px' })
            if (size.width + 60 > tmpMax) {
              tmpMax = size.width + 60
            }
            chipsSize = chipsSize + size.width + 60
          })

          let cellHeight = minHeight + (Math.round(chipsSize / tmpMax) * HeightIncrease)
          let cellWidth = chipsSize / tmpMax > 1 ? tmpMax : chipsSize

          if (cellWidth > tmpWidth[j]) tmpWidth[j] = cellWidth
          if (cellHeight > tmpHeight[i]) tmpHeight[i] = cellHeight

        } else {
          let cellSize = calculateSize(cellData, { font: 'Arial', fontSize: '14px' })

          let cellWidth = cellSize.width + 20
          if (cellWidth > tmpWidth[j]) tmpWidth[j] = cellWidth
        }
      }
      tmpColnames[j].chips = [...new Set(tmpColnames[j].chips)]
    }

    this.setState({
      TableColumnWidth: tmpWidth,
      TableRowHeight: tmpHeight,
      rowCount: myrows.length,
      colCount: mycolumns.length,
      colNames: tmpColnames,

      fullData: myrows,
      fullColumn: mycolumns,
      filteredData: myrows,
      filteredColumn: mycolumns,

      filteredColumnWidth: tmpWidth,
      filteredRowHeight: tmpHeight
    })
    // myrows
  }

  getRowHeight = (index) => {
    // return index % 2 ? 60 : 30;
    return this.state.filteredRowHeight[index]
  }

  getColumnWidth = (index) => {
    // return index % 2 ? 240 : 120;
    return this.state.filteredColumnWidth[index]
  }

  toggleItemActive = (rowIndex, columnIndex) => {
    this.setState({ currentRow: rowIndex, currentColumn: columnIndex })
  }

  handleFilterPopoverOpen = (event) => {
    this.state.ancherEl ? this.setState({ anchorEl: null, filterPopoverOpen: false }) : this.setState({ anchorEl: event.currentTarget, filterPopoverOpen: true });
  }

  handleFilterPopoverClose = () => {
    this.setState({ anchorEl: null, filterPopoverOpen: false })
  }

  handleUpdateFilter = (newFilter) => {
    this.setState({ tableFilter: newFilter }, () => {
      this.columnFilter(this.state.fullData, this.state.tableFilter);
    })
  }

  columnFilter = (data, filters) => {
    console.log(filters)

    var tmpNewRowHeight = []

    var filtered = data.filter((item, rowIndex) => {
      // var judge = true;
      var tmpJudge = new Array(filters.length).fill(true);

      Array.prototype.forEach.call(filters, (filter, index) => {

        switch (filter.operation) {
          case '>':
            if (Number(item[filter.column.key]) > Number(filter.value)) {
            } else {
              // judge = false; 
              tmpJudge[index] = false
            }
            break;
          case '≥':
            if (Number(item[filter.column.key]) >= Number(filter.value)) {
            } else {
              // judge = false;
              tmpJudge[index] = false
            }
            break;
          case '<':
            if (Number(item[filter.column.key]) < Number(filter.value)) {
            } else {
              // judge = false;
              tmpJudge[index] = false
            }
            break;
          case '≤':
            if (Number(item[filter.column.key]) <= Number(filter.value)) {
            } else {
              // judge = false;
              tmpJudge[index] = false
            }
            break
          case '=':
            if (typeof item[filter.column.key] !== 'object') {
              if (RegExp(filter.value).test(item[filter.column.key])) {
              } else {
                // judge = false;
                tmpJudge[index] = false
              }
            } else {
              if (typeof item[filter.column.key][0] === 'object' & item[filter.column.key][0] !== null) {
                let displays = item[filter.column.key].filter(chip => {
                  return RegExp(filter.value).test(chip.display);
                });
                if (displays.length > 0) {
                } else {
                  // judge = false;
                  tmpJudge[index] = false
                }
              } else {
                if (RegExp(filter.value).test(item[filter.column.key].join(','))) {
                } else {
                  // judge = false;
                  tmpJudge[index] = false
                }
              }
            }
            break;
          case '==':
            if (JSON.stringify(item[filter.column.key]) === JSON.stringify(filter.value)) {
            } else {
              // judge = false;
              tmpJudge[index] = false
            }
            break;

          case '⊂':
            if (typeof item[filter.column.key] !== 'object') {
              break
            } else {
              if (typeof item[filter.column.key][0] === 'object' & item[filter.column.key][0] !== null) {
                let displays = item[filter.column.key].filter(chip => {
                  return filter.value.includes(chip.display)
                });

                if (displays.length > 0) {
                } else {
                  tmpJudge[index] = false
                }
              } else {
                tmpJudge[index] = false
              }
            }
            break;

          case '⊄':
            if (typeof item[filter.column.key] !== 'object') {
              break
            } else {
              if (typeof item[filter.column.key][0] === 'object' & item[filter.column.key][0] !== null) {
                let displays = item[filter.column.key].filter(chip => {
                  return filter.value.includes(chip.display)
                });
                if (displays.length > 0) {
                  tmpJudge[index] = false
                } else {

                }
              } else {
              }
            }
            break;
          default:
            break;
        }
      });



      if (filters.length === 0) {
        var judge = true
      } else {
        var stringForEval = ''
        for (let i = 0; i < filters.length; i++) {

          stringForEval = stringForEval + tmpJudge[i]

          if (i !== (filters.length - 1)) {
            if (filters[i].andor === 'and') {
              stringForEval = stringForEval + ' & '
            } else {
              stringForEval = stringForEval + ' | '
            }
          }
        }
        var judge = eval(stringForEval)
      }



      if (judge) {
        tmpNewRowHeight.push(this.state.TableRowHeight[rowIndex])
      }
      return judge;
    });
    // return filtered;

    this.setState({ filteredData: filtered, filteredRowHeight: tmpNewRowHeight });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography component='div'>
          <Box fontWeight='fontWeightBold' fontSize='h4.fontSize' mb={0}>
            {this.props.title}
          </Box>
          <Box fontWeight='fontWeightLight' mb={2}>
            {this.props.subtitle}
          </Box>
        </Typography>
        <Toolbar className={classes.toolbar}>

          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={(event) => this.handleFilterPopoverOpen(event)}
          >
            <Icon className={clsx(classes.iconHover, 'fas fa-filter')} />
          </IconButton>

          <Popover
            id={'FilterPopover'}
            open={this.state.filterPopoverOpen}
            anchorEl={this.state.anchorEl}
            onClose={this.handleFilterPopoverClose}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {/* <Dialog onClose={this.handleFilterPopoverClose} aria-labelledby="simple-dialog-title" open={this.state.filterPopoverOpen}> */}
            <VirtualTableFilter variableList={this.state.colNames} tableFilter={this.state.tableFilter} UpdateFilter={this.handleUpdateFilter} onClickClose={this.handleFilterPopoverClose} />
            {/* </Dialog> */}
          </Popover>

          <div style={{ position: 'absolute', right: '1em' }}>
            <b style={{ fontSize: '1.3em', color: '#2196f3' }}><CountUp end={this.state.filteredData.length} /></b> records selected
            {/* <b style={{ fontSize: '25', color: '#f44336' }}> { this.state.filteredData.length } </b> records selected */}
          </div>

        </Toolbar>
        <Paper elevation={5} className={classes.paper}>
          <div className={classes.tableframe}>
            <AutoSizer>
              {({ height, width }) => (
                <StickyGrid
                  height={height}
                  width={width}
                  columnCount={this.state.colCount}
                  rowCount={this.state.filteredData.length}
                  rowHeight={this.getRowHeight}
                  columnWidth={this.getColumnWidth}
                  stickyHeight={50}
                  stickyWidth={0}
                  onScroll={handleScroll}
                  myrows={this.state.filteredData}
                  mycolumns={this.state.filteredColumn}
                  toggleItemActive={this.toggleItemActive}
                  currentRow={this.state.currentRow}
                  currentColumn={this.state.currentColumn}
                >
                  {GridColumn}
                </StickyGrid>
              )}
            </AutoSizer>
          </div>
        </Paper>
        <Toolbar className={classes.toolbar}>
          <div style={{ position: 'absolute', left: '1em' }}>
            <b style={{ fontSize: '1.3em', color: '#2196f3' }}><CountUp end={this.state.filteredData.length} /></b> records selected
            {/* <b style={{ fontSize: '25', color: '#f44336' }}> { this.state.filteredData.length } </b> records selected */}
          </div>
        </Toolbar>
      </div>
    );
  }
}

VirtualGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    marginTop: theme.spacing(5),
  },
  tableframe: {
    margin: '10',
    height: '70vh',
    width: '100%',
    overflow: 'hidden',
    'scroll-behavior': 'smooth'
  },
  toolbar: {
    backgroundColor: '#eeeee',
    opacity: 1,
    flexGrow: 1,
    // border: '1px solid red'
  },
  paper: {
    overflowX: 'auto',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    fontSize: 15,
    '&:hover': {
      cursor: 'pointer',
      color: '#2E84CF'
    }
  },
  iconHover: {
    fontSize: 15,
    margin: theme.spacing(0),
  }
});


export default withStyles(styles)(VirtualGrid)