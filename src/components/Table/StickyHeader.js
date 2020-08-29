import React from 'react';
import { TableSortLabel, Tooltip } from '@material-ui/core';

const StickyHeader = (props) => {
  const createSortHandler = (key) => (event) => {
    props.onRequestSort(event, key);
  };

  return (
    <div className={'stickyGridHeader'}>
      <div className={'sticky-grid__header__scrollable'}>
        {props.headerColumns.map(({ label, des, key, ...style }, i) => {
          return (
            <Tooltip key={i} title={des} placement="top">
              <div className={'stickyGridHeaderScrollableColumn'} style={style}>
                <TableSortLabel
                  className={'styledTableSortLabel'}
                  active={props.orderBy === key}
                  direction={props.order}
                  onClick={createSortHandler(key)}>
                  {label}
                  {props.orderBy === key ? (
                    <span className={'visuallyHidden'}>
                      {props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </span>
                  ) : null}
                </TableSortLabel>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default StickyHeader;
