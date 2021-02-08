import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Chip, Avatar, Grid, Tooltip } from '@material-ui/core';
import ReactEcharts from 'echarts-for-react';

import GenomePlotOption from '../../assets/echartJS/GenomePlot';

const GenomePlot = (props) => {
  const [opt, setOpt] = React.useState(GenomePlotOption);

  useEffect(() => {
    if (props.data) {
      handleAddDots(0, 10);
    }
  }, [props.data]);

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
        color: (param) => {
          switch (param.data[3]) {
            case '5_prime_UTR_variant':
              return 'rgba(23, 126, 137, 0.5)';
            case '3_prime_UTR_variant':
              return 'rgba(8, 76, 97, 0.5)';
            case 'missense_variant':
              return 'rgba(114, 67, 75, 0.5)';
            case 'frameshift_variant':
              return 'rgba(219, 58, 52, 0.5)';
            case 'synonymous_variant':
              return 'rgba(237, 129, 70, 0.5)';
            case 'intron_variant':
              return 'rgba(15, 128, 170, 0.5)';
            case 'stop_gained':
              return 'rgba(153, 124, 68, 0.5)';
            case 'splice_region_variant':
              return 'rgba(50, 48, 49, 0.5)';
            case 'splice_acceptor_variant':
              return 'rgba(48, 132, 89, 0.5)';
            case 'inframe_deletion':
              return 'rgba(45, 216, 129, 0.5)';
            default:
              return 'rgba(0, 0, 0, 0.5)';
          }
        },
      },
    };

    newScatterOption.series[1].name = 'Table Showing';
    newScatterOption.series[1].data = tmpSubset;
    newScatterOption.series[1].symbolSize = function (dataItem) {
      return dataItem[2];
    };

    newScatterOption.series[1].itemStyle = {
      normal: {
        color: (param) => {
          switch (param.data[3]) {
            case '5_prime_UTR_variant':
              return 'rgba(23, 126, 137, 0.2)';
            case '3_prime_UTR_variant':
              return 'rgba(8, 76, 97, 0.2)';
            case 'missense_variant':
              return 'rgba(114, 67, 75, 0.2)';
            case 'frameshift_variant':
              return 'rgba(219, 58, 52, 0.2)';
            case 'synonymous_variant':
              return 'rgba(237, 129, 70, 0.2)';
            case 'intron_variant':
              return 'rgba(15, 128, 170, 0.2)';
            case 'stop_gained':
              return 'rgba(153, 124, 68, 0.2)';
            case 'splice_region_variant':
              return 'rgba(50, 48, 49, 0.2)';
            case 'splice_acceptor_variant':
              return 'rgba(48, 132, 89, 0.2)';
            case 'inframe_deletion':
              return 'rgba(45, 216, 129, 0.2)';
            default:
              return 'rgba(0, 0, 0, 0.2)';
          }
        },
      },
    };

    newScatterOption.title.text = props.name;

    setOpt(newScatterOption);
  };

  return (
    <Card elevation={0}>
      <CardContent style={{ marginBottom: 0, paddingBottom: 0 }}>
        <ReactEcharts
          option={opt}
          notMerge={true}
          lazyUpdate={true}
          // onEvents={this.state.EventsDict}
          style={{ height: '200px', width: '85vw' }}
        />
      </CardContent>
    </Card>
  );
};

export default GenomePlot;
