import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CssBaseline, AppBar, Tabs, Tab, Container } from '@material-ui/core';
import Loading from '../components/General/Loading';
import { setSnack } from '../redux/actions/snacks';
import { useTranslation } from 'react-i18next';
import SwipeableViews from 'react-swipeable-views';
import TabPanel from '../components/Tab/Tabpanel';
import { getVariant } from '../redux/actions/variant';

import MetaData from '../components/MetaData';
import VirtualGrid from '../components/Table/VirtualGrid';

const Variant = (props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const [value, setValue] = useState(0);
  const [valid, setValid] = useState(false);
  const { loading, error, variantInfo } = useSelector((state) => ({
    variantInfo: state.Variant.data[0],
    error: state.Variant.error,
    loading: state.Variant.loading,
  }));

  useEffect(() => {
    setValid(false);
    dispatch(getVariant(props.match.params.variantId));
  }, [location]);

  useEffect(() => {
    dispatch(getVariant(props.match.params.variantId));
  }, []);

  useEffect(() => {
    if (error === 401) {
      history.push(`/login?link=${window.location.pathname}`);
    }
  }, [error]);

  useEffect(() => {
    if ((loading === false) & (variantInfo === undefined)) {
      history.push('/search');
      dispatch(setSnack('Variant not exist.', 'warning'));
    } else if ((loading === false) & (variantInfo !== undefined)) {
      if (Object.keys(variantInfo.metadata.data[0]).length === 0) {
        history.push('/search');
        dispatch(setSnack('Variant not exist.', 'warning'));
      } else {
        setValid(true);
      }
    }
  }, [variantInfo, loading]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  };

  return (
    <>
      {valid ? (
        <React.Fragment>
          <CssBaseline />
          <div className="variant-container">
            <MetaData
              metadata={variantInfo.metadata}
              name={variantInfo.metadata.data[0].variant_id[0].display}
            />

            <Container maxWidth="xl">
              <AppBar
                className="variant-tab_appbar"
                position="static"
                color="transparent"
                elevation="0"
                m={0}
                p={0}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                  classes={{ indicator: 'variant-bigIndicator' }}>
                  {[
                    t('Variant.FREQUENCY'),
                    t('Variant.CONSEQUENCES'),
                    t('Variant.QUALITY'),
                    t('Variant.INDIVIDUALS'),
                    t('Variant.GENOTYPES'),
                  ].map((item, index) => {
                    return <Tab label={item} {...a11yProps(index)} />;
                  })}
                </Tabs>
              </AppBar>
            </Container>
            <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
              <TabPanel value={value} index={0} className="variant-tabPannel">
                <VirtualGrid
                  tableData={variantInfo.frequency}
                  title={t('Variant.Frequency')}
                  subtitle={t('Variant.Frequency_subtitle')}
                  configureLink="variant/frequency"
                />
              </TabPanel>
              <TabPanel value={value} index={1} className="variant-tabPannel">
                <VirtualGrid
                  tableData={variantInfo.consequence}
                  title={t('Variant.Consequences')}
                  subtitle={t('Variant.Consequences_subtitle')}
                  configureLink="variant/consequence"
                />
              </TabPanel>
              <TabPanel value={value} index={2} className="variant-tabPannel">
                <VirtualGrid
                  tableData={variantInfo.quality}
                  title={t('Variant.Quality')}
                  subtitle={t('Variant.Quality_subtitle')}
                  configureLink="variant/quality"
                />
              </TabPanel>
              <TabPanel value={value} index={3} className="variant-tabPannel">
                <VirtualGrid
                  tableData={variantInfo.individuals}
                  title={t('Variant.Individuals')}
                  subtitle={t('Variant.Individuals_subtitle')}
                  configureLink="variant/individuals"
                />
              </TabPanel>
              <TabPanel value={value} index={4} className="variant-tabPannel">
                <VirtualGrid
                  tableData={variantInfo.genotypes}
                  title={t('Variant.Genotypes')}
                  subtitle={t('Variant.Genotypes_subtitle')}
                  configureLink="variant/genotypes"
                />
              </TabPanel>
            </SwipeableViews>
          </div>
        </React.Fragment>
      ) : (
        <Loading message={t('Variant.message')} />
      )}
    </>
  );
};

export default Variant;
