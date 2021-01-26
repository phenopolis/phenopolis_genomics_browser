import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Toolbar, Typography, Box } from '@material-ui/core';
import CountUp from 'react-countup';

const TableTitle = (props) => {
  const classes = useStyles();

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
