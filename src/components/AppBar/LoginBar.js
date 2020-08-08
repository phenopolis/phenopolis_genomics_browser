import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
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
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import MenuIcon from '@material-ui/icons/Menu';
import TranslateIcon from '@material-ui/icons/Translate';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import Footer from '../General/Footer';
import DrawerSearch from './DrawerSearch';
import { setUser } from '../../redux/actions/users';
import { userLogout } from '../../redux/actions/auth';
import { setSnack } from '../../redux/actions/snacks';

import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';
const ActionBar = React.lazy(() => import('./ActionBar'));

const LoginBar = (props) => {

  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorLan, setAnchorLan] = useState(null);
  const [openActionSideBar, setOpenActionSideBar] = useState(false);
  const [openLan, setOpenLan] = useState(false);
  const [openExplore, setOpenExplore] = useState(false);
  const [anchorExplore, setAnchorExplore] = useState(null);
  const [openSearchDrawer, setOpenSearchDrawer] = useState(false);

  const { username } = useSelector((state) => ({
    username: state.users.username
  }));

  useEffect(() => {
  }, [username])

      const changeLanguage = (lng) => {
      i18next.changeLanguage(lng);
      OpenLan();
      if (
        (window.location.pathname !== '/') &
        (window.location.pathname !== '/publications') &
        (window.location.pathname !== '/login') &
        (window.location.pathname !== '/about') &
        (window.location.pathname !== '/price') &
        (window.location.pathname !== '/product') &
        (window.location.pathname !== '/search')
      ) {
        window.location.reload();
      }
    };

  const OpenLan = () => {
    setOpenLan(!openLan)
  }

  const OpenMenu = () => {
    setOpenMenu(!openMenu)
  }

  const OpenActionSideBar = () => {
    setOpenActionSideBar(!openActionSideBar);
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
    OpenMenu();
  };

  const handleLogout = (relink) => {
    dispatch(userLogout())
    dispatch(setUser(''));
    dispatch(setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success'));
    history.push(relink);
  };

 const handleLanClick = (event) => {
    setAnchorLan(event.currentTarget)
    OpenLan();
  };

 const OpenExplore = () => {
   setOpenExplore(!openExplore)
  }

 const handletoggleDrawer = () => {
   setOpenSearchDrawer(!openSearchDrawer)
  };

  return (
    <div className="loginBar-container">
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx('appBar', {
          ['appBarShift']: openActionSideBar,
        })}>
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
            className='appBar-HomeLabel'
            variant="h6"
            color="inherit"
            // noWrap
            component={Link}
            to="/">
            Phenopolis
          </Typography>
          <Grid container direction="row" justify="flex-end" alignItems="center">
            <Hidden smDown>
              <div>
                <BottomNavigationAction
                  className='appBar-navigationbutton'
                  label={t('AppBar.LoginBar.Label_Search')}
                  showLabel
                  icon={<SearchIcon />}
                  onClick={handletoggleDrawer}
                />

                <Drawer
                  anchor="top"
                  open={openSearchDrawer}
                  onClose={handletoggleDrawer}>
                  <DrawerSearch onRequestClose={handletoggleDrawer} />
                </Drawer>

                <BottomNavigationAction
                  className='appBar-navigationbutton'
                  label={t('AppBar.LoginBar.Label_Language')}
                  showLabel
                  icon={<TranslateIcon />}
                  onClick={(event) => handleLanClick(event)}
                />
                <BottomNavigationAction
                  className='appBar-navigationbutton'
                  label={username}
                  showLabel
                  icon={<AccountCircleIcon />}
                  onClick={(event) => handleClick(event)}
                />

                <Menu
                  id="simple-menu"
                  anchorEl={anchorExplore}
                  keepMounted
                  open={Boolean(openExplore)}
                  style={{ top: '3em' }}
                  onClose={() => OpenExplore()}>
                  <MenuItem
                    component={Link}
                    to="/publications"
                    onClick={() => OpenExplore()}>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: 'appBar-listItemText' }}
                      primary={t('AppBar.LoginBar.Label_Publication')}
                    />
                  </MenuItem>
                  <MenuItem component={Link} to="/product" onClick={() => OpenExplore()}>
                    <ListItemIcon>
                      <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: 'appBar-listItemText' }}
                      primary={t('AppBar.LoginBar.Label_Product')}
                    />
                  </MenuItem>
                </Menu>

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
                  <MenuItem onClick={() => handleLogout('/')}>
                    <ListItemIcon>
                      <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: 'appBar-listItemText' }}
                      primary={t('AppBar.LoginBar.Label_Logout')}
                    />
                  </MenuItem>
                </Menu>

                <Menu
                  id="simple-menu"
                  anchorEl={anchorLan}
                  keepMounted
                  open={Boolean(openLan)}
                  style={{ top: '3em' }}
                  onClose={() => OpenLan()}>
                  <MenuItem onClick={() => changeLanguage('en')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={GB} alt="English" />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: 'appBar-listItemText' }} primary="English" />
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguage('cn')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={CN} alt="中文" />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: 'appBar-listItemText' }} primary="中文" />
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguage('ja')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={JP} alt="日本語" />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: 'appBar-listItemText' }} primary="日本語" />
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguage('de')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={DE} alt="Deutsch" />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: 'appBar-listItemText' }} primary="Deutsch" />
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguage('gr')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={GR} alt="Ελληνικά" />
                    </ListItemIcon>
                    <ListItemText
                      classes={{ primary: 'appBar-listItemText' }}
                      primary="Ελληνικά"
                    />
                  </MenuItem>
                  <MenuItem onClick={() => changeLanguage('es')}>
                    <ListItemIcon>
                      <img className='imageIcon' src={ES} alt="Español" />
                    </ListItemIcon>
                    <ListItemText classes={{ primary: 'appBar-listItemText' }} primary="Español" />
                  </MenuItem>
                </Menu>
              </div>
            </Hidden>
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
        <div className="appBar-toolbar">
          <IconButton onClick={() => OpenActionSideBar()}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <ActionBar
          username={username}
          expended={openActionSideBar}
          ActionbarSearch={() => handletoggleDrawer()}
          ActionSidebarClicked={() => OpenActionSideBar()}
          ActionbarLogout={() => handleLogout('/')}
        />
      </Drawer>

      <main className='appBar-content'>
        <div className='appBar-toolbar' />
        {props.children}
        <Footer />
      </main>
    </div>
  );
}

export default LoginBar;
