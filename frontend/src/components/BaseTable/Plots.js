import React, { PureComponent, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Card, CardContent, Grid, Box, Typography } from '@material-ui/core';

import ReactEcharts from 'echarts-for-react';
import ReactSelect from './ReactSelect';

import { CreateHistogram } from './js/CreateHistogram';
import { CreateBarplot } from './js/CreateBarplot';
import { CreateScatterplot } from './js/CreateScatterplot';

const Plots = (props) => {
  const classes = useStyles();

  const [xAxis, setXAxis] = useState(null);
  const [yAxis, setYAxis] = useState(null);
  const [plotReady, setPlotReady] = useState(false);
  const [EventsDict, setEventsDict] = useState(null);
  const [msg, setMSG] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [option, setOption] = useState([]);

  useEffect(() => {
    getSeriesData();
  }, [xAxis, yAxis, props]);

  const ReactSelectXAxis = (selectedOption) => {
    setXAxis(selectedOption);
  };

  const ReactSelectYAxis = (selectedOption) => {
    setYAxis(selectedOption);
  };

  const getSeriesData = () => {
    if ((xAxis === null) & (yAxis === null)) {
      setErrorMsg('Neither of two axises is selected.');
      setPlotReady(false);
      return null;
    }

    if ((xAxis !== null) & (yAxis !== null)) {
      if ((xAxis.type === 'number') & (yAxis.type === 'number')) {
        var newPlot = CreateScatterplot(props.variableList, props.dataRows, xAxis, yAxis);
        newPlot.EventsDict = { click: onScatterClick };
      } else if ((xAxis.type !== 'number') & (yAxis.type === 'number')) {
        // this.CreateBoxplot(xAxis, yAxis, false);
      } else if ((xAxis.type === 'number') & (yAxis.type !== 'number')) {
        // this.CreateBoxplot(yAxis, xAxis, true);
      } else {
        // this.CreateStackBarPlot(xAxis, yAxis);
      }
    } else if ((xAxis !== null) & (yAxis === null)) {
      if (xAxis.type === 'number') {
        var newPlot = CreateHistogram(props.variableList, props.dataRows, xAxis);
      } else if ((xAxis.type === 'string') | (xAxis.type === 'object')) {
        var newPlot = CreateBarplot(props.variableList, props.dataRows, xAxis);
      }
    } else if ((xAxis === null) & (yAxis !== null)) {
      if (yAxis.type === 'number') {
        let newPlot = CreateHistogram(props.variableList, props.dataRows, yAxis);
      } else if ((yAxis.type === 'string') | (yAxis.type === 'object')) {
        var newPlot = CreateBarplot(props.variableList, props.dataRows, yAxis);
      }
    }

    setOption(newPlot.option);
    setEventsDict(newPlot.EventsDict);
    setErrorMsg(newPlot.errorMsg);
    setMSG(newPlot.msg);
    setPlotReady(newPlot.plotReady);
  };

  const onScatterClick = (param) => {
    props.ScrollToRow(param.dataIndex);
  };

  return (
    <Card elevation={0} className={classes.root}>
      <CardContent>
        <Grid container justify="center" spacing={5} style={{ marginBottom: '2em' }}>
          <Grid item xs={3}>
            <ReactSelect
              currentValue={yAxis}
              placeholder="Select Y Axis"
              optionList={props.variableList.filter(
                (x) =>
                  ((x.type === 'number') | (x.type === 'string') | (x.type === 'object')) & x.show
              )}
              onSelectChange={ReactSelectYAxis}
            />
          </Grid>

          <Grid item xs={3}>
            <ReactSelect
              currentValue={xAxis}
              placeholder="Select X Axis"
              optionList={props.variableList.filter(
                (x) =>
                  ((x.type === 'number') | (x.type === 'string') | (x.type === 'object')) & x.show
              )}
              onSelectChange={ReactSelectXAxis}
            />
          </Grid>
        </Grid>

        <Grid container justify="center" spacing={0}>
          <Grid item xs={2}></Grid>
          <Grid item xs={6}>
            {/* {this.state.warningMessage !== '' ? (
            <div className="text-center p-2">
              <div className="font-weight-bold font-size-lg mt-1">
                Do you want to continue to plot?
              </div>
              <p className="mb-0 mt-2 text-grey font-size-md">{this.state.warningMessage}</p>
              <div className="pt-4">
                <Button
                  onClick={this.cancelPlot}
                  variant="outlined"
                  color="primary"
                  className="mx-1">
                  <span className="btn-wrapper--label">Cancel</span>
                </Button>
                <Button
                  onClick={this.confirmPlot}
                  variant="outlined"
                  color="primary"
                  className="mx-1">
                  <span className="btn-wrapper--label">Yes, do it</span>
                </Button>
              </div>
            </div>
          ) : null} */}

            {plotReady ? (
              <ReactEcharts
                option={option}
                notMerge={true}
                lazyUpdate={true}
                onEvents={EventsDict}
                style={{ height: '40em' }}
              />
            ) : (
              <div>
                <Box display="flex" justifyContent="center" alignItems="center" gutterBottom>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ color: 'grey', fontWeight: '900' }}>
                    {errorMsg}
                  </Typography>
                </Box>
                <div style={{ paddingTop: '2em', color: 'darkgrey', 'white-space': 'pre-wrap' }}>
                  {'Please Select variables for X axis and Y axis to drawn corresponding.\n' +
                    '1. For single numeric column, Histograme will be drawn to show data distribution.\n' +
                    '3. For single text or object column, Barplot will be drawn to count apperance of each value.\n' +
                    '4. For two numeric columns, ScatterPlot will be drawn to show column correlation.\n' +
                    '5. For two text or object columns, StackBarplot will be drawn to show accumulated apperance.\n' +
                    '6. For one numeric and one text/object column, Boxplot will be drawn.'}
                  <div style={{ marginTop: '1em', 'white-space': 'pre-wrap' }}>{msg}</div>
                </div>
              </div>
            )}
          </Grid>
          <Grid item xs={2} style={{ paddingTop: '5em', color: 'darkgrey' }}>
            {plotReady ? (
              <div style={{ paddingTop: '2em', color: 'darkgrey' }}>
                <div style={{ marginTop: '1em', 'white-space': 'pre-wrap' }}>{msg}</div>
              </div>
            ) : null}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxHeight: 800,
    overflowY: 'auto',
  },
  rotateSelect: {
    position: 'relative',
    top: '40%',
  },
}));

export default Plots;
