import React, { useEffect, useState } from 'react';
import { Grid, Box, Typography, Paper } from '@material-ui/core';
import {
  faTachometerAlt,
  faChartBar,
  faProjectDiagram,
  faUsers,
  faEnvelopeOpen,
} from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from '@material-ui/lab/Skeleton';
import { useTranslation, Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getStatistics } from '../../redux/actions/statistic';
import { setSnack } from '../../redux/actions/snacks';

const HomeMainPart = () => {
  const { t, ready } = useTranslation();
  const exomes = '8,000';
  const variants = '8,000,000';

  useEffect(() => {
    console.log(ready);
  }, [ready]);

  // const dispatch = useDispatch();
  // const { error, loading, exomes, variants } = useSelector((state) => ({
  //   variants: state.Statistics.data.total_variants,
  //   exomes: state.Statistics.data.exomes,
  //   loading: state.Statistics.loading,
  //   error: state.Statistics.error,
  // }));
  // useEffect(() => {
  //   dispatch(getStatistics());

  //   if (error) {
  //     dispatch(setSnack(error, 'error'));
  //   }
  // }, [dispatch, error]);
  if (ready === true) {
    return (
      <div>
        <Grid container className={'home-root'}>
          <Grid container justify="center">
            <Grid item xs={12} md={3} className={'home-gridpaper'}>
              <Paper elevation={0} className={'home-paper'}>
                <FontAwesomeIcon
                  icon={faTachometerAlt}
                  color="#2E84CF"
                  className={'home-fontawesomeicon'}
                />
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                    {t('HomePage.HomeMainPart.tab1.title')}
                  </Box>
                  <Box fontWeight="fontWeightLight" m={1}>
                    {t('HomePage.HomeMainPart.tab1.description')}
                  </Box>
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3} className={'home-gridpaper'}>
              <Paper elevation={0} className={'home-paper'}>
                <FontAwesomeIcon
                  icon={faChartBar}
                  color="#2E84CF"
                  className={'home-fontawesomeicon'}
                />
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                    {t('HomePage.HomeMainPart.tab2.title')}
                  </Box>
                  <Box fontWeight="fontWeightLight" m={1}>
                    {t('HomePage.HomeMainPart.tab2.description')}
                  </Box>
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3} className={'home-gridpaper'}>
              <Paper elevation={0} className={'home-paper'}>
                <FontAwesomeIcon
                  icon={faProjectDiagram}
                  color="#2E84CF"
                  className={'home-fontawesomeicon'}
                />
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h5.fontSize" m={1}>
                    {t('HomePage.HomeMainPart.tab3.title')}
                  </Box>
                  <Box fontWeight="fontWeightLight" m={1}>
                    {t('HomePage.HomeMainPart.tab3.description')}
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={'home-root2'}>
          <Grid container justify="center">
            <Grid item xs={12} md={8} className={'home-gridpaper2'}>
              <Paper elevation={0} className={'home-paper2'}>
                <FontAwesomeIcon
                  icon={faUsers}
                  color="#2E84CF"
                  className={'home-fontawesomeicon'}
                />
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h4.fontSize" m={1}>
                    {t('HomePage.HomeMainPart.statistic.title')}
                  </Box>
                  <Box fontWeight="fontWeightLight" fontSize="h6.fontSize" m={1}>
                    <Trans i18nKey="HomePage.HomeMainPart.statistic.description">
                      Phenopolis includes data from {{ exomes }} exomes representing a total number
                      of {{ variants }} variants.
                    </Trans>
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className={'home-root'}>
          <Grid container justify="center">
            <Grid item xs={12} md={8} className={'home-gridpaper'}>
              <Paper elevation={0} className={'home-paper'}>
                <FontAwesomeIcon
                  icon={faEnvelopeOpen}
                  color="#2E84CF"
                  className={'home-fontawesomeicon'}
                />
                <Typography component="div">
                  <Box fontWeight="900" fontSize="h4.fontSize" m={1}>
                    {t('HomePage.HomeMainPart.contact.title')}
                  </Box>
                  <Box fontWeight="fontWeightLight" fontSize="h6.fontSize" m={1}>
                    <Trans i18nKey="HomePage.HomeMainPart.contact.description">
                      Please feel free to contact us{' '}
                      <a href="mailto:info@phenopolis.org" className={'home-link'}>
                        here
                      </a>{' '}
                      to give us feedback or report any issues.
                    </Trans>
                  </Box>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h1> Loading Translation </h1>
      </div>
    );
  }
};

export default HomeMainPart;
