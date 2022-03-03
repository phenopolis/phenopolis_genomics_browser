import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSnack } from '../redux/actions/snacks';
import { getIndividualInformation } from '../redux/actions/individual';
import { CssBaseline, AppBar, Tabs, Tab, Container, Fab } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import Skeleton from '@material-ui/lab/Skeleton';
import TabPanel from '../components/Tab/Tabpanel';
import MetaData from '../components/MetaData';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import EditPerson from '../components/Individual/EditPerson';
import i18next from 'i18next';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faFileAlt, faTrashAlt } from '@fortawesome/pro-solid-svg-icons';

import { HashLink } from 'react-router-hash-link';

const VersatileTable = React.lazy(() => import('../components/BaseTable/VersatileTable'));

const Individual = (props) => {
  const [value, setValue] = useState(0);

  const editButtons = [
    { title: 'info', icon: faPen },
    { title: 'file', icon: faFileAlt },
    { title: 'delete', icon: faTrashAlt },
  ];

  const dispatch = useDispatch();
  const location = useLocation();

  let { individualInfo, loaded, error } = useSelector((state) => ({
    individualInfo: state.Individual.data[0],
    loaded: state.Individual.loaded,
    error: state.Individual.error,
  }));

  useEffect(() => {
    dispatch(getIndividualInformation(props.match.params.individualId + '?limit=50&offset=50'));
  }, [location]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <>
      <React.Fragment>
        <CssBaseline />
        <div className="individual-container">
          <Container maxWidth="xl">
            {loaded ? (
              <span className="individual-fab">
                {editButtons.map((item, index) => {
                  return (
                    <Fab
                      className="mr-2"
                      size="large"
                      color="primary"
                      aria-label="add"
                      // onClick={() => openDialog()}
                      component={HashLink}
                      to={'/editpatient/' + props.match.params.individualId + '#' + item.title}>
                      <FontAwesomeIcon icon={item.icon} style={{ fontSize: '20px' }} />
                    </Fab>
                  );
                })}
              </span>
            ) : (
              <>
                <Skeleton
                  animation={'wave'}
                  variant={'circle'}
                  height={50}
                  width={50}
                  style={{ top: 125 }}
                  className="individual-fab"
                />
                <Skeleton
                  animation={'wave'}
                  variant={'circle'}
                  height={50}
                  width={50}
                  style={{ top: 125, right: 180 }}
                  className="individual-fab"
                />
                <Skeleton
                  animation={'wave'}
                  variant={'circle'}
                  height={50}
                  width={50}
                  style={{ top: 125, right: 240 }}
                  className="individual-fab"
                />
              </>
            )}
          </Container>
          {loaded ? (
            <MetaData metadata={individualInfo.metadata} name={props.match.params.individualId} />
          ) : (
            <Skeleton height={145} />
          )}
          {loaded ? (
            <Container maxWidth="xl">
              <AppBar
                className="individual-tab_appbar"
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
                  classes={{ indicator: 'individual-bigIndicator' }}>
                  {[
                    i18next.t('Individual.RARE_HOMS'),
                    i18next.t('Individual.RARE_COMP_HETS'),
                    i18next.t('Individual.RARE_VARIANTS'),
                  ].map((item, index) => {
                    return <Tab key={index} label={item} {...a11yProps(index)} key={index} />;
                  })}
                </Tabs>
              </AppBar>
            </Container>
          ) : (
            <Skeleton height={200} />
          )}
          {loaded ? (
            <>
              <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
                <TabPanel value={value} index={0} className="individual-tabPannel">
                  <VersatileTable
                    tableData={individualInfo.rare_homs}
                    title={i18next.t('Individual.Rare_HOMs')}
                    subtitle={i18next.t('Individual.Rare_HOMs_subtitle')}
                    genomePlot={false}
                  />
                </TabPanel>
                <TabPanel value={value} index={1} className="individual-tabPannel">
                  <VersatileTable
                    tableData={individualInfo.rare_comp_hets}
                    title={i18next.t('Individual.Rare_Comp_Hets')}
                    subtitle={i18next.t('Individual.Rare_Comp_Hets_subtitle')}
                    genomePlot={false}
                  />
                </TabPanel>
                <TabPanel value={value} index={2} className="individual-tabPannel">
                  <VersatileTable
                    tableData={individualInfo.rare_variants}
                    title={i18next.t('Individual.Rare_Variants')}
                    subtitle={i18next.t('Individual.Rare_Variants_subtitle')}
                    genomePlot={false}
                  />
                </TabPanel>
              </SwipeableViews>
            </>
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
    </>
  );
};
export default Individual;
