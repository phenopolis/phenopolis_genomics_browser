import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import {
  withWidth,
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
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TranslateIcon from '@material-ui/icons/Translate';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import Footer from '../General/Footer';
import NoSidebar from './NoSidebar';
import LoginBox from './LoginBox';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';

import { withTranslation } from 'react-i18next';

class NoLoginBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openLoginDialog: false,
      openSideBar: false,
      openLan: false,
      anchorEl: null,
      openExplore: false,
      anchorExplore: null,
    };
  }

  OpenDialog() {
    this.setState({
      openLoginDialog: !this.state.openLoginDialog,
    });
  }

  OpenSideBar() {
    this.setState({
      openSideBar: !this.state.openSideBar,
    });
  }

  handleExploreClick = (event) => {
    this.state.ancherExplore
      ? this.setState({ anchorExplore: null })
      : this.setState({ anchorExplore: event.currentTarget });
    this.OpenExplore();
  };

  OpenExplore() {
    this.setState({
      openExplore: !this.state.openExplore,
    });
  }

  handleLanClick = (event) => {
    this.state.ancherEl
      ? this.setState({ anchorEl: null })
      : this.setState({ anchorEl: event.currentTarget });
    this.OpenLan();
  };

  OpenLan() {
    this.setState({
      openLan: !this.state.openLan,
    });
  }

  render() {
    const { classes } = this.props;
    const { t, i18n } = this.props;

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      this.OpenLan();
    };

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="relative" className={classes.appbar}>
          <Toolbar>
            <Grid container direction="row" justify="center" alignItems="center">
              <Hidden mdUp>
                <Grid item xs={2}>
                  <IconButton size="small" onClick={() => this.OpenSideBar()}>
                    <MenuIcon className={classes.menuicon} />
                  </IconButton>
                </Grid>
              </Hidden>

              <Grid item xs={10} md={1} className={classes.grid}>
                <Typography
                  className={classes.Homelabel}
                  variant="h6"
                  color="inherit"
                  noWrap
                  component={Link}
                  to="/">
                  Phenopolis
                </Typography>
              </Grid>

              <Hidden smDown>
                <Grid item xs={6} className={classes.gridpaper} />
              </Hidden>

              <Hidden smDown>
                <div>
                  {/* <BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.NoLoginBar.Label_Explore')}
								showLabel
								icon={<Avatar src={require('../../assets/image/phenopolis_logo_white.png')} className={classes.avatar} />}
								onClick={(event) => this.handleExploreClick(event)}
							/> */}
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.NoLoginBar.Label_Publication')}
                    showLabel
                    icon={<DescriptionIcon />}
                    component={Link}
                    to="/publications"
                  />
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.NoLoginBar.Label_Language')}
                    showLabel
                    icon={<TranslateIcon />}
                    onClick={(event) => this.handleLanClick(event)}
                  />
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.NoLoginBar.Label_Login')}
                    showLabel
                    icon={<AccountCircleIcon />}
                    onClick={() => this.OpenDialog()}
                  />
                </div>
              </Hidden>
            </Grid>

            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorExplore}
              keepMounted
              open={Boolean(this.state.openExplore)}
              style={{ top: '3em' }}
              onClose={() => this.OpenExplore()}>
              <MenuItem component={Link} to="/publications" onClick={() => this.OpenExplore()}>
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  classes={{ primary: classes.listItemText }}
                  primary={t('AppBar.NoLoginBar.Label_Publication')}
                />
              </MenuItem>
              <MenuItem component={Link} to="/product" onClick={() => this.OpenExplore()}>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText
                  classes={{ primary: classes.listItemText }}
                  primary={t('AppBar.NoLoginBar.Label_Product')}
                />
              </MenuItem>
            </Menu>

            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.openLan)}
              style={{ top: '3em' }}
              onClose={() => this.OpenLan()}>
              <MenuItem onClick={() => changeLanguage('en')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={GB} alt="English" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="English" />
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('cn')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={CN} alt="中文" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="中文" />
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('ja')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={JP} alt="日本語" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="日本語" />
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('de')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={DE} alt="Deutsch" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="Deutsch" />
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('gr')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={GR} alt="Ελληνικά" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="Ελληνικά" />
              </MenuItem>
              <MenuItem onClick={() => changeLanguage('es')}>
                <ListItemIcon>
                  <img className={classes.imageIcon} src={ES} alt="Español" />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.listItemText }} primary="Español" />
              </MenuItem>
            </Menu>

            <Dialog
              open={this.state.openLoginDialog}
              onClose={() => this.OpenDialog()}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description">
              <LoginBox onLoginSuccess={() => this.OpenDialog()} />
            </Dialog>

            <Drawer open={this.state.openSideBar} onClose={() => this.OpenSideBar()}>
              <NoSidebar
                SidebarClicked={() => this.OpenSideBar()}
                SidebarLogin={() => this.OpenDialog()}
              />
            </Drawer>
          </Toolbar>
        </AppBar>

        <main>
          {this.props.children}
          <Footer />
        </main>
      </div>
    );
  }
}

NoLoginBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  root: {
    // display: 'flex',
  },
  appbar: {
    backgroundColor: '#2E84CF',
  },
  menuicon: {
    color: 'white',
  },
  Homelabel: {
    textDecoration: 'none',
  },
  // root: {
  //   width: 100,
  //   backgroundColor: '#2E84CF',
  // },
  navigationbutton: {
    color: 'white',
    'max-width': 'max-content',
  },
  grid: {
    textAlign: 'center',
  },
  listItemText: {
    fontSize: '0.8em', //Insert your required size
  },
  imageIcon: {
    height: '1.2em',
    width: '1.2em',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
  },
  avatar: {
    width: 23,
    height: 23,
  },
});

export default compose(withStyles(styles), withWidth(), withTranslation())(NoLoginBar);
