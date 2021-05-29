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
  Drawer,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  CssBaseline,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TranslateIcon from '@material-ui/icons/Translate';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import Footer from '../General/Footer';
import NoSidebar from './NoSidebar';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';
import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux';
import { setDialog } from '../../redux/actions/dialog';

const NoLoginBar = (props) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  // const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [openLan, setOpenLan] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLanClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenLan(!openLan);
  };

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLan(!openLan);
  };

  const handleTriggerDialog = (dialogName) => {
    dispatch(setDialog(dialogName));
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
                  label={'Login/Register'}
                  showLabel
                  icon={<AccountCircleIcon />}
                  onClick={() => handleTriggerDialog('Login/Register')}
                />
              </div>
            </Hidden>
          </Grid>

          <Drawer open={openSideBar} onClose={() => setOpenSideBar(!openSideBar)}>
            {/* <NoSidebar
              SidebarClicked={() => setOpenSideBar(!openSideBar)}
              SidebarLogin={() => setOpenLoginDialog(!openLoginDialog)}
            /> */}
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

// NoLoginBar.propTypes = {
//   classes: PropTypes.object.isRequired,
//   width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
// };

export default NoLoginBar;
