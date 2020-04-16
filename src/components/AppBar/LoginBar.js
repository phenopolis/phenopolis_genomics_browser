import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { fade, withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import {
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
	Avatar
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import MenuIcon from '@material-ui/icons/Menu';
import PeopleIcon from '@material-ui/icons/People';
import TranslateIcon from '@material-ui/icons/Translate';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

import Sidebar from './Sidebar';
import NavSearch from './NavSearch';

import { getUsername } from '../../redux/selectors';
import { setUser } from '../../redux/actions';
import { setSnack } from '../../redux/actions';

import { withTranslation } from 'react-i18next';
import i18next from "i18next";

import GB from '../../assets/svg/gb.svg'
import CN from '../../assets/svg/cn.svg'
import JP from '../../assets/svg/jp.svg'
import DE from '../../assets/svg/de.svg'

const cookies = new Cookies();

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
			openLan: false,
			openExplore: false,
			anchorExplore: null,
			intervalId: null
		};
	}

	componentDidMount() {
		var intervalId = setInterval(() => {
			// let A = { name: this.props.reduxName }
			// console.log(A)
			if (this.props.reduxName !== '') {
				let name = cookies.get('username')
				if (name === undefined) {
					this.handleLogout('/login?link=timeout')
				}
			}
		}, 1000 * 60);

		this.setState({ intervalId: intervalId });
	}

	componentWillUnmount() {
		// use intervalId from the state to clear the interval
		clearInterval(this.state.intervalId);
	}

	OpenMenu() {
		this.setState({
			openMenu: !this.state.openMenu
		});
	}

	OpenSideBar() {
		this.setState({
			openSideBar: !this.state.openSideBar
		});
	}

	handleClick = (event) => {
		this.state.ancherEl ? this.setState({ anchorEl: null }) : this.setState({ anchorEl: event.currentTarget });
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
				console.log(this.props.reduxName)
				this.props.setSnack(i18next.t('AppBar.LoginBar.Logout_Success'), 'success')
			})
			.catch((err) => {
				this.props.setSnack(i18next.t('AppBar.LoginBar.Logout_Failed'), 'error')
				console.log(err);
			});
	};

	handleLanClick = (event) => {
		this.state.ancherLan ? this.setState({ anchorLan: null }) : this.setState({ anchorLan: event.currentTarget });
		this.OpenLan();
	};

	OpenLan() {
		this.setState({
			openLan: !this.state.openLan
		});
	}

	handleExploreClick = (event) => {
		this.state.ancherExplore ? this.setState({ anchorExplore: null }) : this.setState({ anchorExplore: event.currentTarget });
		this.OpenExplore();
	};

	OpenExplore() {
		this.setState({
			openExplore: !this.state.openExplore
		});
	}


	render() {
		const { classes } = this.props;
		const { t, i18n } = this.props;

		const changeLanguage = lng => {
			i18next.changeLanguage(lng);
			this.OpenLan()
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
			<Toolbar>
				<Grid container direction='row' justify='center' alignItems='center'>
					<Hidden mdUp>
						<Grid item xs={2}>
							<IconButton size='small' onClick={() => this.OpenSideBar()}>
								<MenuIcon className={classes.menuicon} />
							</IconButton>
						</Grid>
					</Hidden>

					{/* <Hidden smDown>
						<Grid item md={1} />
					</Hidden> */}

					<Grid item xs={10} md={1} className={classes.grid}>
						<Typography className={classes.Homelabel} variant='h6' color='inherit' noWrap component={Link} to='/'>
							Phenopolis
						</Typography>
					</Grid>

					<Hidden smDown>
						<Grid item md={5} lg={7} direction='row' justify='flex-end' alignItems='center'>
							<NavSearch />
						</Grid>
					</Hidden>

					<Hidden smDown>
						<div>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.LoginBar.Label_Search')}
								showLabel
								icon={<SearchIcon />}
								component={Link}
								to='/search'
							/>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.LoginBar.Label_Patients')}
								showLabel
								icon={<PeopleIcon />}
								component={Link}
								to='/my_patients'
							/>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label={t('AppBar.LoginBar.Label_Explore')}
								showLabel
								icon={<Avatar src={require('../../assets/image/phenopolis_logo_white.png')} className={classes.avatar} />}
								onClick={(event) => this.handleExploreClick(event)}
							/>
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
								id='simple-menu'
								anchorEl={this.state.anchorExplore}
								keepMounted
								open={Boolean(this.state.openExplore)}
								style={{ top: '3em' }}
								onClose={() => this.OpenExplore()}>
								<MenuItem component={Link} to='/publications' onClick={() => this.OpenExplore()}>
									<ListItemIcon>
										<DescriptionIcon />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary={t('AppBar.LoginBar.Label_Publication')} />
								</MenuItem>
								<MenuItem component={Link} to='/about' onClick={() => this.OpenExplore()}>
									<ListItemIcon>
										<SupervisedUserCircleIcon />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary={t('AppBar.LoginBar.Label_About')} />
								</MenuItem>
								<MenuItem component={Link} to='/product' onClick={() => this.OpenExplore()}>
									<ListItemIcon>
										<ShoppingCartIcon />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary={t('AppBar.LoginBar.Label_Product')} />
								</MenuItem>
							</Menu>

							<Menu
								id='simple-menu'
								anchorEl={this.state.anchorEl}
								keepMounted
								open={Boolean(this.state.openMenu)}
								style={{ top: '3em' }}
								onClose={() => this.OpenMenu()}>
								<MenuItem onClick={() => this.OpenMenu()}>
									<ListItemIcon>
										<LockIcon />
									</ListItemIcon>
									<ListItemText primary={t('AppBar.LoginBar.Label_Change_Password')} classes={{ primary: classes.listItemText }} />
								</MenuItem>
								<MenuItem onClick={() => this.handleLogout('/')}>
									<ListItemIcon>
										<ExitToAppIcon />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary={t('AppBar.LoginBar.Label_Logout')} />
								</MenuItem>
							</Menu>

							<Menu
								id='simple-menu'
								anchorEl={this.state.anchorLan}
								keepMounted
								open={Boolean(this.state.openLan)}
								style={{ top: '3em' }}
								onClose={() => this.OpenLan()}>
								<MenuItem onClick={() => changeLanguage('en')}>
									<ListItemIcon>
										<img className={classes.imageIcon} src={GB} />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary='English' />
								</MenuItem>
								<MenuItem onClick={() => changeLanguage('cn')}>
									<ListItemIcon>
										<img className={classes.imageIcon} src={CN} />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary='中文' />
								</MenuItem>
								<MenuItem onClick={() => changeLanguage('ja')}>
									<ListItemIcon>
										<img className={classes.imageIcon} src={JP} />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary='日本語' />
								</MenuItem>
								<MenuItem onClick={() => changeLanguage('de')}>
									<ListItemIcon>
										<img className={classes.imageIcon} src={DE} />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary='Deutsch' />
								</MenuItem>
							</Menu>
						</div>
					</Hidden>
				</Grid>

				<Drawer open={this.state.openSideBar} onClose={() => this.OpenSideBar()}>
					<Sidebar SidebarClicked={() => this.OpenSideBar()} SidebarLogout={() => this.handleLogout('/')} />
				</Drawer>
			</Toolbar>
		);
	}
}

LoginBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired
};

const styles = (theme) => ({
	menuicon: {
		color: 'white'
	},
	Homelabel: {
		textDecoration: 'none'
	},
	root: {
		width: 100,
		backgroundColor: '#2E84CF'
	},
	navigationbutton: {
		color: 'white',
		'max-width': 'max-content'
	},
	grid: {
		textAlign: 'center'
	},
	listItemText: {
		fontSize: '0.8em' //Insert your required size
	},
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto'
		}
	},
	searchIcon: {
		width: theme.spacing(7),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	inputRoot: {
		color: 'inherit'
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 7),
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: 200
		}
	},
	imageIcon: {
		height: '1.2em',
		width: '1.2em',
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
	},
	avatar: {
		width: 23,
		height: 23
	}
});

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });
export default compose(connect(mapStateToProps, { setUser, setSnack }), withStyles(styles), withWidth(), withTranslation())(LoginBar);

