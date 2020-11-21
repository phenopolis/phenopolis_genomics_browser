import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Grid,
  Hidden,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigationAction,
  Dialog,
  Drawer,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  CssBaseline,
  Tabs,
  Tab,
  Box,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TranslateIcon from '@material-ui/icons/Translate';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Footer from '../General/Footer';
import NoSidebar from './NoSidebar';
import LoginBox from './LoginBox';
import CreateUser from '../ManageUser/CreatUser';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';
import { useTranslation } from 'react-i18next';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index && <div>{children}</div>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const NoLoginBar = (props) => {
  const theme = useTheme();
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [openLan, setOpenLan] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [DialogTab, setDialogTab] = useState(0);

  const handleDialogTabChange = (event, newValue) => {
    setDialogTab(newValue);
  };

  const handleLanClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenLan(!openLan);
  };

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLan(!openLan);
  };

  return (
    <div>
      <CssBaseline />
      <AppBar position="relative" className={'noLoginBar-appbar'}>
        <Toolbar>
          <Grid container direction="row" justify="center" alignItems="center">
            <Hidden mdUp>
              <Grid item xs={2}>
                <IconButton size="small" onClick={() => setOpenSideBar(!openSideBar)}>
                  <MenuIcon className={'noLoginBar-menuicon'} />
                </IconButton>
              </Grid>
            </Hidden>
            <Grid item xs={10} md={1} className={'noLoginBar-grid'}>
              <Typography
                className={'noLoginBar-homelabel'}
                variant="h6"
                color="inherit"
                noWrap
                component={Link}
                to="/">
                Phenopolis
              </Typography>
            </Grid>
            <Hidden smDown>
              <Grid item xs={6} className={'noLoginBar-gridpaper'} />
            </Hidden>
            <Hidden smDown>
              <div>
                <BottomNavigationAction
                  className={'noLoginBar-navigationbutton'}
                  label={t('AppBar.NoLoginBar.Label_Publication')}
                  showLabel
                  icon={<DescriptionIcon />}
                  component={Link}
                  to="/publications"
                />
                <BottomNavigationAction
                  className={'noLoginBar-navigationbutton'}
                  label={t('AppBar.NoLoginBar.Label_Language')}
                  showLabel
                  icon={<TranslateIcon />}
                  onClick={(event) => handleLanClick(event)}
                />
                <BottomNavigationAction
                  className={'noLoginBar-navigationbutton'}
                  label={'Login/Register'}
                  showLabel
                  icon={<AccountCircleIcon />}
                  onClick={() => setOpenLoginDialog(!openLoginDialog)}
                />
              </div>
            </Hidden>
          </Grid>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(openLan)}
            style={{ top: '3em' }}
            onClose={() => setOpenLan(!openLan)}>
            <MenuItem onClick={() => changeLanguage('en')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={GB} alt="English" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="English" />
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('cn')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={CN} alt="中文" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="中文" />
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('ja')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={JP} alt="日本語" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="日本語" />
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('de')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={DE} alt="Deutsch" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="Deutsch" />
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('gr')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={GR} alt="Ελληνικά" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="Ελληνικά" />
            </MenuItem>
            <MenuItem onClick={() => changeLanguage('es')}>
              <ListItemIcon>
                <img className={'appBar-imageIcon'} src={ES} alt="Español" />
              </ListItemIcon>
              <ListItemText classes={{ primary: 'noLoginBar-listItemText' }} primary="Español" />
            </MenuItem>
          </Menu>
          <Dialog
            open={openLoginDialog}
            onClose={() => setOpenLoginDialog(!openLoginDialog)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <AppBar position="static" color="default">
              <Tabs
                value={DialogTab}
                onChange={handleDialogTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                aria-label="full width tabs example">
                <Tab label="Log In" {...a11yProps(0)} />
                <Tab label="Register" {...a11yProps(1)} />
              </Tabs>
            </AppBar>

            <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={DialogTab}>
              <TabPanel value={DialogTab} index={0} dir={theme.direction}>
                <LoginBox
                  onClose={() => setOpenLoginDialog(!openLoginDialog)}
                  redirectLink={'/dashboard'}
                />
              </TabPanel>
              <TabPanel value={DialogTab} index={1} dir={theme.direction}>
                <CreateUser onClose={() => setOpenLoginDialog(!openLoginDialog)} />
              </TabPanel>
            </SwipeableViews>
          </Dialog>
          <Drawer open={openSideBar} onClose={() => setOpenSideBar(!openSideBar)}>
            <NoSidebar
              SidebarClicked={() => setOpenSideBar(!openSideBar)}
              SidebarLogin={() => setOpenLoginDialog(!openLoginDialog)}
            />
          </Drawer>
        </Toolbar>
      </AppBar>
      <main>
        {props.children}
        <Footer />
      </main>
    </div>
  );
};

NoLoginBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

export default NoLoginBar;
