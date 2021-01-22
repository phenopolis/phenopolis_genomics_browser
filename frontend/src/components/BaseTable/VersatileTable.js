import React, { useEffect, useState } from 'react';
// import CssBaseline from '@material-ui/core/CssBaseline';
import BaseTable, { Column, AutoResizer } from 'react-base-table';
import 'react-base-table/styles.css';

import ChipList from './ChipList';

const VersatileTable = (props) => {
  const [tableData, setTableData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [tableColumn, setTableColumn] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // console.log(props.tableData);
    if (props.tableData) {
      // console.log(props.tableData);
      modifyData(props.tableData);
    }
  }, [props.tableData]);

  const modifyData = (tableData) => {
    // console.log(tableData);
    const tmpColumn = tableData.colNames.map((col) => {
      if (col.type == 'links') {
        return {
          key: col.key,
          title: col.name,
          dataKey: col.key,
          base_href: col.base_href,
          width: 600,
          resizable: true,
          align: Column.Alignment.CENTER,
          sortable: true,
          cellRenderer: ({ cellData, column }) => <ChipList chips={cellData} colName={column} />,
        };
      } else {
        return {
          key: col.key,
          title: col.name,
          dataKey: col.key,
          width: 200,
          resizable: true,
          align: Column.Alignment.CENTER,
          sortable: true,
        };
      }
    });

    const tmpData = tableData.data.map((row, rowIndex) => {
      return {
        ...row,
        id: rowIndex,
      };
    });

    console.log(tmpData);

    setTableColumn(tmpColumn);
    setTableData(tmpData);
    setSortBy({ key: 'CHROM', order: 'asc' });
    setReady(true);
  };

  const onColumnSort = (sortBy) => {
    // console.log(sortBy);
    // console.log(tableData);
    const order = sortBy.order === 'asc' ? 1 : -1;
    const tmpdata = [...tableData];
    tmpdata.sort((a, b) => (a[sortBy.key] > b[sortBy.key] ? order : -order));
    setTableData(tmpdata);
    setSortBy(sortBy);
  };

  const estRowHight = (rowData, rowIndex) => {
    if (rowIndex % 3 === 1) {
      return 50;
    } else {
      return 200;
    }
  };

  return (
    <div style={{ width: '100%', height: '50vh', marginTop: '2em' }}>
      {ready ? (
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable
              width={width}
              height={height}
              fixed
              rowKey="id"
              // estimatedRowHeight={({ rowData, rowIndex }) => estRowHight(rowData, rowIndex)}
              estimatedRowHeight={61}
              columns={tableColumn}
              data={tableData}
              sortBy={sortBy}
              onColumnSort={onColumnSort}
            />
          )}
        </AutoResizer>
      ) : (
        <div>
          <h2> Loading Data... </h2>
        </div>
      )}
    </div>
  );
};

export default VersatileTable;
