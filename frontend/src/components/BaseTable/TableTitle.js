import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Toolbar, Typography, Box, IconButton } from '@material-ui/core';
import CountUp from 'react-countup';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTh } from '@fortawesome/pro-solid-svg-icons';

import { useDispatch, useSelector } from 'react-redux';
import { setCompact } from '../../redux/actions/tableStatus';

const TableTitle = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const { compact } = useSelector((state) => ({
    compact: state.TableStatus.compact,
  }));

  const handleCompactVersionChange = () => {
    dispatch(setCompact());
    // props.onCompactVersionChange()
  };

  return (
    <Toolbar className={classes.toolbar}>
      <Typography component="div">
        <Box fontWeight="900" fontSize="h5.fontSize" mb={0}>
          {props.title}
        </Box>
        <Box fontWeight="fontWeightLight" mb={2}>
          {props.subtitle}
        </Box>
      </Typography>
      <div style={{ position: 'absolute', right: '1em' }}>
        <b style={{ fontSize: '1.3em', color: '#2196f3' }}>
          <CountUp end={props.rowLength} />
        </b>
        &nbsp;rows and&nbsp;
        <b style={{ fontSize: '1.3em', color: '#2196f3' }}>
          <CountUp end={props.columnLength} />
        </b>
        &nbsp;columns selected
        <IconButton
          color="primary"
          aria-label="GridStyle"
          style={{ marginLeft: '5px', marginBottom: '3px' }}
          onClick={handleCompactVersionChange}>
          <FontAwesomeIcon icon={compact ? faTh : faBars} style={{ fontSize: '15px' }} />
        </IconButton>
      </div>
    </Toolbar>
  );
};

const useStyles = makeStyles((theme) => ({
  toolbar: {
    backgroundColor: '#eeeee',
    opacity: 1,
    flexGrow: 1,
  },
}));

export default TableTitle;
