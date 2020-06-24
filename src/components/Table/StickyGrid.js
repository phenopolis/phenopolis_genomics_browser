import React from 'react';
import ReactDOM from 'react-dom';
import { VariableSizeGrid as Grid } from 'react-window';

import './styles.css';

const createItemData = memoize((rows, columns, toggleItemActive, currentRow, currentColumn) => ({
  rows,
  columns,
  toggleItemActive,
  currentRow,
  currentColumn,
}));

class StickyGrid extends React.Component {
  state = {
    rowSizes: new Array(1000).fill(true).reduce((acc, item, i) => {
      acc[i] = 50;
      return acc;
    }, {}),
  };

  listRef = React.createRef();

  render() {
    const {
      stickyHeight,
      stickyWidth,
      columnWidth,
      rowHeight,
      myrows,
      mycolumns,
      children,
      toggleItemActive,
      currentRow,
      currentColumn,
      ...rest
    } = this.props;
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
          myrows,
        }}>
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

  // toggleSize = i => {
  //   if (this.listRef.current) {
  //     this.listRef.current.resetAfterIndex(i);
  //   }
  //   this.setState(prevState => ({
  //     rowSizes: {
  //       ...prevState.rowSizes,
  //       [i]: prevState.rowSizes[i] === 50 ? 75 : 50
  //     }
  //   }));
  // };

  // getSize = i => {
  //   return this.state.rowSizes[i];
  // };
}

export default StickyGrid;
