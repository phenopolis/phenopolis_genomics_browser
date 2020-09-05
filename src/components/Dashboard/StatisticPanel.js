import React, { Fragment, useEffect } from 'react';

import { Grid, Card, Button, CardMedia } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDna,
  faChartNetwork,
  faUser,
  faCut,
  faArrowRight,
} from '@fortawesome/pro-solid-svg-icons';
import CountUp from 'react-countup';

import { useDispatch, useSelector } from 'react-redux';
import { getStatistics } from '../../redux/actions/statistic';
import { setSnack } from '../../redux/actions/snacks';
const StatisticPanel = (props) => {
  const dispatch = useDispatch();
  const { error, variants } = useSelector((state) => ({
    variants: state.Statistics.data.total_variants,
    error: state.Statistics.error,
  }));
  useEffect(() => {
    dispatch(getStatistics());

    if (error) {
      dispatch(setSnack(error, 'error'));
    }
  }, [dispatch, error]);

  const ItemTypes = [
    {
      backgroundColor: '#e07a5f',
      icon: faDna,
      name: 'Gene',
      des: 'Checking genes page to see contains variants, related patents, and involved phenotype.',
      count: 1000,
    },
    {
      backgroundColor: '#81b29a',
      icon: faChartNetwork,
      name: 'Phenotype',
      des:
        'Check HPO for phenotypic abnormalities in human disease, and their related genes, involved patients.',
      count: 1000,
    },
    {
      backgroundColor: '#f2cc8f',
      icon: faUser,
      name: 'Patient',
      des: 'Check Patients for homozygotes information, and their related variants.',
      count: 1000,
    },
    {
      backgroundColor: '#3d405b',
      icon: faCut,
      name: 'Variant',
      des: 'Check Variant Page for frequency, genotype, and related patients.',
      count: variants ? parseFloat(variants.replace(/,/g, '')) : 0,
    },
  ];

  return (
    <Fragment>
      <Card elevation={1} className="mb-5">
        <CardMedia style={{ padding: '0.3em 2em 0.3em 2em', borderBottom: '1px solid #eeeeee' }}>
          <div className="text-black">
            <h2 className="display-4" style={{ fontWeight: '900' }}>
              Statistic Panel
            </h2>
            <p className="font-size-md text-black-50"> Number of item you have access </p>
          </div>
        </CardMedia>

        <div className="bg-secondary card-footer">
          <Grid container spacing={4} style={{ padding: '2em' }}>
            {ItemTypes.map((item, index) => {
              return (
                <Grid item xs={12} lg={6} xl={3} key={index}>
                  <Card elevation={8} className="card-box p-4 mb-4" style={{ height: '250px' }}>
                    <div className="d-flex justify-content-between">
                      <div className="pr-4">
                        <div className="d-flex align-items-center">
                          <div
                            className="text-center text-white font-size-xl d-50 rounded-circle mb-4 mt-1"
                            style={{ backgroundColor: item.backgroundColor }}>
                            <FontAwesomeIcon icon={item.icon} />
                          </div>
                          <div
                            className="text-center mb-4 mt-1 ml-3 font-size-xl font-weight-bold"
                            style={{ color: item.backgroundColor }}>
                            {item.name}
                          </div>
                        </div>
                        <div className="font-size-sm  text-black-50 mb-2">{item.des}</div>
                        <Button color="primary" className="text-first">
                          <span
                            className="btn-wrapper--label"
                            style={{ color: item.backgroundColor }}>
                            <small className="font-weight-bold">View details</small>
                          </span>
                          <span className="btn-wrapper--icon">
                            <small>
                              <FontAwesomeIcon
                                icon={faArrowRight}
                                style={{ color: item.backgroundColor }}
                              />
                            </small>
                          </span>
                        </Button>
                      </div>
                      <div className="align-items-center" style={{ color: item.backgroundColor }}>
                        <div className="font-weight-bold display-3 text-center mt-1">
                          <CountUp
                            start={0}
                            end={item.count}
                            duration={2}
                            separator=","
                            decimals={0}
                            decimal=","
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </Card>
    </Fragment>
  );
};

export default StatisticPanel;
