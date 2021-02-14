import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TableCell, Typography, ButtonGroup, Button, IconButton, Tooltip } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrashAlt, faFileAlt } from '@fortawesome/pro-solid-svg-icons';

const useStyles = makeStyles((theme) => ({}));

const ActionColumn = (props) => {
  const classes = useStyles();

  useEffect(() => {
    // console.log(props)
  }, [props]);

  const triggerAction = (action) => {
    props.onActionFunction(props.rowIndex, action);
  };

  return (
    <span>
      <Tooltip title="Update patient information/files" placement="top">
        <IconButton
          className="bg-white text-third ml-1"
          style={{ width: 30, height: 30, padding: 0, border: '0.5px solid #616161' }}
          aria-label="update"
          onClick={() => triggerAction('update')}>
          <FontAwesomeIcon icon={faPencil} style={{ fontSize: '12' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Manage VCF file for this patient" placement="top">
        <IconButton
          className="bg-white text-third ml-1"
          style={{ width: 30, height: 30, padding: 0, border: '0.5px solid #616161' }}
          aria-label="file"
          onClick={() => triggerAction('file')}>
          <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: '12' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete this patient" placement="top">
        <IconButton
          className="bg-white text-third ml-1"
          style={{ width: 30, height: 30, padding: 0, border: '0.5px solid #f44336' }}
          aria-label="delete"
          color="secondary"
          onClick={() => triggerAction('delete')}>
          <FontAwesomeIcon icon={faTrashAlt} style={{ fontSize: '12' }} />
        </IconButton>
      </Tooltip>
    </span>
  );
};

export default ActionColumn;
