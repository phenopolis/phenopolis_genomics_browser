import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, AppBar, Tabs, Tab, Container, Box, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useTranslation, Trans } from 'react-i18next';
import SwipeableViews from 'react-swipeable-views';
import TabPanel from '../components/Tab/Tabpanel';
import { getHPO } from '../redux/actions/hpo';

import MetaData from '../components/MetaData';

const VersatileTable = React.lazy(() => import('../components/BaseTable/VersatileTable'));

const HPO = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const [value, setValue] = useState(0);
  const [phenogenonvalue, setPhenogenonvalue] = useState(0);

  const { hpoInfo, loaded } = useSelector((state) => ({
    hpoInfo: state.HPO.data[0],
    loaded: state.HPO.loaded,
  }));

  useEffect(() => {
    dispatch(getHPO(props.match.params.hpoId));
  }, [location]);

  useEffect(() => {
    dispatch(getHPO(props.match.params.hpoId));
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const handleChangePhenogenon = (event, newValue) => {
    setPhenogenonvalue(newValue);
  };

  const handleChangePhenogenonIndex = (index) => {
    setPhenogenonvalue(index);
  };

  const a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <div className="hpo-container">
        {loaded ? (
          <MetaData
            metadata={hpoInfo.metadata}
            name={hpoInfo.metadata.data[0].name + ' - ' + hpoInfo.metadata.data[0].id}
          />
        ) : (
          <Skeleton height={145} />
        )}

        {loaded ? (
          <Container maxWidth="xl">
            <AppBar
              className="hpo-tab_appbar"
              position="static"
              color="transparent"
              elevation={0}
              m={0}
              p={0}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="full width tabs example"
                classes={{ indicator: 'hpo-bigIndicator' }}>
                {[
                  t('HPO.INDIVIDUALS'),
                  t('HPO.LITERATURE_GENES'),
                  t('HPO.PHENOGENON'),
                  t('HPO.SKAT'),
                ].map((item, index) => {
                  return <Tab key={index} label={item} {...a11yProps(index)} />;
                })}
              </Tabs>
            </AppBar>
          </Container>
        ) : (
          <Skeleton height={200} />
        )}

        {loaded ? (
          <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
            <TabPanel value={value} index={0} className="hpo-tabPannel">
              <VersatileTable
                tableData={hpoInfo.individuals}
                title={t('HPO.Individuals')}
                subtitle={t('HPO.Individuals_subtitle')}
                genomePlot={false}
              />
            </TabPanel>
            <TabPanel value={value} index={1} className="hpo-tabPannel">
              <VersatileTable
                tableData={hpoInfo.literature_genes}
                title={t('HPO.Literature_Genes')}
                subtitle={t('HPO.Literature_Genes_subtitle')}
                genomePlot={false}
              />
            </TabPanel>

            {/* Phenogenon tab is more complex. */}
            <TabPanel value={value} index={2} className="hpo-tabPannel">
              <Typography component="div">
                <Box fontWeight="900" fontSize="h4.fontSize" mb={0}>
                  {t('HPO.Phenogenon')}
                </Box>
                <Box fontWeight="fontWeightLight" mb={2}>
                  {t('HPO.Phenogenon_subtitle')}
                </Box>
              </Typography>

              <AppBar position="static" color="transparent" elevation={0} m={0} p={0}>
                <Tabs
                  value={phenogenonvalue}
                  onChange={handleChangePhenogenon}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                  classes={{ indicator: 'hpo-bigIndicator' }}>
                  {[t('HPO.RECESSIVE'), t('HPO.DOMINANT')].map((item, index) => {
                    return <Tab key={index} label={item} {...a11yProps(index)} />;
                  })}
                </Tabs>
              </AppBar>
              <SwipeableViews index={phenogenonvalue} onChangeIndex={handleChangePhenogenonIndex}>
                <TabPanel className="hpo-tabPannel" value={phenogenonvalue} index={0}>
                  <VersatileTable
                    tableData={hpoInfo.phenogenon_recessive}
                    title={t('Recessive')}
                    subtitle={[
                      <Trans i18nKey="HPO.RECESSIVE_subtitle">
                        <b>Genotype</b> : With at least two variants on a given gene that have ExAC
                        homozygous count not higher than <b style={{ color: '#2E84CF' }}>2</b>, and
                        CADD phred score not lower than <b style={{ color: '#2E84CF' }}>15</b>.
                      </Trans>,
                    ]}
                    genomePlot={false}
                  />
                </TabPanel>
                <TabPanel className="hpo-tabPannel" value={phenogenonvalue} index={1}>
                  <VersatileTable
                    tableData={hpoInfo.phenogenon_dominant}
                    title={t('Dominant')}
                    subtitle={[
                      <Trans i18nKey="HPO.DOMINANT_subtitle">
                        <b>Genotype</b> : With at least one variant on a given gene that has an ExAC
                        heterozygous count not higher than ",{' '}
                        <b style={{ color: '#2E84CF' }}>0.0001</b>, ", and CADD phred score not
                        lower than ", <b style={{ color: '#2E84CF' }}>15</b>, "."
                      </Trans>,
                    ]}
                    genomePlot={false}
                  />
                </TabPanel>
              </SwipeableViews>
            </TabPanel>

            <TabPanel value={value} index={3} className="hpo-tabPannel">
              <VersatileTable
                tableData={hpoInfo.skat}
                title={t('HPO.SKAT')}
                subtitle={t('HPO.SKAT_subtitle')}
                genomePlot={false}
              />
            </TabPanel>
          </SwipeableViews>
        ) : (
          <>
            <div className="mt-4 mb-4" />
            <Skeleton variant="rect" height={150} />
            <div className="mt-4 mb-4" />
            <Skeleton variant="rect" height={450} />
          </>
        )}
      </div>
    </React.Fragment>
  );
};

export default HPO;
