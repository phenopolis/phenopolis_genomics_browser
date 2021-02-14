export default {
  title: {
    text: 'Boxplot',
    left: 'center',
    top: 20,
  },
  grid: {
    left: '10%',
    right: '3%',
    bottom: '6%',
    containLabel: true,
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
  color: ['#30475e'],
  xAxis: {
    type: 'category',
    data: [],
    boundaryGap: true,
    name: '',
    nameGap: 40,
    nameLocation: 'middle',
  },
  yAxis: {
    type: 'value',
    name: '',
    nameGap: 60,
    nameLocation: 'middle',
    splitLine: {
      show: true,
      lineStyle: {
        type: 'dashed',
        color: '#cfd8dc',
      },
    },
  },
  series: [
    {
      name: 'boxplot',
      type: 'boxplot',
      boxWidth: 40,
      itemStyle: {
        borderWidth: 1.5,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 5,
        color: '#dbe4ed',
      },
      data: [],
    },
    {
      name: 'outlier',
      type: 'scatter',
      data: [],
    },
  ],
};
