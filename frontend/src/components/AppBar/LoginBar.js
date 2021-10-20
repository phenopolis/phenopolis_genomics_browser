import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import {
  CssBaseline,
  Grid,
  Hidden,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigationAction,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Divider,
  Box,
  Avatar,
  Button,
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import MenuIcon from '@material-ui/icons/Menu';
import TranslateIcon from '@material-ui/icons/Translate';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserNurse } from '@fortawesome/pro-solid-svg-icons';

import Footer from '../General/Footer';
import DrawerSearch from './DrawerSearch';
import { userLogout } from '../../redux/actions/auth';

import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';
// const ActionBar = React.lazy(() => import('./ActionBar'));
import ActionBar from "./ActionBar"

const LoginBar = (props) => {
  const { t, ready } = useTranslation();
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorLan, setAnchorLan] = useState(null);
  const [openActionSideBar, setOpenActionSideBar] = useState(false);
  const [openLan, setOpenLan] = useState(false);
  const [openSearchDrawer, setOpenSearchDrawer] = useState(false);

  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));

  const changeLanguage = (lng) => {
    i18next.changeLanguage(lng);
    OpenLan();
    if(
      (window.location.pathname !== '/') &
      (window.location.pathname !== '/publications') &
      (window.location.pathname !== '/login') &
      (window.location.pathname !== '/dashboard') &
      (window.location.pathname !== '/create_patient')
    ) {
      window.location.reload();
    }
  };

  const OpenLan = () => {
    setOpenLan(!openLan);
  };

  const OpenMenu = () => {
    setOpenMenu(!openMenu);
  };

  const OpenActionSideBar = () => {
    setOpenActionSideBar(!openActionSideBar);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    OpenMenu();
  };

  const handleLogout = () => {
    dispatch(userLogout({ relink: '/' }));
  };

  const handleLanClick = (event) => {
    setAnchorLan(event.currentTarget);
    OpenLan();
  };

  const handletoggleDrawer = () => {
    setOpenSearchDrawer(!openSearchDrawer);
  };
  if(ready === true) {
    return (
      <div className="loginBar-container">
        <CssBaseline />
        <AppBar position="fixed" className={clsx('appBar')}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => OpenActionSideBar()}
              className="appBar-menuButton">
              <MenuIcon />
            </IconButton>
            <Typography
              className="appBar-HomeLabel"
              variant="h6"
              color="inherit"
              // noWrap
              component={Link}
              to="/"
              style={{ fontWeight: '900' }}>
              Phenopolis
            </Typography>
            <Grid container direction="row" justify="flex-end" alignItems="center">
              <Hidden smDown>
                <div>
                  <BottomNavigationAction
                    className="appBar-navigationbutton"
                    label={t('AppBar.LoginBar.Label_Search')}
                    showLabel
                    icon={<SearchIcon />}
                    onClick={handletoggleDrawer}
                  />

                  <BottomNavigationAction
                    className="appBar-navigationbutton"
                    label={username}
                    showLabel
                    icon={<AccountCircleIcon />}
                    onClick={(event) => handleClick(event)}
                  />

                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(openMenu)}
                    style={{ top: '3em' }}
                    onClose={() => OpenMenu()}>
                    <MenuItem onClick={() => OpenMenu()}>
                      <ListItemIcon>
                        <LockIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('AppBar.LoginBar.Label_Change_Password')}
                        classes={{ primary: 'appBar-listItemText' }}
                      />
                    </MenuItem>
                    <MenuItem onClick={() => handleLogout()}>
                      <ListItemIcon>
                        <ExitToAppIcon />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: 'appBar-listItemText' }}
                        primary={t('AppBar.LoginBar.Label_Logout')}
                      />
                    </MenuItem>
                  </Menu>
                </div>
              </Hidden>

              <Drawer anchor="top" open={openSearchDrawer} onClose={handletoggleDrawer}>
                <DrawerSearch onRequestClose={handletoggleDrawer} />
              </Drawer>
            </Grid>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          anchor="left"
          open={openActionSideBar}
          onClose={() => OpenActionSideBar()}
          className={clsx('darwer', {
            ['drawerOpen']: openActionSideBar,
            ['drawerClose']: !openActionSideBar,
          })}
          classes={{
            paper: clsx({
              ['drawerOpen']: openActionSideBar,
              ['drawerClose']: !openActionSideBar,
            }),
          }}>
          <Box
            className={clsx('app-sidebar-userbox', {
              'app-sidebar-userbox--collapsed': !openActionSideBar,
            })}
            style={{ paddingTop: '6em', backgroundColor: 'smokewhite' }}>
            <Link style={{ textDecoration: 'none' }} to="/dashboard">
              <Avatar alt="User" className="app-sidebar-userbox-avatar">
                <div className="bg-white text-center text-primary font-size-xl d-80 rounded-circle mt-3  mb-sm-0">
                  <FontAwesomeIcon icon={faUserNurse} style={{ fontSize: '36' }} />
                </div>

                {/* <AccountCircleIcon style={{ height: '2.5em', width: '2.5em' }} /> */}
              </Avatar>
            </Link>

            <Box className="app-sidebar-userbox-name">
              <Box>
                <b>{username}</b>
              </Box>
              <Box className="app-sidebar-userbox-description">Working Hospital</Box>
              <Box className="app-sidebar-userbox-btn-profile">
                <Button size="small" color="primary" component={Link} to="/dashboard">
                  View Dashboard
                </Button>
              </Box>
            </Box>
          </Box>
          <Divider />
          <ActionBar
            username={username}
            expended={openActionSideBar}
            ActionbarSearch={() => handletoggleDrawer()}
            ActionSidebarClicked={() => OpenActionSideBar()}
            ActionbarLogout={() => handleLogout()}
          />
        </Drawer>

        <main className="appBar-content">
          <div className="appBar-toolbar" />
          {props.children}
          <Footer />
        </main>
      </div>
    )
  } else {
    return (
      <div>
        <h1> Loading Translation </h1>
      </div>
    )
  };
};

export default LoginBar;
