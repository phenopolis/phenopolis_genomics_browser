import React from 'react';
import { Tooltip } from '@material-ui/core';

const HeaderCell = (props) => {
  return (
    <>
      <Tooltip
        disableHoverListener={props.colName.des === ''}
        title={<span style={{ fontSize: '13px' }}>{props.colName.des}</span>}
        placement="top">
        <span> {props.colName.name} </span>
      </Tooltip>
    </>
  );
};

export default HeaderCell;
