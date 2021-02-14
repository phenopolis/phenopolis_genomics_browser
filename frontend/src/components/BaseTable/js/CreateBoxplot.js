import React from 'react';
import BoxplotOption from '../../../assets/echartJS/BoxplotOption';
import { prepareBoxplotData } from 'echarts/extension/dataTool';

export const CreateBoxplot = (mycolumns, myrows, xAxis, yAxis, rotate) => {
  var flattenData = [];
  if (xAxis.type === 'object') {
    myrows.forEach((item) => {
      if (typeof item[xAxis.key] === 'string') {
        flattenData.push({ keyX: item[xAxis.key], keyY: item[yAxis.key] });
      } else {
        item[xAxis.key].forEach((chip) => {
          flattenData.push({
            keyX: chip !== null ? chip.display : 'null',
            keyY: item[yAxis.key],
          });
        });
      }
    });
  } else {
    myrows.forEach((item) => {
      flattenData.push({ keyX: item[xAxis.key], keyY: item[yAxis.key] });
    });
  }

  let groupedByxAxis = flattenData.reduce((acc, item) => {
    acc[item['keyX']] = [...(acc[item['keyX']] || []), item['keyY']];
    return acc;
  }, {});

  let labels = Object.keys(groupedByxAxis);

  let tmpData = null;
  if (rotate) {
    tmpData = prepareBoxplotData(Object.values(groupedByxAxis), { layout: 'vertical' });
  } else {
    tmpData = prepareBoxplotData(Object.values(groupedByxAxis));
  }

  const newBoxplotOption = JSON.parse(JSON.stringify(BoxplotOption));

  newBoxplotOption.title.text = 'Boxplot of ' + yAxis.name + ' on ' + xAxis.name;
  newBoxplotOption.xAxis.data = labels;
  newBoxplotOption.xAxis.name = xAxis.name;
  newBoxplotOption.yAxis.name = yAxis.name;
  newBoxplotOption.series[0].data = tmpData.boxData;
  newBoxplotOption.series[1].name = yAxis.name;
  newBoxplotOption.series[1].data = tmpData.outliers;
  newBoxplotOption.tooltip.formatter = function (params) {
    if (params.componentSubType === 'boxplot') {
      var quantileState = [
        'Box of <b>' + params.name + '</b>',
        '&nbsp;&nbsp;upper: <b>' +
          Math.round((params.data[5] + Number.EPSILON) * 100) / 100 +
          '</b>',
        '&nbsp;&nbsp;Q3: <b>' + Math.round((params.data[4] + Number.EPSILON) * 100) / 100 + '</b>',
        '&nbsp;&nbsp;median: <b>' +
          Math.round((params.data[3] + Number.EPSILON) * 100) / 100 +
          '</b>',
        '&nbsp;&nbsp;Q1: <b>' + Math.round((params.data[2] + Number.EPSILON) * 100) / 100 + '</b>',
        '&nbsp;&nbsp;lower: <b>' +
          Math.round((params.data[1] + Number.EPSILON) * 100) / 100 +
          '</b>',
      ].join('<br/>');
    } else {
      var quantileState =
        'Outlier for <b>' +
        params.name +
        '</b><br/>' +
        params.seriesName +
        ': <b>' +
        params.data[1] +
        '</b>';
    }

    return quantileState;
  };

  if (rotate) {
    let tmpSwap = newBoxplotOption.xAxis;
    newBoxplotOption.xAxis = newBoxplotOption.yAxis;
    newBoxplotOption.yAxis = tmpSwap;
  }

  let tmpMsg =
    'Now you have chose one numeric column and one text (category) column, boxplot plot has been drawed on the left. \n\n' +
    'Dots represents outlier for each box.\n\n' +
    'If you use row filter and column filter, the plot will change promptly';

  let plotReady = true;
  let warningMessage = '';
  if (labels.length >= 20) {
    plotReady = false;
    warningMessage =
      'More than 20 boxes would be plotted. Too many boxes in one plot may be less informative to observe, and even may seriously slow your browser. However, you can still plot it by click if you insist.';
  }

  return {
    option: newBoxplotOption,
    EventsDict: {},
    msg: tmpMsg,
    errorMsg: '',
    warningMsg: warningMessage,
    plotReady: plotReady,
  };
};
