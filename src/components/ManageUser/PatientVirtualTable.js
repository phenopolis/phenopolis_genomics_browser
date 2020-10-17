import React, { Fragment, useState, useEffect } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';

import TypeChip from '../Chip/TypeChip';

import './PatientVirtualTable.css';

export default function PatientVirtualTable(props) {
  const listRef = React.createRef();
  const [rowHeights, setRowHeights] = React.useState([25, 25, 25]);
  const [columnWidths, setColumnWidths] = React.useState([100, 100, 100]);

  useEffect(() => {
    console.log(props.width);
    let TmpColumnWidth = props.width / 3;
    setColumnWidths([TmpColumnWidth + 0.1, TmpColumnWidth + 0.1, TmpColumnWidth + 0.1]);

    if (props.patients !== null) {
      const TmprowHeights = new Array(Math.ceil(props.patients.length / 3))
        .fill(true)
        .map(() => 40);
      console.log(TmprowHeights);
      setRowHeights(TmprowHeights);
    }

    listRef.current.resetAfterColumnIndex(0);
    listRef.current.resetAfterRowIndex(0);
  }, [props.patients]);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    useEffect(() => {
      console.log(style);
    }, []);

    return (
      <div id={rowIndex + 1 + ',' + (columnIndex + 1)} className={'GridItem'} style={style}>
        {props.patients[rowIndex * 3 - 1 + columnIndex + 1] !== undefined ? (
          <TypeChip
            size="small"
            label={props.patients[rowIndex * 3 - 1 + columnIndex + 1]}
            type={'individual'}
            emit={false}
            action="no"
            popover={true}
            // deletable={true}
            // onDeleteClick={handleFeatureDeleteChip}
            to={'/individual/PH00008258'}
          />
        ) : null}

        {/* r{rowIndex}, c{columnIndex} */}
      </div>
    );
  };

  return (
    <div style={{ position: 'absolute' }}>
      <Grid
        ref={listRef}
        columnCount={3}
        columnWidth={(index) => columnWidths[index]}
        height={300}
        rowCount={Math.ceil(props.patients.length / 3)}
        rowHeight={(index) => rowHeights[index]}
        width={500}>
        {Cell}
      </Grid>
    </div>
  );
}
