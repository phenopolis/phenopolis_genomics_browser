export default {
  title: {
    text: 'Scatter Plot between X and Y',
    left: 'center',
    top: 20,
  },
  grid: {
    left: '6%',
    right: '3%',
    bottom: '6%',
    containLabel: true,
  },
  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.9)',
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
    formatter: 'Data Value (x-axis): {b} <br/> {a} (y-axis): {c0} -  {c1} - {c2}',
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
  color: ['#30475e'],
  xAxis: [
    {
      name: '',
      nameGap: 40,
      nameLocation: 'middle',
      type: 'value',
      scale: true,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          // width: 2,
          color: '#cfd8dc',
        },
      },
    },
  ],
  yAxis: [
    {
      name: '',
      nameGap: 40,
      nameLocation: 'middle',
      type: 'value',
      scale: true,
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
  series: [
    {
      name: '',
      type: 'scatter',
      data: [],
      markArea: {
        silent: true,
        itemStyle: {
          borderWidth: 20,
        },
      },
    },
  ],
};
