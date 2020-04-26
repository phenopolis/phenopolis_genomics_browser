import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import calculateSize from 'calculate-size'

import GridColumn from "./GridColumn"

import "./styles.css";

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

const headerBuilder = (minColumn, maxColumn, columnWidth, stickyHeight) => {
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
      label: `Sticky Col ${i}`
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

const StickyHeader = ({ stickyHeight, stickyWidth, headerColumns }) => {
  const baseStyle = {
    height: stickyHeight,
    width: stickyWidth
  };
  const scrollableStyle = {
    left: stickyWidth
  };

  return (
    <div className={"sticky-grid__header"}>
      <div className={"sticky-grid__header__base"} style={baseStyle}>
        Sticky Base
      </div>
      <div className={"sticky-grid__header__scrollable"} style={scrollableStyle}>
        {
          headerColumns.map(({ label, ...style }, i) => {
            return (
              <div
                className={"sticky-grid__header__scrollable__column"}
                style={style}
                key={i}>
                {label}
              </div>
            )
          })
        }
      </div>
    </div>
  )
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
        rowHeight,
        myrows
      }) => {

        const [minRow, maxRow, minColumn, maxColumn] = getRenderedCursor(
          children
        ); // TODO maybe there is more elegant way to get this

        const headerColumns = headerBuilder(
          minColumn,
          maxColumn,
          columnWidth,
          stickyHeight
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
            <StickyColumns
              rows={leftSideRows}
              stickyHeight={stickyHeight}
              stickyWidth={stickyWidth}
            />
            <div className="sticky-grid__data__container" style={gridDataContainerStyle}>
              {children}
            </div>
          </div>
        )
      }
    }
  </StickyGridContext.Consumer>
);

const StickyGrid = ({
  stickyHeight,
  stickyWidth,
  columnWidth,
  rowHeight,
  myrows,
  test,
  children,
  ...rest
}) => {

  console.log(children)

  return (
    React.createElement(
      StickyGridContext.Provider,
      {
        value: {
          stickyHeight,
          stickyWidth,
          columnWidth,
          rowHeight,
          headerBuilder,
          columnsBuilder,
          test,
          myrows
        }
      },
      React.createElement(
        Grid,
        {
          columnWidth: columnWidth,
          rowHeight: rowHeight,
          innerElementType: innerGridElementType,
          itemData: myrows,
          ...rest
        },
        children
      )
    )
  )
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
    };
  }

  componentWillMount() {
    var myrows = this.props.myrows
    var mycolumns = this.props.mycolumns

    let maxColumn = 400
    let minColumn = 100

    let minHeight = 40
    let HeightIncrease = 30

    let tmpWidth = Array(mycolumns.length).fill(minColumn)
    let tmpHeight = Array(myrows.length).fill(minHeight)

    var keys = Object.keys(myrows[0]);

    for (let i = 0; i < myrows.length; i++) {
      for (let j = 0; j < mycolumns.length; j++) {
        var key = keys[j]
        var cellData = myrows[i][key]
        if (typeof cellData === 'object') {

          let chipsSize = 0

          cellData.forEach((chip) => {
            let size = calculateSize(chip.display, { font: 'Arial', fontSize: '12px' })
            chipsSize = chipsSize + size.width + 15
          })

          let cellHeight = minHeight + (Math.round(chipsSize / maxColumn) * HeightIncrease)
          let cellWidth = chipsSize % maxColumn

          if (cellWidth > tmpWidth[j]) tmpWidth[j] = cellWidth
          if (cellHeight > tmpHeight[i]) tmpHeight[i] = cellHeight

        } else {
          let cellSize = calculateSize(cellData, { font: 'Arial', fontSize: '14px' })

          let cellWidth = cellSize.width + 15

          if (cellWidth > tmpWidth[j]) tmpWidth[j] = cellWidth

        }
      }
    }

    this.setState({
      TableColumnWidth: tmpWidth,
      TableRowHeight: tmpHeight,
      rowCount: myrows.length,
      colCount: mycolumns.length
    })
    // myrows
  }

  getRowHeight = (index) => {
    // return index % 2 ? 60 : 30;
    return this.state.TableRowHeight[index]
  }

  getColumnWidth = (index) => {
    // return index % 2 ? 240 : 120;
    return this.state.TableColumnWidth[index]
  }

  render() {
    const { classes, myrows, mycolumn } = this.props;

    return (
      <div className={classes.root}>
        <AutoSizer>
          {({ height, width }) => (
            <StickyGrid
              height={height}
              width={width}
              columnCount={this.state.colCount}
              rowCount={this.state.rowCount}
              rowHeight={this.getRowHeight}
              columnWidth={this.getColumnWidth}
              stickyHeight={50}
              stickyWidth={150}
              onScroll={handleScroll}
              myrows={myrows}
              test={"my_context_test"}
            >
              {GridColumn}
            </StickyGrid>
          )}
        </AutoSizer>
      </div>
    );
  }
}

VirtualGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    margin: '10',
    height: '60vh',
    width: '100%',
    overflow: 'hidden',
    'scroll-behavior': 'smooth'
  }
});


export default withStyles(styles)(VirtualGrid)