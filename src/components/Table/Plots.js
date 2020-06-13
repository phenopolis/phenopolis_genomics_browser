import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { prepareBoxplotData } from 'echarts/extension/dataTool';
import ecStat from 'echarts-stat'
import ReactEcharts from 'echarts-for-react';

import { Card, CardContent, Grid, TextField, CardActions, Paper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import BoxplotOption from '../../assets/echartJS/BoxplotOption'
import ScatterOption from '../../assets/echartJS/ScatterOption';
import StackBarOption from '../../assets/echartJS/StackBarOption';
import HistogramOption from '../../assets/echartJS/HistogramOption';
import BarplotOption from '../../assets/echartJS/BarplotOption';

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
      this.setState({ msg: "Neither of two axises is selected.", plotReady: false })
    }
    else if (xAxis !== null & yAxis !== null) {
      if (xAxis.type === 'number' & yAxis.type === 'number') {
        this.CreateScatterPlot(xAxis, yAxis)
      } else if (xAxis.type !== "number" & yAxis.type === 'number') {
        this.CreateBoxplot(xAxis, yAxis, false)
      } else if (xAxis.type === 'number' & yAxis.type !== "number") {
        this.CreateBoxplot(yAxis, xAxis, true)
      } else {
        this.CreateStackBarPlot(xAxis, yAxis)
      }
    } else if (xAxis !== null & yAxis === null) {
      if (xAxis.type === 'number') {
        this.CreateHistogram(xAxis)
      } else if (xAxis.type === 'string' | xAxis.type === 'object') {
        this.CreateBarplot(xAxis)
      }
    } else if (xAxis === null & yAxis !== null) {
      if (yAxis.type === 'number') {
        this.CreateHistogram(yAxis)
      } else if (yAxis.type === 'string' | yAxis.type === 'object') {
        this.CreateBarplot(yAxis)
      }
    }
  }

  CreateBarplot = (Axis) => {

    if (Axis.type === "string") {
      var tmpValue = this.props.dataRows.map(x => x[Axis.key]);
    } else {
      if (typeof this.props.dataRows[0][Axis.key] === "object") {
        var tmpValue = this.props.dataRows.map(x => x[Axis.key].map(y => y.display)).flat();
      } else {
        var tmpValue = this.props.dataRows.map(x => x[Axis.key].map(y => y)).flat();
      }

    }

    var _ = require('underscore')
    tmpValue = _.countBy(tmpValue);

    const newBarplotOption = JSON.parse(JSON.stringify(BarplotOption))
    newBarplotOption.xAxis.data = Object.keys(tmpValue)
    newBarplotOption.series[0].data = Object.values(tmpValue)
    newBarplotOption.series[0].name = Axis.name
    newBarplotOption.title.text = "Barplot of " + Axis.name

    let tmpMsg = "Now you have chose one categorical axis, barplot will be plotted one the left."

    this.setState({ option: newBarplotOption, msg: tmpMsg, plotReady: true })
  }

  CreateHistogram = (Axis) => {
    let tmpValue = this.props.dataRows.map(x => x[Axis.key]);

    var bins = ecStat.histogram(tmpValue);

    const newHistogramOption = JSON.parse(JSON.stringify(HistogramOption))
    newHistogramOption.title.text = "Histogram of " + Axis.name
    newHistogramOption.series[0].data = bins.data

    let tmpMsg = "Now you have chose one number axis, histogram will be plotted one the left."

    this.setState({ option: newHistogramOption, msg: tmpMsg, plotReady: true })
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
    console.log("- - - - - - - - - - - - - -")
    console.log("Create Boxplot")

    var flattenData = []
    if (xAxis.type === "object") {
      this.props.dataRows.forEach((item) => {
        item[xAxis.key].forEach((chip) => {
          flattenData.push({ keyX: chip.display, keyY: item[yAxis.key] })
        })
      })
    } else {
      this.props.dataRows.forEach((item) => {
        flattenData.push({ keyX: item[xAxis.key], keyY: item[yAxis.key] })
      })
    }

    Array.prototype.groupBy = function (k, m) {
      return this.reduce((acc, item) => ((acc[item[k]] = [...(acc[item[k]] || []), item[m]]), acc), {});
    };

    let groupedByxAxis = flattenData.groupBy("keyX", "keyY")

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

    var flattenData = []
    if (xAxis.type === "object" & yAxis.type === "object") {
      this.props.dataRows.forEach((item) => {
        item[xAxis.key].forEach((chipX) => {
          item[yAxis.key].forEach(chipY => {
            flattenData.push({ keyX: chipX.display, keyY: chipY.display })
          })
        })
      })
    } else if (xAxis.type === "object" & yAxis.type === "string") {
      this.props.dataRows.forEach((item) => {
        item[xAxis.key].forEach((chip) => {
          flattenData.push({ keyX: chip.display, keyY: item[yAxis.key] })
        })
      })
    } else if (xAxis.type === "string" & yAxis.type === "object") {
      this.props.dataRows.forEach((item) => {
        item[yAxis.key].forEach((chip) => {
          flattenData.push({ keyX: item[xAxis.key], keyY: chip.display })
        })
      })
    } else {
      flattenData = this.props.dataRows.map(item => {
        return { keyX: item[xAxis.key], keyY: item[yAxis.key] }
      })
    }

    console.log(flattenData)

    const tmpMap = flattenData.reduce((tally, item) => {
      tally[item["keyX"] + "-" + item["keyY"]] = (tally[item[["keyX"]] + "-" + item["keyY"]] || 0) + 1;
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

          <Grid container justify="center" spacing={5} style={{ marginBottom: "2em" }}>
            <Grid item xs={2}>
              <Autocomplete
                freeSolo
                value={this.state.yAxis}
                onChange={(event, newValue) => this.handleSelectYAxis(event, newValue)}
                id="combo-box-demo"
                size="small"
                options={this.props.variableList.filter(x => (x.type === 'number' | x.type === 'string' | x.type === 'object') & x.show)}
                getOptionLabel={(option) => option.type + '  -  ' + option.name}
                renderInput={(params) => <TextField {...params} label="Select Y Axis" variant="outlined" />}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item xs={2}>
              <Autocomplete
                freeSolo
                value={this.state.xAxis}
                onChange={(event, newValue) => this.handleSelectXAxis(event, newValue)}
                id="combo-box-demo"
                size="small"
                options={this.props.variableList.filter(x => (x.type === 'number' | x.type === 'string' | x.type === 'object') & x.show)}
                getOptionLabel={(option) => option.type + '  -  ' + option.name}
                renderInput={(params) => <TextField {...params} label="Select X Axis" variant="outlined" />}
                style={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <Grid container justify="center" spacing={0}>
            <Grid item xs={2}>
            </Grid>
            <Grid item xs={6}>
              {
                this.state.plotReady ? (
                  <ReactEcharts
                    option={this.state.option}
                    notMerge={true}
                    lazyUpdate={true}
                    style={{ height: '40em' }} />
                ) : (
                    <div style={{ paddingTop: '2em', color: 'darkgrey', textAlign: "center" }}>
                      Please Select variables for X axis and Y axis to draw Scatter Plot.
                      <div style={{ marginTop: '1em', 'white-space': 'pre-wrap' }}>
                        {this.state.msg}
                      </div>
                    </div>
                  )
              }
            </Grid>
            <Grid item xs={2} style={{ paddingTop: '5em', color: 'darkgrey' }}>
              {
                this.state.plotReady ? (
                  <div style={{ paddingTop: '2em', color: 'darkgrey' }}>
                    <div style={{ marginTop: '1em', 'white-space': 'pre-wrap' }}>
                      {this.state.msg}
                    </div>
                  </div>
                ) : (null)
              }
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
    width: "100%",
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
