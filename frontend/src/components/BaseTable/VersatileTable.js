import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import CssBaseline from '@material-ui/core/CssBaseline';
import BaseTable, { Column, AutoResizer } from 'react-base-table';
import 'react-base-table/styles.css';
import './tableStyle.css';

import csvDownload from 'json-to-csv-export';

import { Toolbar, Paper, Typography, Box, Container, Card, Collapse } from '@material-ui/core';

import { CreateColumns } from './js/CreateColumns';
import TableTitle from './TableTitle';
import TableActionBar from './TableActionBar';
import { FilterRow } from './js/FilterRow';

const VersatileTable = (props) => {
  const classes = useStyles();
  const Table = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [sortBy, setSortBy] = useState(null);
  const [tableColumn, setTableColumn] = useState([]);
  const [compactColumns, setCompactColumns] = useState([]);

  const [filters, setFilter] = useState([]);
  const [visibleRows, setVisiableRows] = useState([0, 10]);

  const [DataReady, setDataReady] = useState(false);
  const [StopMessage, setStopMessage] = useState('');

  useEffect(() => {
    if (props.tableData) {
      modifyData(props.tableData);
    }
  }, [props.tableData]);

  useEffect(() => {
    if (DataReady) {
      let tmpFilteredData = FilterRow(filters, tableData);
      setFilteredData(tmpFilteredData);
    }
  }, [filters]);

  useEffect(() => {
    if (tableColumn.every((x) => x.show === 0)) {
      setStopMessage('Seems there is no column to show, check Show/Hide Column Setting above.');
    } else {
      setStopMessage('');
    }
  }, [tableColumn]);

  const modifyData = (tableData) => {
    let tmpData = tableData.data.map((row, rowIndex) => {
      return {
        ...row,
        id: rowIndex,
      };
    });

    let tmpColnames = CreateColumns(tableData.colNames, tableData.data, props.onActionClick);

    setTableColumn(tmpColnames);

    setTableData(tmpData);
    setFilteredData(tmpData);
    setSortBy({ key: 'CHROM', order: 'asc' });
    setDataReady(true);
  };

  const onColumnSort = (sortBy) => {
    const order = sortBy.order === 'asc' ? 1 : -1;
    const tmpdata = [...filteredData];
    if (sortBy.column.type === 'number') {
      tmpdata.sort((a, b) => (Number(a[sortBy.key]) > Number(b[sortBy.key]) ? order : -order));
    } else {
      tmpdata.sort((a, b) => (a[sortBy.key] > b[sortBy.key] ? order : -order));
    }

    setFilteredData(tmpdata);
    setSortBy(sortBy);
  };

  const handleRecalcualteWidth = (TotalWidth) => {
    let sumWidth = tableColumn.reduce((a, b) => +a + +b.width, 0);

    if (TotalWidth > sumWidth) {
      var newTableColumn = [...tableColumn];

      newTableColumn.forEach((item, index) => {
        newTableColumn[index].width =
          item.width + (item.width / sumWidth) * (TotalWidth - sumWidth);
      });

      setTableColumn(newTableColumn);
    }
  };

  const onScroll = () => {
    if (Table.current) {
      let minIndex = Table.current.table.innerRef.firstChild.attributes.getNamedItem('myassignedid')
        .value;
      let maxIndex = Table.current.table.innerRef.lastChild.attributes.getNamedItem('myassignedid')
        .value;
      setVisiableRows([minIndex, maxIndex]);
    }
  };

  const rowProps = (param) => {
    return { myassignedid: param.rowIndex };
  };

  const handleUpdateFilter = (newFilter) => {
    setFilter(newFilter);
  };

  const handleUpdateHideColumn = (newColumns, action) => {
    if (action === 'rerender') {
      setStopMessage('Freezing Column...');
      setTimeout(function () {
        setTableColumn(newColumns);
      }, 1);
    } else {
      setTableColumn(newColumns);
    }
  };

  const handleScrollToRow = (dataIndex) => {
    Table.current.scrollToRow(dataIndex, 'start');
  };

  const handleExcelDownload = () => {
    var prepareDownload = filteredData.map((row) => {
      var tmpRow = {};
      tableColumn.forEach((i) => {
        if (i.type !== 'object') {
          tmpRow[i.key] = row[i.key];
        } else if ((typeof row[i.key][0] === 'object') & (row[i.key][0] !== null)) {
          tmpRow[i.key] = row[i.key].map((chip) => chip.display).join(';');
        } else {
          let tmpValue = row[i.key];
          if (Array.isArray(tmpValue)) {
            tmpRow[i.key] = row[i.key].join(';');
          } else {
            tmpRow[i.key] = tmpValue;
          }
        }
      });
      return tmpRow;
    });

    var d = new Date();
    let filename = `phenopolis_${d.getDate()}_${d.getMonth()}_${d.getFullYear()}.csv`;

    csvDownload(prepareDownload, filename);
  };

  return (
    <div className={classes.root}>
      <TableTitle
        title={props.title}
        subtitle={props.subtitle}
        rowLength={filteredData.length}
        columnLength={tableColumn.length}
      />

      {DataReady ? (
        <TableActionBar
          tableColumn={tableColumn}
          filters={filters}
          dataRows={filteredData}
          UpdateFilter={handleUpdateFilter}
          UpdateHideColumn={handleUpdateHideColumn}
          ScrollToRow={handleScrollToRow}
          visibleRows={visibleRows}
          genomePlot={props.genomePlot}
          onRequestDownload={handleExcelDownload}
        />
      ) : null}

      <div style={{ width: '100%', height: '60vh', marginTop: '1em' }}>
        {DataReady & (StopMessage === '') ? (
          <AutoResizer>
            {({ width, height }) => {
              handleRecalcualteWidth(width);
              return (
                <BaseTable
                  ref={Table}
                  width={width}
                  height={height}
                  fixed
                  rowKey="id"
                  // estimatedRowHeight={({ rowData, rowIndex }) => estRowHight(rowData, rowIndex)}
                  estimatedRowHeight={61}
                  columns={tableColumn.filter((x) => x.show === 1)}
                  data={filteredData}
                  sortBy={sortBy}
                  onColumnSort={onColumnSort}
                  onScroll={onScroll}
                  rowProps={rowProps}
                  emptyRenderer={
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="50vh">
                      <Typography
                        variant="h5"
                        gutterBottom
                        style={{ color: 'grey', fontWeight: '900' }}>
                        Sorry, not even one record exist or passed your filter criteria...
                      </Typography>
                    </Box>
                  }
                />
              );
            }}
          </AutoResizer>
        ) : (
          <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <Typography variant="h4" gutterBottom style={{ color: 'grey', fontWeight: '900' }}>
                {StopMessage === '' ? (
                  <>Processing Data for Phenopolis Table...</>
                ) : (
                  <>{StopMessage}</>
                )}
              </Typography>
            </Box>
          </Container>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(5),
  },
  paper: {
    overflowX: 'auto',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    '&:hover': {
      cursor: 'pointer',
      color: '#2E84CF',
    },
  },
  iconHover: {
    fontSize: '1.8em',
    margin: theme.spacing(0),
  },
  toolButton: {
    '&:hover': {
      cursor: 'pointer',
      color: '#2E84CF',
    },
  },
  collapsePaper: {},
}));

export default VersatileTable;
