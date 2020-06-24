export default {
  title: {
    text: 'Histogram',
    left: 'center',
    top: 20,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  color: ['#2E84CF'],
  grid: {
    left: '3%',
    right: '3%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      scale: true,
    },
  ],
  yAxis: [
    {
      type: 'value',
      scale: true,
    },
  ],
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
  series: [
    {
      name: 'Number',
      type: 'bar',
      barWidth: '99.3%',
      label: {
        normal: {
          show: true,
          position: 'insideTop',
          formatter: function (params) {
            return params.value[1];
          },
        },
      },
      data: [],
    },
  ],
};
