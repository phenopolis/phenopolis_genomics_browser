import React from 'react';
import _ from 'underscore';
import BarplotOption from '../../../assets/echartJS/BarplotOption';

export const CreateBarplot = (mycolumns, myrows, axis) => {
  let tmpValue = '';
  if (axis.type === 'string') {
    tmpValue = myrows.map((x) => x[axis.key]);
  } else {
    tmpValue = myrows
      .map((x) => {
        if (typeof x[axis.key] === 'string') {
          return x[axis.key];
        } else {
          return x[axis.key].map((y) => {
            if (typeof y === 'object') {
              if (y !== null) {
                return y.display;
              } else {
                return 'null';
              }
            } else {
              return y;
            }
          });
        }
        //  x[Axis.key].map((y) => y)
      })
      .flat();
  }

  tmpValue = _.countBy(tmpValue);

  const newBarplotOption = JSON.parse(JSON.stringify(BarplotOption));
  newBarplotOption.xAxis.data = Object.keys(tmpValue);
  newBarplotOption.series[0].data = Object.values(tmpValue);
  newBarplotOption.xAxis.name = axis.name;
  newBarplotOption.title.text = 'Barplot of ' + axis.name;
  newBarplotOption.tooltip.formatter = function (params) {
    return `${axis.name} (x-axis): <b>${params.name}</b> <br/>
            Total counts (y-axis): <b>${params.data}</b>`;
  };

  let tmpMsg =
    'Now you have chose one categorical axis, barplot will be plotted one the left. \n\n' +
    'You may hover on bar to check total counts (y axis) and corresponding certain category in ' +
    axis.name +
    ' (x axis). \n\n' +
    'If you use row filter and column filter, the plot will change promptly';

  return {
    option: newBarplotOption,
    EventsDict: {},
    msg: tmpMsg,
    errorMsg: '',
    warningMsg: '',
    plotReady: true,
  };
};
