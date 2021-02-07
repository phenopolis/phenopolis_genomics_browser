export default {
  title: {
    text: 'StackBarplot Plot between X and Y',
    left: 'center',
    top: 20,
  },
  grid: {
    left: '6%',
    right: '3%',
    bottom: '13%',
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
    // formatter: 'Data Value (x-axis): {b} <br/> {a} (y-axis): {c0} -  {c1} - {c2}',
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
  legend: {
    data: [],
    type: 'scroll',
    x: 'center',
    y: 'bottom',
  },
  xAxis: {
    type: 'category',
    data: [],
    name: '',
    nameGap: 40,
    nameLocation: 'middle',
  },
  yAxis: {
    type: 'value',
    name: '',
    nameGap: 40,
    nameLocation: 'middle',
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        // width: 0.5,
        color: '#cfd8dc',
      },
    },
  },
  series: [],
};
