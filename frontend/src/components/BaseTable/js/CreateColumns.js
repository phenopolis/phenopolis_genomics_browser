import React from 'react';
import BaseTable, { Column, AutoResizer } from 'react-base-table';
import calculateSize from 'calculate-size';
import ChipList from '../ChipList';

export const CreateColumns = (mycolumns, myrows) => {
  console.log(mycolumns);

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
    let tmpChip = [];
    let tmpShow = (mycolumns[j].default === 'true') | (mycolumns[j].default === true);
    let tmpDes = mycolumns[j].description;

    let headSize = calculateSize(mycolumns[j].name, { font: 'Arial', fontSize: '14px' });
    if (headSize.width + 50 > tmpWidth) tmpWidth = headSize.width + 50;
    if (mycolumns[j].key === 'action') tmpWidth = 180;
    // Add a quick patch here to assign variable's type and class.

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
        cellRenderer: ({ cellData, column }) => <ChipList chips={cellData} colName={column} />,
        type: 'object',
        chips: tmpChip,
        show: tmpShow,
        des: tmpDes,
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
        type: typeof myrows[0][mycolumns[j].key],
        chips: tmpChip,
        show: tmpShow,
        des: tmpDes,
      });
    }
  }

  // let variantIDIndex = tmpColnames.findIndex((column) => column.dataKey === 'variant_id');
  // if (variantIDIndex >= 0) {
  //   tmpColnames[variantIDIndex].frozen = Column.FrozenDirection.LEFT;
  // }

  // variantIDIndex = tmpColnames.findIndex((column) => column.dataKey === 'CHROM');
  // if (variantIDIndex >= 0) {
  //   tmpColnames[variantIDIndex].frozen = Column.FrozenDirection.LEFT;
  // }

  return tmpColnames;
};
