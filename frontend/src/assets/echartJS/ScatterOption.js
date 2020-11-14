export default {
  title: {
    text: 'Scatter Plot between X and Y',
    subtext: '',
  },
  grid: {
    left: '3%',
    right: '15%',
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
  toolbox: {
    feature: {
      dataZoom: {
        title: {
          zoom: 'Zoom In',
          back: 'Zoom Reset',
        },
      },
      brush: {
        type: ['rect', 'polygon', 'clear'],
        title: {
          rect: 'Rectangle Area',
          polygon: 'Random Shape',
          clear: 'Area Reset',
        },
      },
      saveAsImage: {
        title: 'Save As Image',
      },
    },
  },
  brush: {},
  color: ['#2E84CF'],
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
          borderType: 'dashed',
        },
      },
    },
  ],
};
