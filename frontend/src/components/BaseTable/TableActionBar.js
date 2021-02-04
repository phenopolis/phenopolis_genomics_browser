import React, { Fragment, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Card, Collapse } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import {
  faFilter,
  faEyeSlash,
  faChartBar,
  faDna,
  faFileDownload,
} from '@fortawesome/pro-duotone-svg-icons';

import RowFilter from './RowFilter';
import HideColumn from './HideColumn';
import Plots from './Plots';

const TableActionBar = (props) => {
  const classes = useStyles();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(2);

  const toolButtons = [
    { label: 'Filter Rows', icon: faFilter },
    { label: 'Show/Hide Columns', icon: faEyeSlash },
    { label: 'Plots', icon: faChartBar },
    { label: 'Genome', icon: faDna },
    { label: 'Export Excel', icon: faFileDownload },
  ];

  const handleFilterPopoverOpen = (buttonIndex) => {
    if (buttonIndex === filterPopoverOpen) {
      setFilterPopoverOpen(-1);
    } else {
      setFilterPopoverOpen(buttonIndex);
    }
  };

  const handleUpdateFilter = (newFilter) => {
    props.UpdateFilter(newFilter);
  };

  const handleHideColumn = (newColumns, action) => {
    props.UpdateHideColumn(newColumns, action);
  };

  const handleHighlighRow = () => {};

  return (
    <Fragment>
      <Paper style={{ marginBottom: '3em', fontSize: '14px' }}>
        <Card
          elevation={0}
          className="card-box mb-0 d-flex flex-row flex-wrap justify-content-center">
          {toolButtons.map((button, buttonIndex) => {
            if ((button.label === 'Genome') & (props.genomePlot === false)) {
              return null;
            } else {
              return (
                <div
                  key={buttonIndex}
                  className={clsx(classes.toolButton, 'py-4 px-5 d-flex align-items-center')}
                  onClick={() => handleFilterPopoverOpen(buttonIndex)}
                  style={buttonIndex === filterPopoverOpen ? { color: '#2E84CF' } : null}>
                  <FontAwesomeIcon icon={button.icon} className="d-30 opacity-5 mr-3" />
                  <div>
                    <span className="d-block opacity-7"> {button.label} </span>
                  </div>
                </div>
              );
            }
          })}
        </Card>

        <Collapse in={filterPopoverOpen === 0}>
          <Card
            elevation={0}
            className="card-box mb-0 d-flex flex-row flex-wrap justify-content-center">
            <RowFilter
              variableList={props.tableColumn}
              tableFilter={props.filters}
              UpdateFilter={handleUpdateFilter}
            />
          </Card>
        </Collapse>

        <Collapse in={filterPopoverOpen === 1}>
          <Card
            elevation={0}
            className="card-box mb-0 d-flex flex-row flex-wrap justify-content-center">
            <HideColumn tableColumn={props.tableColumn} onHideColumn={handleHideColumn} />
          </Card>
        </Collapse>

        <Collapse in={filterPopoverOpen === 2}>
          <Card
            elevation={0}
            className="card-box mb-0 d-flex flex-row flex-wrap justify-content-center">
            <Plots
              variableList={props.tableColumn}
              dataRows={props.dataRows}
              highlighRow={handleHighlighRow}
            />
          </Card>
        </Collapse>

        {props.genomePlot ? (
          <Collapse in={filterPopoverOpen === 3}>
            <Card
              elevation={0}
              className="card-box mb-2 mt-2 d-flex flex-row flex-wrap justify-content-center">
              {/* <GenomePlot
              data={this.state.filteredData}
              visibleRows={this.state.visibleRows}
              name={this.props.name}
            /> */}
            </Card>
          </Collapse>
        ) : null}

        <Collapse in={filterPopoverOpen === 4}>
          <Card
            elevation={0}
            className="card-box mb-5 mt-5 d-flex flex-row flex-wrap justify-content-center">
            {/* <ExportExcel onRequestDownload={this.handleDownloadCSV} /> */}
          </Card>
        </Collapse>
      </Paper>
    </Fragment>
  );
};

const useStyles = makeStyles((theme) => ({}));

export default TableActionBar;
