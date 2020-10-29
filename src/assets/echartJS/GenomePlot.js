export default {
  title: {
    text: 'Scatter Plot between X and Y',
    subtext: '',
  },
  grid: {
    left: '3%',
    right: '3%',
    bottom: '3%',
    containLabel: true,
  },
  tooltip: {
    trigger: 'item',
    showDelay: 0,
    axisPointer: {
      show: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        width: 1,
      },
    },
  },
  // color: ['#2E84CF'],
  xAxis: [
    {
      name: '',
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        show: false,
      },
    },
  ],
  yAxis: [
    {
      name: 'chr12',
      show: false,
      max: 3,
    },
  ],
  dataZoom: [
    {
      type: 'inside',
      show: true,
      xAxisIndex: [0],
    },
  ],
  series: [
    {
      name: 'points',
      type: 'scatter',
      data: [],
      symbolSize: null,
    },
    {
      name: 'points',
      type: 'scatter',
      data: [],
      symbolSize: null,
    },
  ],
};
