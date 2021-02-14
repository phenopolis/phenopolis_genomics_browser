import React, { useEffect, useState } from 'react';
import { Card, CardContent, Chip, Avatar, Grid, Tooltip } from '@material-ui/core';
import ReactEcharts from 'echarts-for-react';

import GenomePlotOption from '../../assets/echartJS/GenomePlot';

const GenomePlot = (props) => {
  const [opt, setOpt] = React.useState(GenomePlotOption);
  const [EventsDict, setEventsDict] = useState(null);

  useEffect(() => {
    handleAddDots(props.visibleRows[0], props.visibleRows[1]);
  }, [props.visibleRows]);

  const handleAddDots = (minRow, maxRow) => {
    let MaxValue = Math.log10(
      Math.max.apply(
        Math,
        props.data.map((x) => x.AF)
      )
    );
    let MinValue = Math.log10(
      Math.min.apply(
        Math,
        props.data.map((x) => x.AF)
      )
    );

    let Gap = MaxValue - MinValue;

    let tmpData = props.data.map((x) => {
      return [
        x.POS,
        2,
        10 + 30 * ((Math.log10(x.AF) - MinValue) / Gap),
        x.most_severe_consequence,
        x.variant_id[0].display,
      ];
    });

    let tmpSubset = tmpData.slice(minRow, maxRow).map((x) => {
      return [x[0], 1, x[2], x[3], x[4]];
    });

    var colorFun = (param) => {
      switch (param.data[3]) {
        case '5_prime_UTR_variant':
          return 'rgba(48, 71, 94, 0.1)';
        case '3_prime_UTR_variant':
          return 'rgba(48, 71, 94, 0.1)';
        case 'missense_variant':
          return 'rgba(242, 204, 143, 0.8)';
        case 'frameshift_variant':
          return 'rgba(224, 122, 95, 0.8)';
        case 'synonymous_variant':
          return 'rgba(129, 178, 154, 0.8)';
        case 'intron_variant':
          return 'rgba(48, 71, 94, 0.1)';
        case 'stop_gained':
          return 'rgba(224, 122, 95, 0.8)';
        case 'splice_region_variant':
          return 'rgba(224, 122, 95, 0.8)';
        case 'splice_acceptor_variant':
          return 'rgba(224, 122, 95, 0.8)';
        case 'inframe_deletion':
          return 'rgba(48, 71, 94, 0.1)';
        default:
          return 'rgba(48, 71, 94, 0.1)';
      }
    };

    const newScatterOption = JSON.parse(JSON.stringify(GenomePlotOption));

    newScatterOption.series[0].name = 'Variants';
    newScatterOption.series[0].data = tmpData;
    newScatterOption.series[0].symbolSize = function (dataItem) {
      return dataItem[2];
    };

    newScatterOption.tooltip.formatter = (param) => {
      return '<b>' + param.data[4] + '</b>' + '<br/>' + param.data[3] + '<br/>' + param.data[0];
    };

    newScatterOption.series[0].itemStyle = {
      normal: {
        color: colorFun,
      },
    };

    newScatterOption.series[1].name = 'Table Showing';
    newScatterOption.series[1].data = tmpSubset;
    newScatterOption.series[1].symbolSize = function (dataItem) {
      return dataItem[2];
    };

    newScatterOption.series[1].itemStyle = {
      normal: {
        color: colorFun,
      },
    };

    newScatterOption.tooltip.formatter = function (params) {
      return `Variant Type: <b>${params.value[3]}</b><br />
              Coordicate: <b>${params.value[0]}</b>`;
    };

    setEventsDict({ click: onScatterClick });
    setOpt(newScatterOption);
  };

  const onScatterClick = (param) => {
    props.ScrollToRow(param.dataIndex);
  };

  return (
    <Card elevation={0}>
      <CardContent style={{ marginBottom: 0, paddingBottom: 0 }}>
        <ReactEcharts
          option={opt}
          notMerge={true}
          lazyUpdate={true}
          onEvents={EventsDict}
          style={{ height: '250px', width: '85vw' }}
        />
      </CardContent>
    </Card>
  );
};

export default GenomePlot;
