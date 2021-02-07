import React from 'react';
import ScatterOption from '../../../assets/echartJS/ScatterOption';

export const CreateScatterplot = (mycolumns, myrows, xAxis, yAxis) => {
  let tmpData = myrows.map((row) => {
    return [row[xAxis.key], row[yAxis.key]];
  });

  const newScatterOption = JSON.parse(JSON.stringify(ScatterOption));
  newScatterOption.xAxis[0].name = xAxis.name;
  newScatterOption.yAxis[0].name = yAxis.name;
  newScatterOption.series[0].data = tmpData;
  newScatterOption.title.text = 'Scatter Plot between ' + xAxis.name + ' and ' + yAxis.name;
  newScatterOption.tooltip.formatter = function (params) {
    return `${xAxis.name} (x-axis): <b>${params.value[0]}</b><br />
            ${yAxis.name} (y-axis): <b>${params.value[1]}</b>`;
  };

  let tmpMsg =
    'Now you have chose two numeric columns, scatter plot has been drawed on the left. \n\n' +
    'You may click the points to scroll corresponding row to top table.\n\n' +
    'If you use row filter and column filter, the plot will change promptly';

  return {
    option: newScatterOption,
    EventsDict: {},
    msg: tmpMsg,
    errorMsg: '',
    warningMsg: '',
    plotReady: true,
  };
};
