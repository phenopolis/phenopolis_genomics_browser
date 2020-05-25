import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { prepareBoxplotData } from 'echarts/extension/dataTool';
import ReactEcharts from 'echarts-for-react';

import { Card, CardContent, Grid, TextField, CardActions } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ScatterOptions from '../../assets/json/ScatterOption.json'

const tmpdata = prepareBoxplotData([
  [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980, 930, 650, 760, 810, 1000, 1000, 960, 960],
  [960, 940, 960, 940, 880, 800, 850, 880, 900, 840, 830, 790, 810, 880, 880, 830, 800, 790, 760, 800],
  [880, 880, 880, 860, 720, 720, 620, 860, 970, 950, 880, 910, 850, 870, 840, 840, 850, 840, 840, 840],
  [890, 810, 810, 820, 800, 770, 760, 740, 750, 760, 910, 920, 890, 860, 880, 720, 840, 850, 850, 780],
  [890, 840, 780, 810, 760, 810, 790, 810, 820, 850, 870, 870, 810, 740, 810, 940, 950, 800, 810, 870]
]);

class Plots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xAxis: null,
      yAxis: null,
      msg: 'Neither of two axises are selected',

      ScatterOption: ScatterOptions,
      // BoxplotOption: {
      //   title: [
      //     {
      //       text: 'Michelson-Morley Experiment',
      //       left: 'center',
      //     },
      //     {
      //       text: 'upper: Q3 + 1.5 * IQR \nlower: Q1 - 1.5 * IQR',
      //       borderColor: '#999',
      //       borderWidth: 1,
      //       textStyle: {
      //         fontSize: 14
      //       },
      //       left: '10%',
      //       top: '90%'
      //     }
      //   ],
      //   tooltip: {
      //     trigger: 'item',
      //     axisPointer: {
      //       type: 'shadow'
      //     }
      //   },
      //   grid: {
      //     left: '10%',
      //     right: '10%',
      //     bottom: '15%'
      //   },
      //   xAxis: {
      //     type: 'category',
      //     data: tmpdata.axisData,
      //     boundaryGap: true,
      //     nameGap: 30,
      //     splitArea: {
      //       show: false
      //     },
      //     axisLabel: {
      //       formatter: 'expr {value}'
      //     },
      //     splitLine: {
      //       show: false
      //     }
      //   },
      //   yAxis: {
      //     type: 'value',
      //     name: 'km/s minus 299,000',
      //     splitArea: {
      //       show: true
      //     }
      //   },
      //   series: [
      //     {
      //       name: 'boxplot',
      //       type: 'boxplot',
      //       data: tmpdata.boxData,
      //       tooltip: {
      //         formatter: function (param) {
      //           return [
      //             'Experiment ' + param.name + ': ',
      //             'upper: ' + param.data[5],
      //             'Q3: ' + param.data[4],
      //             'median: ' + param.data[3],
      //             'Q1: ' + param.data[2],
      //             'lower: ' + param.data[1]
      //           ].join('<br/>');
      //         }
      //       }
      //     },
      //     {
      //       name: 'outlier',
      //       type: 'scatter',
      //       data: tmpdata.outliers
      //     }
      //   ]
      // }
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
    if (xAxis !== null & yAxis !== null) {
      let tmpData = this.props.dataRows.map((row) => {
        return [row[xAxis.key], row[yAxis.key]]
      })

      const newScatterOption = JSON.parse(JSON.stringify(this.state.ScatterOption));

      newScatterOption.series[0].data = tmpData
      newScatterOption.title.text = 'Scatter Plot between ' + xAxis.name + ' and ' + yAxis.name

      let tmpMsg = "Now you have chose two axis, scatter plot has been drawed on the left. \n\n" +
        "The dashline box represents the max values for two dimensions.\n\n" +
        "The top and bottom balloons represents the max and min value for Y axis.\n\n" +
        "If you use row filter and column filter, the plot will change promptly"
      this.setState({ ScatterOption: newScatterOption, msg: tmpMsg })
    } else {
      this.setState({ msg: "Now please select the other axis." })
    }

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
                  options={this.props.variableList.filter(x => x.type === 'number' & x.show)}
                  getOptionLabel={(option) => option.type + '  -  ' + option.name}
                  renderInput={(params) => <TextField {...params} label="Select Y Axis" variant="outlined" />}
                  // style={{ width: 300 }}
                  style={{ width: 200 }}
                />
              </Grid>
            </Grid>
            <Grid item xs={6}>

              <ReactEcharts
                option={this.state.ScatterOption}
                // options={this.state.BoxplotOption}
                notMerge={true}
                lazyUpdate={true}
                style={{ height: 600 }} />

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
                  options={this.props.variableList.filter(x => x.type === 'number' & x.show)}
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
