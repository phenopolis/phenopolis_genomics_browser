export default {
  "title": [
    {
      "text": "Boxplot",
      "left": "center"
    }
  ],
  "tooltip": {
    "trigger": "item",
    "axisPointer": {
      "type": "shadow"
    }
  },
  "color": [
    "#2E84CF"
  ],
  "grid": {
    "left": "10%",
    "right": "10%",
    "bottom": "15%"
  },
  "xAxis": {
    "type": "category",
    "data": [],
    "boundaryGap": true,
    "nameGap": 30,
    "splitArea": {
      "show": false
    },
    "axisLabel": {
      "formatter": "{value}"
    },
    "splitLine": {
      "show": false
    }
  },
  "yAxis": {
    "type": "value",
    "name": "",
    "splitArea": {
      "show": false
    },
    "splitLine": {
      "show": false
    }
  },
  "series": [
    {
      "name": "boxplot",
      "type": "boxplot",
      "data": [],
      "tooltip": {
        "formatter": function (param) {
          return [
            'Stats: ' + param.name + ': ',
            'upper: ' + param.data[5],
            'Q3: ' + param.data[4],
            'median: ' + param.data[3],
            'Q1: ' + param.data[2],
            'lower: ' + param.data[1]
          ].join('<br/>');
        }
      }
    },
    {
      "name": "outlier",
      "type": "scatter",
      "data": []
    }
  ]
}