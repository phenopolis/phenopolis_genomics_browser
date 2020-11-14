export default {
  title: {
    text: 'Barplot',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
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
  xAxis: {
    type: 'category',
    data: [],
  },
  yAxis: {
    type: 'value',
  },
  color: ['#2E84CF'],
  series: [
    {
      data: [],
      type: 'bar',
    },
  ],
};
