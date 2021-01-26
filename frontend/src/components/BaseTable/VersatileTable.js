import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import CssBaseline from '@material-ui/core/CssBaseline';
import BaseTable, { Column, AutoResizer } from 'react-base-table';
import 'react-base-table/styles.css';
import './tableStyle.css';

import { Toolbar, Paper, Typography, Box, Container, Card, Collapse } from '@material-ui/core';

import { CreateColumns } from './js/CreateColumns';
import TableTitle from './TableTitle';
import TableActionBar from './TableActionBar';
import { FilterRow } from './js/FilterRow';

const VersatileTable = (props) => {
  const classes = useStyles();
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [sortBy, setSortBy] = useState(null);
  const [tableColumn, setTableColumn] = useState([]);

  const [filters, setFilter] = useState([]);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (props.tableData) {
      modifyData(props.tableData);
    }
  }, [props.tableData]);

  useEffect(() => {
    if (ready) {
      let tmpFilteredData = FilterRow(filters, tableData);
      setFilteredData(tmpFilteredData);
    }
  }, [filters]);

  const modifyData = (tableData) => {
    const tmpData = tableData.data.map((row, rowIndex) => {
      return {
        ...row,
        id: rowIndex,
      };
    });

    const tmpColnames = CreateColumns(tableData.colNames, tableData.data);

    setTableColumn(tmpColnames);
    setTableData(tmpData);
    setFilteredData(tmpData);
    setSortBy({ key: 'CHROM', order: 'asc' });
    setReady(true);
  };

  const onColumnSort = (sortBy) => {
    const order = sortBy.order === 'asc' ? 1 : -1;
    const tmpdata = [...tableData];
    tmpdata.sort((a, b) => (a[sortBy.key] > b[sortBy.key] ? order : -order));
    setTableData(tmpdata);
    setSortBy(sortBy);
  };

  const handleUpdateFilter = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className={classes.root}>
      <TableTitle
        title={props.title}
        subtitle={props.subtitle}
        rowLength={filteredData.length}
        columnLength={tableColumn.length}
      />

      {ready ? (
        <TableActionBar
          tableColumn={tableColumn}
          filters={filters}
          UpdateFilter={handleUpdateFilter}
        />
      ) : null}

      <div style={{ width: '100%', height: '50vh', marginTop: '1em' }}>
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
                data={filteredData}
                sortBy={sortBy}
                onColumnSort={onColumnSort}
              />
            )}
          </AutoResizer>
        ) : (
          <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <Typography variant="h4" gutterBottom style={{ color: 'grey', fontWeight: '900' }}>
                Processing Data for Phenopolis Table...
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
