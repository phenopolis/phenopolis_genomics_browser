import React from 'react';
import { HashLink } from 'react-router-hash-link';

import { Tooltip, Fab } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashAlt, faFileAlt } from '@fortawesome/pro-solid-svg-icons';

const ActionColumn = (props) => {
  return (
    <span>
      <Tooltip title="Update patient information/files" placement="top">
        <Fab
          className="mr-2"
          size="small"
          color="primary"
          aria-label="info"
          component={HashLink}
          to={'/editpatient/' + props.PatientID + '#info'}>
          <FontAwesomeIcon icon={faPen} />
        </Fab>
      </Tooltip>

      <Tooltip title="Manage VCF file for this patient" placement="top">
        <Fab
          className="mr-2"
          size="small"
          color="primary"
          aria-label="file"
          component={HashLink}
          to={'/editpatient/' + props.PatientID + '#file'}>
          <FontAwesomeIcon icon={faFileAlt} />
        </Fab>
      </Tooltip>

      <Tooltip title="Delete this patient" placement="top">
        <Fab
          className="mr-2"
          size="small"
          color="secondary"
          aria-label="delete"
          component={HashLink}
          to={'/editpatient/' + props.PatientID + '#delete'}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </Fab>
      </Tooltip>
    </span>
  );
};

export default ActionColumn;
