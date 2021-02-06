export default {
  title: {
    text: 'Histogram',
    left: 'center',
    top: 20,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.9)',
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
  grid: {
    left: '3%',
    right: '3%',
    bottom: '6%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      scale: true,
      nameGap: 40,
      nameLocation: 'middle',
      name: 'Distribution Value',
    },
  ],
  yAxis: [
    {
      type: 'value',
      scale: true,
      nameGap: 40,
      nameLocation: 'middle',
      name: 'Total Counts',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          // width: 0.5,
          color: '#cfd8dc',
        },
      },
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
      name: 'Total Counts',
      type: 'bar',
      barWidth: '80%',
      data: [],
      itemStyle: {
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10,
      },
    },
  ],
};
