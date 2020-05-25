export default {
  "title": {
    "text": "Scatter Plot between X and Y",
    "subtext": ""
  },
  "grid": {
    "left": "3%",
    "right": "15%",
    "bottom": "3%",
    "containLabel": true
  },
  "tooltip": {
    "trigger": "axis",
    "showDelay": 0,
    "axisPointer": {
      "show": true,
      "type": "cross",
      "lineStyle": {
        "type": "dashed",
        "width": 1
      }
    }
  },
  "toolbox": {
    "feature": {
      "dataZoom": {},
      "brush": {
        "type": [
          "rect",
          "polygon",
          "clear"
        ]
      }
    }
  },
  "brush": {},
  "legend": {
    "data": [
      "points"
    ],
    "type": "scroll",
    "orient": "vertical",
    "x": "right",
    "y": "center",
    "show": false
  },
  "color": [
    "#2E84CF"
  ],
  "xAxis": [
    {
      "type": "value",
      "scale": true,
      "axisLabel": {
        "formatter": "{value}"
      },
      "splitLine": {
        "show": false
      }
    }
  ],
  "yAxis": [
    {
      "type": "value",
      "scale": true,
      "axisLabel": {
        "formatter": "{value}"
      },
      "splitLine": {
        "show": false
      }
    }
  ],
  "series": [
    {
      "name": "points",
      "type": "scatter",
      "data": [],
      "markArea": {
        "silent": true,
        "itemStyle": {
          "color": "transparent",
          "borderWidth": 1,
          "borderType": "dashed"
        },
        "data": [
          [
            {
              "name": "",
              "xAxis": "min",
              "yAxis": "min"
            },
            {
              "xAxis": "max",
              "yAxis": "max"
            }
          ]
        ]
      },
      "markPoint": {
        "data": [
          {
            "type": "max",
            "name": "Max"
          },
          {
            "type": "min",
            "name": "Min"
          }
        ]
      }
    }
  ]
}