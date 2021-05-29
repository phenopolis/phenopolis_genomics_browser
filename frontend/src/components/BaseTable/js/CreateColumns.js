import React from 'react';
import { Column } from 'react-base-table';
import calculateSize from 'calculate-size';

import ChipList from '../ChipList';
import HeaderCell from '../HeaderCell';
import ActionColumn from '../ActionColumn';

export const CreateColumns = (mycolumns, myrows, onActionFunction) => {
  let minColumn = 60;
  let maxColumn = 400;
  let tmpColnames = [];

  let minHeight = 40;
  let HeightIncrease = 30;
  let tmpHeight = Array(myrows.length).fill(minHeight);

  // let tmpWidth = Array(mycolumns.length).fill(minColumn);

  for (let j = 0; j < mycolumns.length; j++) {
    let tmpWidth = minColumn;
    let tmpType = '';
    let tmpName = mycolumns[j].name;
    let tmpKey = mycolumns[j].key;

    if (tmpKey === 'an') tmpKey = 'AN';

    let tmpChip = [];
    let tmpShow = (mycolumns[j].default === 'true') | (mycolumns[j].default === true);
    let tmpDes = mycolumns[j].description;

    let headSize = calculateSize(mycolumns[j].name, { font: 'Arial', fontSize: '14px' });
    if (headSize.width + 50 > tmpWidth) tmpWidth = headSize.width + 50;
    if (mycolumns[j].key === 'action') tmpWidth = 180;

    for (let i = 0; i < myrows.length; i++) {
      let cellData = myrows[i][tmpKey];

      if ((typeof cellData === 'object') & (cellData !== null)) {
        let chipsTotalSize = 0;
        let tmpMax = maxColumn;

        cellData.forEach((chip) => {
          let ChipSize = 0;
          if ((typeof chip === 'object') & (chip !== null)) {
            tmpChip.push(chip.display);
            ChipSize = calculateSize(chip.display, { font: 'Arial', fontSize: '15px' });
          } else {
            tmpChip.push(chip);
            ChipSize = calculateSize(chip, { font: 'Arial', fontSize: '15px' });
          }
          if (ChipSize.width + 70 > tmpMax) {
            tmpMax = ChipSize.width + 70;
          }
          chipsTotalSize = chipsTotalSize + ChipSize.width + 70;
        });

        let cellHeight = minHeight + Math.round(chipsTotalSize / tmpMax) * HeightIncrease;
        let cellWidth = chipsTotalSize / tmpMax > 1 ? tmpMax : chipsTotalSize;

        if (cellWidth > tmpWidth) tmpWidth = cellWidth;
        if (cellHeight > tmpHeight[i]) tmpHeight[i] = cellHeight;
      } else {
        let cellSize = calculateSize(cellData, { font: 'Arial', fontSize: '14px' });

        let cellWidth = cellSize.width + 20;
        if (cellWidth > tmpWidth) tmpWidth = cellWidth;
      }
    }

    // A patch for some certain column, should find a way to change this in the future...
    if (
      [
        'AC',
        'AF',
        'AN',
        'an',
        'DP',
        'POS',
        'HET_COUNT',
        'af_converge',
        'af_gnomad_genomes',
        'af_hgvd',
        'af_jirdc',
        'af_kaviar',
        'af_krgdb',
        'af_tommo',
        'cadd_phred',
        'dann',
      ].includes(mycolumns[j].key)
    ) {
      tmpType = 'number';
    } else if (['genes'].includes(mycolumns[j].key)) {
      tmpType = 'object';
    } else if (myrows.length > 0) {
      tmpType = typeof myrows[0][mycolumns[j].key];
    } else {
      tmpType = 'none';
    }

    if (tmpKey === 'action') {
      tmpColnames.push({
        name: tmpName,
        title: tmpName,
        key: tmpKey,
        dataKey: tmpKey,
        width: tmpWidth,
        resizable: true,
        align: Column.Alignment.CENTER,
        cellRenderer: ({ column, rowIndex }) => (
          <ActionColumn
            PatientID={myrows[rowIndex].internal_id[0].display}
            rowIndex={rowIndex}
            colName={column}
            onActionFunction={onActionFunction}
          />
        ),
        frozen: Column.FrozenDirection.LEFT,
        sortable: false,
        type: tmpType,
        chips: tmpChip,
        show: tmpShow,
        des: tmpDes,
        columnType: 'action',
      });
      continue;
    }

    if (mycolumns[j].type === 'links') {
      tmpColnames.push({
        name: tmpName,
        title: tmpName,
        key: tmpKey,
        dataKey: tmpKey,
        base_href: mycolumns[j].base_href,
        width: tmpWidth,
        resizable: true,
        align: Column.Alignment.CENTER,
        sortable: true,
        cellRenderer: ({ cellData, column }) => (
          <ChipList chips={cellData} colName={column} compact={false} />
        ),
        headerRenderer: ({ column }) => <HeaderCell colName={column} />,
        type: tmpType,
        chips: tmpChip,
        show: tmpShow,
        des: tmpDes,
        columnType: 'links',
      });
    } else {
      tmpColnames.push({
        name: tmpName,
        title: tmpName,
        key: tmpKey,
        dataKey: tmpKey,
        width: tmpWidth,
        resizable: true,
        align: Column.Alignment.CENTER,
        sortable: true,
        headerRenderer: ({ column }) => <HeaderCell colName={column} />,
        type: tmpType,
        chips: tmpChip,
        show: tmpShow,
        des: tmpDes,
        columnType: 'text',
      });
    }
  }

  return tmpColnames;
};
