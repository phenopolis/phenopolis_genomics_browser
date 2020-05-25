import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import ReactEcharts from 'echarts-for-react';

import { Card, CardContent, Grid, TextField, CardActions } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

class Plots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xAxis: null,
      yAxis: null,
      msg: 'Neither of two axises are selected',

      option: {
        title: {
          text: 'Scatter Plot between X and Y',
          subtext: ''
        },
        grid: {
          left: '3%',
          right: '15%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          showDelay: 0,
          // formatter: function (params) {
          //   if (params.value.length > 1) {
          //     return params.seriesName + ''
          //       + params.value[0] + 'cm '
          //       + params.value[1] + 'kg ';
          //   }
          //   else {
          //     return params.seriesName + ''
          //       + params.name + ' : '
          //       + params.value + 'kg ';
          //   }
          // },
          axisPointer: {
            show: true,
            type: 'cross',
            lineStyle: {
              type: 'dashed',
              width: 1
            }
          }
        },
        toolbox: {
          feature: {
            dataZoom: {},
            brush: {
              type: ['rect', 'polygon', 'clear']
            }
          }
        },
        brush: {
        },
        legend: {
          data: ['points'],
          type: 'scroll',
          orient: 'vertical',
          x: 'right',
          y: 'center',
          show: false
        },
        color: ['#2E84CF'],
        xAxis: [
          {
            type: 'value',
            scale: true,
            axisLabel: {
              formatter: '{value}'
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            scale: true,
            axisLabel: {
              formatter: '{value}'
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: 'points',
            type: 'scatter',
            data: [],
            markArea: {
              silent: true,
              itemStyle: {
                color: 'transparent',
                borderWidth: 1,
                borderType: 'dashed'
              },
              data: [[{
                name: '',
                xAxis: 'min',
                yAxis: 'min'
              }, {
                xAxis: 'max',
                yAxis: 'max'
              }]]
            },
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
              ]
            },
            // markLine: {
            //   label: {
            //     formatter: 'Average'
            //   },
            //   lineStyle: {
            //     type: 'solid',
            //   },
            //   data: [
            //     { type: 'average', name: 'Average' },
            //     { xAxis: 160 }
            //   ]
            // }
          }
        ]
      }
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
      const newOption = JSON.parse(JSON.stringify(this.state.option));
      newOption.series[0].data = tmpData
      newOption.title.text = 'Scatter Plot between ' + xAxis.name + ' and ' + yAxis.name

      let tmpMsg = "Now you have chose two axis, scatter plot has been drawed on the left. \n\n" +
        "The dashline box represents the max values for two dimensions.\n\n" +
        "The top and bottom balloons represents the max and min value for Y axis.\n\n" +
        "If you use row filter and column filter, the plot will change promptly"
      this.setState({ option: newOption, msg: tmpMsg })
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
                option={this.state.option}
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
