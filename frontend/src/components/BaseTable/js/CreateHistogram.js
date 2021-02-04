import React from 'react';
import ecStat from 'echarts-stat';

import HistogramOption from '../../../assets/echartJS/HistogramOption';

export const CreateHistogram = (mycolumns, myrows, axis) => {
  let tmpValue = myrows.map((x) => Number(x[axis.key]));
  var bins = ecStat.histogram(tmpValue);

  const newHistogramOption = JSON.parse(JSON.stringify(HistogramOption));
  newHistogramOption.title.text = 'Histogram of ' + axis.name;
  newHistogramOption.series[0].data = bins.data;

  let tmpMsg = 'Now you have chose one number axis, histogram will be plotted one the left.';

  // this.setState({ option: newHistogramOption, EventsDict: {}, msg: tmpMsg, plotReady: true });
  return { option: newHistogramOption, EventsDict: {}, msg: tmpMsg, plotReady: true };
};
