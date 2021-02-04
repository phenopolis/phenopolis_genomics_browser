import React from 'react';
import ecStat from 'echarts-stat';

import HistogramOption from '../../../assets/echartJS/HistogramOption';

export const CreateHistogram = (mycolumns, myrows, axis) => {
  let tmpValue = myrows.map((x) => Number(x[axis.key]));
  console.log(tmpValue);
  if (tmpValue.length < 2) {
    return {
      option: [],
      EventsDict: {},
      msg: '',
      errorMsg: 'Not enought row to draw Histogram, at least 2 rows required',
      plotReady: false,
    };
  }

  var bins = ecStat.histogram(tmpValue);

  const newHistogramOption = JSON.parse(JSON.stringify(HistogramOption));
  newHistogramOption.title.text = 'Histogram for Distribution of ' + axis.name;
  newHistogramOption.tooltip.formatter = function (params) {
    return `${axis.name} value (x-axis): ${params.value[0]}<br />
            Total counts (y-axis): ${params.value[1]}`;
  };
  newHistogramOption.xAxis[0].name = axis.name;

  newHistogramOption.series[0].data = bins.data;

  let tmpMsg = 'Now you have chose one number axis, histogram will be plotted one the left.';

  // this.setState({ option: newHistogramOption, EventsDict: {}, msg: tmpMsg, plotReady: true });
  return { option: newHistogramOption, EventsDict: {}, msg: tmpMsg, errorMsg: '', plotReady: true };
};
