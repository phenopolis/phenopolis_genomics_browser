import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { prepareBoxplotData } from 'echarts/extension/dataTool';
import ReactEcharts from 'echarts-for-react';

import { Card, CardContent, Grid, TextField, CardActions, Paper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import BoxplotOption from '../../assets/echartJS/BoxplotOption'
import ScatterOption from '../../assets/echartJS/ScatterOption';
import StackBarOption from '../../assets/echartJS/StackBarOption';


class Plots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xAxis: null,
      yAxis: null,
      msg: 'Neither of two axises are selected',
      option: [],
      plotReady: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.getSeriesData(this.state.xAxis, this.state.yAxis)
  }

  handleSelectXAxis = (event, newValue, index) => {
    this.setState({ xAxis: newValue }, () => {
      this.getSeriesData(this.state.xAxis, this.state.yAxis)
    })
  }

  handleSelectYAxis = (event, newValue, index) => {
    this.setState({ yAxis: newValue }, () => {
      this.getSeriesData(this.state.xAxis, this.state.yAxis)
    })
  }

  getSeriesData = (xAxis, yAxis) => {

    if (xAxis === null & yAxis === null) {
      this.setState({ msg: "Neither of two axises is selected." })
    }
    else if (xAxis !== null & yAxis !== null) {
      if (xAxis.type === 'number' & yAxis.type === 'number') {
        this.CreateScatterPlot(xAxis, yAxis)
      } else if (xAxis.type === 'string' & yAxis.type === 'number') {
        this.CreateBoxplot(xAxis, yAxis, false)
      } else if (xAxis.type === 'number' & yAxis.type === 'string') {
        this.CreateBoxplot(yAxis, xAxis, true)
      } else {
        this.CreateStackBarPlot(xAxis, yAxis)
      }
    } else {
      this.setState({ msg: "Now please select the other axis." })
    }
  }

  CreateScatterPlot = (xAxis, yAxis) => {

    let tmpData = this.props.dataRows.map((row) => {
      return [row[xAxis.key], row[yAxis.key]]
    })

    const newScatterOption = JSON.parse(JSON.stringify(ScatterOption))

    newScatterOption.series[0].data = tmpData
    newScatterOption.title.text = 'Scatter Plot between ' + xAxis.name + ' and ' + yAxis.name

    let tmpMsg = "Now you have chose two axis, scatter plot has been drawed on the left. \n\n" +
      "The dashline box represents the max values for two dimensions.\n\n" +
      "The top and bottom balloons represents the max and min value for Y axis.\n\n" +
      "If you use row filter and column filter, the plot will change promptly"

    this.setState({ option: newScatterOption, msg: tmpMsg, plotReady: true })
  }

  CreateBoxplot = (xAxis, yAxis, rotate) => {

    Array.prototype.groupBy = function (k, m) {
      return this.reduce((acc, item) => ((acc[item[k]] = [...(acc[item[k]] || []), item[m]]), acc), {});
    };

    let groupedByxAxis = this.props.dataRows.groupBy(xAxis.key, yAxis.key)

    let labels = Object.keys(groupedByxAxis)

    if (rotate) {
      var tmpData = prepareBoxplotData(Object.values(groupedByxAxis), { layout: 'vertical' });
    } else {
      var tmpData = prepareBoxplotData(Object.values(groupedByxAxis));
    }


    const newBoxplotOption = JSON.parse(JSON.stringify(BoxplotOption))

    newBoxplotOption.xAxis.data = labels
    newBoxplotOption.series[0].data = tmpData.boxData
    newBoxplotOption.series[1].data = tmpData.outliers

    if (rotate) {
      let tmpSwap = newBoxplotOption.xAxis
      newBoxplotOption.xAxis = newBoxplotOption.yAxis
      newBoxplotOption.yAxis = tmpSwap
    }


    let tmpMsg = "Now you have chose two axis, boxplot plot has been drawed on the left. \n\n" +
      "Dots represents outlier for each box.\n\n" +
      "If you use row filter and column filter, the plot will change promptly"

    this.setState({ option: newBoxplotOption, msg: tmpMsg, plotReady: true })
  }

  CreateStackBarPlot = (xAxis, yAxis) => {

    const tmpMap = this.props.dataRows.reduce((tally, item) => {
      tally[item[xAxis.key] + "-" + item[yAxis.key]] = (tally[item[[xAxis.key]] + "-" + item[yAxis.key]] || 0) + 1;
      return tally;
    }, {});

    console.log(tmpMap)

    var JoinCount = Object.keys(tmpMap).map((a) => {
      var obj = {
        x: a.split("-")[0],
        y: a.split("-")[1],
        tally: tmpMap[a]
      };
      return obj;
    });

    var xOptions = Array.from(new Set(JoinCount.map((item) => item.x)))
    var yOptions = Array.from(new Set(JoinCount.map((item) => item.y)))

    var newSeries = []
    yOptions.forEach(y => {
      let tmp = []
      xOptions.forEach(x => {
        if (tmpMap[x + '-' + y] !== undefined) {
          tmp.push(tmpMap[x + '-' + y])
        } else {
          tmp.push(0)
        }
      })

      newSeries.push(
        {
          "name": y,
          "type": "bar",
          "stack": "count",
          "label": {
            "show": true,
            "position": "insideRight"
          },
          "data": tmp
        }
      )
    })

    const newStackBarOption = JSON.parse(JSON.stringify(StackBarOption))
    newStackBarOption.series = newSeries
    newStackBarOption.legend.data = yOptions
    newStackBarOption.xAxis.data = xOptions

    let tmpMsg = "This is stacked bar plot."

    this.setState({ option: newStackBarOption, msg: tmpMsg, plotReady: true })
  }

  render() {
    const { classes } = this.props;

    return (
      <Card elevation={0} className={classes.root}>
        <CardContent>
          <Grid container justify="center" spacing={0}>
            <Grid item xs={3}>
              <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="center"
                className={classes.rotateSelect}
              >
                <Autocomplete
                  freeSolo
                  value={this.state.yAxis}
                  onChange={(event, newValue) => this.handleSelectYAxis(event, newValue)}
                  id="combo-box-demo"
                  size="small"
                  options={this.props.variableList.filter(x => (x.type === 'number' | x.type === 'string') & x.show)}
                  getOptionLabel={(option) => option.type + '  -  ' + option.name}
                  renderInput={(params) => <TextField {...params} label="Select Y Axis" variant="outlined" />}
                  // style={{ width: 300 }}
                  style={{ width: 200 }}
                />
              </Grid>
            </Grid>
            <Grid item xs={6}>
              {
                this.state.plotReady ? (
                  <ReactEcharts
                    option={this.state.option}
                    // options={this.state.BoxplotOption}
                    notMerge={true}
                    lazyUpdate={true}
                    style={{ height: '40em' }} />
                ) : (
                    <div style={{ height: '40em' }} />
                  )
              }

              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                className="m-4"
              >

                <Autocomplete
                  freeSolo
                  value={this.state.xAxis}
                  onChange={(event, newValue) => this.handleSelectXAxis(event, newValue)}
                  id="combo-box-demo"
                  size="small"
                  options={this.props.variableList.filter(x => (x.type === 'number' | x.type === 'string') & x.show)}
                  getOptionLabel={(option) => option.type + '  -  ' + option.name}
                  renderInput={(params) => <TextField {...params} label="Select X Axis" variant="outlined" />}
                  // style={{ width: 300 }}
                  style={{ width: 200 }}
                />
              </Grid>
            </Grid>
            <Grid item xs={3} style={{ paddingTop: '5em', color: 'darkgrey' }}>
              Please Select variables for X axis and Y axis to draw Scatter Plot.
              <div style={{ marginTop: '3em', 'white-space': 'pre-wrap' }}>
                {this.state.msg}
              </div>
            </Grid>
          </Grid>

        </CardContent>
      </Card >
    )
  }
}

Plots.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    width: 1400,
    maxHeight: 800,
    overflowY: 'auto'
  },
  rotateSelect: {
    position: 'relative',
    top: '40%',
    // '-webkit-transform': 'rotate(270deg)',
    // '-moz-transform': 'rotate(270deg)',
    // '-o-transform': 'rotate(270deg)',
    // '-ms-transform': 'rotate(270deg)',
    // 'transform': 'rotate(270deg)',
  }
});

export default compose(withStyles(styles))(Plots)
