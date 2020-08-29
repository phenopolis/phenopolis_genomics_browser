import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSnack } from '../redux/actions/snacks';
import { getIndividualInformation } from '../redux/actions/individual';
import { CssBaseline, AppBar, Tabs, Tab, Container, Fab } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import Loading from '../components/General/Loading';
import Skeleton from '@material-ui/lab/Skeleton';
import TabPanel from '../components/Tab/Tabpanel';
import MetaData from '../components/MetaData';
import VirtualGrid from '../components/Table/VirtualGrid';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import EditPerson from '../components/Individual/EditPerson';
import i18next from 'i18next';

const Individual = (props) => {
  const [message, setMessage] = useState(i18next.t('Individual.message'));
  const [value, setValue] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  let { individualInfo, error, loading } = useSelector((state) => ({
    individualInfo: state.Individual.data[0],
    error: state.Individual.error,
    loading: state.Individual.loading,
  }));

  useEffect(() => {
    dispatch(getIndividualInformation(props.match.params.individualId));
  }, [location]);

  useEffect(() => {
    if (error === 401) {
      history.push(`/login?link=${window.location.pathname}`);
    }
    if (error === 404) {
      history.push('/search');
      dispatch(setSnack('Patient not exist.', 'warning'));
    }
  }, [error]);

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

  const refreshPage = (patientName) => {
    setMessage(i18next.t('Individual.edit_message'));
    dispatch(getIndividualInformation(patientName));
  };

  const openDialog = () => {
    setEditOpen(!editOpen);
  };

  return (
    <>
      <React.Fragment>
        <CssBaseline />
        <div className="individual-container">
          <Container maxWidth="xl">
            {individualInfo && !loading ? (
              <Fab
                className="individual-fab"
                size="middle"
                color="primary"
                aria-label="add"
                onClick={() => openDialog()}>
                <EditIcon />
              </Fab>
            ) : (
              <Skeleton
                animation={'wave'}
                variant={'circle'}
                height={50}
                width={50}
                style={{ top: 125 }}
                className="individual-fab"
              />
            )}
          </Container>
          {individualInfo && !loading ? (
            <MetaData metadata={individualInfo.metadata} name={props.match.params.individualId} />
          ) : (
            <Skeleton height={145} />
          )}
          {individualInfo && !loading ? (
            <Container maxWidth="xl">
              <AppBar
                className="individual-tab_appbar"
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
                  classes={{ indicator: 'individual-bigIndicator' }}>
                  {[
                    i18next.t('Individual.RARE_HOMS'),
                    i18next.t('Individual.RARE_COMP_HETS'),
                    i18next.t('Individual.RARE_VARIANTS'),
                  ].map((item, index) => {
                    return <Tab label={item} {...a11yProps(index)} key={index} />;
                  })}
                </Tabs>
              </AppBar>
            </Container>
          ) : (
            <Skeleton height={200} />
          )}
          {individualInfo && !loading ? (
            <>
              <SwipeableViews index={value} onChangeIndex={handleChangeIndex}>
                <TabPanel value={value} index={0} className="individual-tabPannel">
                  <VirtualGrid
                    tableData={individualInfo.rare_homs}
                    title={i18next.t('Individual.Rare_HOMs')}
                    subtitle={i18next.t('Individual.Rare_HOMs_subtitle')}
                    configureLink="individual/rare_homs"
                  />
                </TabPanel>
                <TabPanel value={value} index={1} className="individual-tabPannel">
                  <VirtualGrid
                    tableData={individualInfo.rare_comp_hets}
                    title={i18next.t('Individual.Rare_Comp_Hets')}
                    subtitle={i18next.t('Individual.Rare_Comp_Hets_subtitle')}
                    configureLink="individual/rare_comp_hets"
                  />
                </TabPanel>
                <TabPanel value={value} index={2} className="individual-tabPannel">
                  <VirtualGrid
                    tableData={individualInfo.rare_variants}
                    title={i18next.t('Individual.Rare_Variants')}
                    subtitle={i18next.t('Individual.Rare_Variants_subtitle')}
                    configureLink="individual/rare_variants"
                  />
                </TabPanel>
              </SwipeableViews>
              <Dialog
                fullWidth={true}
                maxWidth={'md'}
                open={editOpen}
                onClose={() => openDialog()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <EditPerson
                  patientName={props.match.params.individualId}
                  metadata={individualInfo.metadata}
                  dialogClose={() => openDialog()}
                  refreshData={refreshPage}
                />
              </Dialog>
            </>
          ) : (
            <Skeleton height={550} />
          )}
        </div>
      </React.Fragment>
    </>
  );
};
export default Individual;
