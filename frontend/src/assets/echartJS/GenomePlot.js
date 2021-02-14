export default {
  grid: {
    left: '3%',
    right: '3%',
    bottom: '10%',
    containLabel: true,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    trigger: 'item',
    showDelay: 0,
    axisPointer: {
      show: false,
    },
  },
  // color: ['#2E84CF'],
  xAxis: [
    {
      name: 'chr12',
      nameGap: 30,
      nameLocation: 'middle',
      type: 'value',
      scale: true,
      splitLine: {
        show: false,
      },
    },
  ],
  yAxis: [
    {
      name: '',
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
      // symbol: 'ellipse',
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
