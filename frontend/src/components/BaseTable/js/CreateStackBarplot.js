import React from 'react';
import StackBarOption from '../../../assets/echartJS/StackBarOption';

export const CreateStackBarplot = (mycolumns, myrows, xAxis, yAxis) => {
  var flattenData = [];

  myrows.forEach((item) => {
    if (typeof item[xAxis.key] === 'string') {
      if (typeof item[yAxis.key] === 'string') {
        flattenData.push({ keyX: item[xAxis.key], keyY: item[yAxis.key] });
      } else {
        item[yAxis.key].forEach((chip) => {
          flattenData.push({ keyX: item[xAxis.key], keyY: chip.display });
        });
      }
    } else {
      item[xAxis.key].forEach((chipX) => {
        if (typeof item[yAxis.key] === 'string') {
          flattenData.push({
            keyX: chipX !== null ? chipX.display : 'null',
            keyY: item[yAxis.key],
          });
        } else {
          item[yAxis.key].forEach((chipY) => {
            flattenData.push({
              keyX: chipX !== null ? chipX.display : 'null',
              keyY: chipY !== null ? chipY.display : 'null',
            });
          });
        }
      });
    }
  });

  const tmpMap = flattenData.reduce((tally, item) => {
    tally[item['keyX'] + '-' + item['keyY']] =
      (tally[item[['keyX']] + '-' + item['keyY']] || 0) + 1;
    return tally;
  }, {});

  var JoinCount = Object.keys(tmpMap).map((a) => {
    var obj = {
      x: a.split('-')[0],
      y: a.split('-')[1],
      tally: tmpMap[a],
    };
    return obj;
  });

  var xOptions = Array.from(new Set(JoinCount.map((item) => item.x)));
  var yOptions = Array.from(new Set(JoinCount.map((item) => item.y)));

  var newSeries = [];
  yOptions.forEach((y) => {
    let tmp = [];
    xOptions.forEach((x) => {
      if (tmpMap[x + '-' + y] !== undefined) {
        tmp.push(tmpMap[x + '-' + y]);
      } else {
        tmp.push(0);
      }
    });

    newSeries.push({
      name: y,
      type: 'bar',
      stack: 'count',
      itemStyle: {
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 5,
      },
      data: tmp,
    });
  });

  const newStackBarOption = JSON.parse(JSON.stringify(StackBarOption));
  newStackBarOption.title.text = 'StackBarplot of ' + yAxis.name + ' on ' + xAxis.name;
  newStackBarOption.series = newSeries;
  newStackBarOption.legend.data = yOptions;
  newStackBarOption.xAxis.data = xOptions;
  newStackBarOption.xAxis.name = xAxis.name;
  newStackBarOption.yAxis.name = yAxis.name;
  newStackBarOption.tooltip.formatter = function (params) {
    console.log(params);
    var colorSpan = (color) =>
      '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' +
      color +
      '"></span>';
    return `${xAxis.name} (x-axis): <b>${params.name}</b><br />
            ${yAxis.name} (y-axis): <b>${params.seriesName}</b><br/>
            ${colorSpan(params.color)} Total Counts: ${params.data}`;
  };

  let tmpMsg =
    'Now you have chose two text(category) column, StackBarplot will be plotted one the left. \n\n' +
    'You may hover on each block to check number of table rows included. \n\n' +
    'You may click legend at bottom to show/hide certain group in ' +
    yAxis.name +
    '\n\n' +
    'If you use row filter and column filter, the plot will change promptly';

  let plotReady = true;
  let warningMessage = '';
  if ((xOptions.length >= 20) | (yOptions.length >= 20)) {
    plotReady = false;
    warningMessage =
      'More than 20 bars/stacks would be plotted. Too many elements in one plot may be less informative to observe, and even slow your browser. However, you can still plot it by click if you insist.';
  }

  return {
    option: newStackBarOption,
    EventsDict: {},
    msg: tmpMsg,
    errorMsg: '',
    warningMsg: warningMessage,
    plotReady: plotReady,
  };
};
