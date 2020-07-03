import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { fade, withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import clsx from 'clsx';
import {
  CssBaseline,
  withWidth,
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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import Footer from '../General/Footer';
import DrawerSearch from './DrawerSearch';

import { getUsername } from '../../redux/selectors';
import { setUser } from '../../redux/actions/users';
import { setSnack } from '../../redux/actions/snacks';

import { withTranslation } from 'react-i18next';
import i18next from 'i18next';

import GB from '../../assets/svg/gb.svg';
import CN from '../../assets/svg/cn.svg';
import JP from '../../assets/svg/jp.svg';
import DE from '../../assets/svg/de.svg';
import GR from '../../assets/svg/gr.svg';
import ES from '../../assets/svg/es.svg';

const ActionBar = React.lazy(() => import('./ActionBar'));

const cookies = new Cookies();
const drawerWidth = 240;

class LoginBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openMenu: false,
      anchorEl: null,
      anchorLan: null,
      redirect: false,
      relink: '',
      openSideBar: false,
      openActionSideBar: true,
      openLan: false,
      openExplore: false,
      anchorExplore: null,
      intervalId: null,
      openSearchDrawer: false,
    };
  }

  componentDidMount() {
    var intervalId = setInterval(() => {
      if (this.props.reduxName !== '') {
        let name = cookies.get('username');
        if (name === undefined) {
          this.handleLogout('/login?link=timeout');
          clearInterval(this.state.intervalId);
        }
      }
    }, 1000 * 60);

    this.setState({ intervalId: intervalId });
  }

  componentWillUnmount() {
    // clearInterval(this.state.intervalId);
  }

  OpenMenu() {
    this.setState({
      openMenu: !this.state.openMenu,
    });
  }

  OpenSideBar() {
    this.setState({
      openSideBar: !this.state.openSideBar,
    });
  }

  OpenActionSideBar() {
    this.setState({
      openActionSideBar: !this.state.openActionSideBar,
    });
  }

  handleClick = (event) => {
    this.state.ancherEl
      ? this.setState({ anchorEl: null })
      : this.setState({ anchorEl: event.currentTarget });
    this.OpenMenu();
  };

  handleLogout = (relink) => {
    axios
      .post('/api/logout', { withCredentials: true })
      .then((res) => {
        // let respond = res.data;
        cookies.remove('username');
        this.setState({ redirect: true, relink: relink });
        this.props.setUser('');
        this.props.setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success');
      })
      .catch((err) => {
        this.props.setSnack(i18next.t('AppBar.LoginBar.Logout_Failed'), 'error');
      });
  };

  handleLanClick = (event) => {
    this.state.ancherLan
      ? this.setState({ anchorLan: null })
      : this.setState({ anchorLan: event.currentTarget });
    this.OpenLan();
  };

  OpenLan() {
    this.setState({
      openLan: !this.state.openLan,
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

  handletoggleDrawer = () => {
    this.setState({ openSearchDrawer: !this.state.openSearchDrawer });
  };

  handletoggleActionDrawer = () => {
    this.setState({ openActionSideBar: !this.state.openActionSideBar });
  };

  render() {
    const { classes } = this.props;
    const { t } = this.props;

    const changeLanguage = (lng) => {
      i18next.changeLanguage(lng);
      this.OpenLan();
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

    if (this.state.redirect) {
      return <Redirect to={this.state.relink} />;
    }

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: this.state.openActionSideBar,
          })}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => this.OpenActionSideBar()}
              className={clsx(classes.menuButton, {
                [classes.hide]: this.state.OpenActionSideBar,
              })}>
              <MenuIcon />
            </IconButton>
            {/* <Typography variant="h6" noWrap>
              Phenopolis
          </Typography> */}
            <Grid container direction="row" justify="center" alignItems="center">
              {/* <Hidden mdUp>
                <Grid item xs={2}>
                  <IconButton size="small" onClick={() => this.OpenSideBar()}>
                    <MenuIcon className={classes.menuicon} />
                  </IconButton>
                </Grid>
              </Hidden> */}

              {/* <Hidden smDown>
						<Grid item md={1} />
					</Hidden> */}

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
                <Grid item md={5} lg={7}>
                  {/* <NavSearch /> */}
                </Grid>
              </Hidden>

              <Hidden smDown>
                <div>
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.LoginBar.Label_Search')}
                    showLabel
                    icon={<SearchIcon />}
                    onClick={this.handletoggleDrawer}
                    // component={Link}
                    // to='/search'
                  />

                  <Drawer
                    anchor="top"
                    open={this.state.openSearchDrawer}
                    onClose={this.handletoggleDrawer}>
                    <DrawerSearch onRequestClose={this.handletoggleDrawer} />
                  </Drawer>

                  {/* <BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.LoginBar.Label_Search')}
								showLabel
								icon={<SearchIcon />}
								component={Link}
								to='/search'
							/> */}
                  {/* <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.LoginBar.Label_Patients')}
                    showLabel
                    icon={<PeopleIcon />}
                    component={Link}
                    to="/my_patients"
                  /> */}

                  {/* <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.LoginBar.Label_Publication')}
                    showLabel
                    icon={<DescriptionIcon />}
                    component={Link}
                    to="/publications"
                  /> */}

                  {/* <BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.LoginBar.Label_Explore')}
								showLabel
								icon={<Avatar src={require('../../assets/image/phenopolis_logo_white.png')} className={classes.avatar} />}
								onClick={(event) => this.handleExploreClick(event)}
							/> */}
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={t('AppBar.LoginBar.Label_Language')}
                    showLabel
                    icon={<TranslateIcon />}
                    onClick={(event) => this.handleLanClick(event)}
                  />
                  <BottomNavigationAction
                    className={classes.navigationbutton}
                    label={this.props.username}
                    showLabel
                    icon={<AccountCircleIcon />}
                    onClick={(event) => this.handleClick(event)}
                  />

                  <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorExplore}
                    keepMounted
                    open={Boolean(this.state.openExplore)}
                    style={{ top: '3em' }}
                    onClose={() => this.OpenExplore()}>
                    <MenuItem
                      component={Link}
                      to="/publications"
                      onClick={() => this.OpenExplore()}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.listItemText }}
                        primary={t('AppBar.LoginBar.Label_Publication')}
                      />
                    </MenuItem>
                    <MenuItem component={Link} to="/product" onClick={() => this.OpenExplore()}>
                      <ListItemIcon>
                        <ShoppingCartIcon />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.listItemText }}
                        primary={t('AppBar.LoginBar.Label_Product')}
                      />
                    </MenuItem>
                  </Menu>

                  <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.openMenu)}
                    style={{ top: '3em' }}
                    onClose={() => this.OpenMenu()}>
                    <MenuItem onClick={() => this.OpenMenu()}>
                      <ListItemIcon>
                        <LockIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('AppBar.LoginBar.Label_Change_Password')}
                        classes={{ primary: classes.listItemText }}
                      />
                    </MenuItem>
                    <MenuItem onClick={() => this.handleLogout('/')}>
                      <ListItemIcon>
                        <ExitToAppIcon />
                      </ListItemIcon>
                      <ListItemText
                        classes={{ primary: classes.listItemText }}
                        primary={t('AppBar.LoginBar.Label_Logout')}
                      />
                    </MenuItem>
                  </Menu>

                  <Menu
                    id="simple-menu"
                    anchorEl={this.state.anchorLan}
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
                      <ListItemText
                        classes={{ primary: classes.listItemText }}
                        primary="Ελληνικά"
                      />
                    </MenuItem>
                    <MenuItem onClick={() => changeLanguage('es')}>
                      <ListItemIcon>
                        <img className={classes.imageIcon} src={ES} alt="Español" />
                      </ListItemIcon>
                      <ListItemText classes={{ primary: classes.listItemText }} primary="Español" />
                    </MenuItem>
                  </Menu>
                </div>
              </Hidden>
            </Grid>

            {/* <Drawer open={this.state.openSideBar} onClose={() => this.OpenSideBar()}>
              <Sidebar
                SidebarClicked={() => this.OpenSideBar()}
                SidebarLogout={() => this.handleLogout('/')}
              />
            </Drawer> */}

            {/* <Drawer anchor="right" open={this.state.openRightSideBar} onClose={() => this.OpenRightSideBar()}>
          <ActionBar
            RightSidebarClicked={() => this.OpenRightSideBar()}
          />
        </Drawer> */}
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          anchor="left"
          open={this.state.openActionSideBar}
          onClose={() => this.OpenActionSideBar()}
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: this.state.openActionSideBar,
            [classes.drawerClose]: !this.state.openActionSideBar,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: this.state.openActionSideBar,
              [classes.drawerClose]: !this.state.openActionSideBar,
            }),
          }}>
          <div className={classes.toolbar}>
            <IconButton onClick={() => this.OpenActionSideBar()}>
              {this.props.theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Divider />
          <ActionBar
            username={this.props.username}
            expended={this.state.openActionSideBar}
            ActionbarSearch={() => this.handletoggleDrawer()}
            ActionSidebarClicked={() => this.OpenActionSideBar()}
            ActionbarLogout={() => this.handleLogout('/')}
          />
        </Drawer>

        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.props.children}
          <Footer />
        </main>
      </div>
    );
  }
}

LoginBar.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};

const styles = (theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 36,
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
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
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

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });
export default compose(
  connect(mapStateToProps, { setUser, setSnack }),
  withStyles(styles, { withTheme: true }),
  withWidth(),
  withTranslation()
)(LoginBar);
