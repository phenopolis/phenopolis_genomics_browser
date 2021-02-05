export default {
  title: {
    text: 'Barplot',
    left: 'center',
    top: 20,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    trigger: 'item',
    axisPointer: {
      animation: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        width: 1,
      },
    },
    formatter: 'Data Value (x-axis): {b} <br/> {a} (y-axis): {c0} -  {c1} - {c2}',
  },
  color: ['#30475e'],
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
    nameGap: 40,
    nameLocation: 'middle',
    name: 'Distribution Value',
  },
  yAxis: {
    type: 'value',
    nameGap: 40,
    nameLocation: 'middle',
    name: 'Total Counts',
  },
  series: [
    {
      name: 'Total Counts',
      barWidth: '80%',
      data: [],
      type: 'bar',
    },
  ],
};
