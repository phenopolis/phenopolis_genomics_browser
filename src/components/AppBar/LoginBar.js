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
	InputBase,
	BottomNavigationAction,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Drawer
} from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import MenuIcon from '@material-ui/icons/Menu';
import PeopleIcon from '@material-ui/icons/People';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Sidebar from './Sidebar';
import NavSearch from './NavSearch';

import { setUser } from '../../redux/actions';

class LoginBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openMenu: false,
			anchorEl: null,
			redirect: false,
			openSideBar: false
		};
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

	handleLogout = () => {
		const cookies = new Cookies();

		axios
			.post('/api/logout', { withCredentials: true })
			.then((res) => {
				// let respond = res.data;
				cookies.remove('username');
				this.setState({ redirect: true });
				this.props.setUser('');
			})
			.catch((err) => {
				window.alert('Logout Failed.');
				console.log(err);
			});
	};

	render() {
		const { classes } = this.props;

		if (this.state.redirect) {
			return <Redirect to='/' />;
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
								label='Search'
								showLabel
								icon={<SearchIcon />}
								component={Link}
								to='/search'
							/>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label='Publication'
								showLabel
								icon={<DescriptionIcon />}
								component={Link}
								to='/publications'
							/>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label='Patients'
								showLabel
								icon={<PeopleIcon />}
								component={Link}
								to='/my_patients'
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
								anchorEl={this.state.anchorEl}
								keepMounted
								open={Boolean(this.state.openMenu)}
								style={{ top: '3em' }}
								onClose={() => this.OpenMenu()}>
								<MenuItem onClick={() => this.OpenMenu()}>
									<ListItemIcon>
										<LockIcon />
									</ListItemIcon>
									<ListItemText primary='Change Password' classes={{ primary: classes.listItemText }} />
								</MenuItem>
								<MenuItem onClick={this.handleLogout}>
									<ListItemIcon>
										<ExitToAppIcon />
									</ListItemIcon>
									<ListItemText classes={{ primary: classes.listItemText }} primary='Logout' />
								</MenuItem>
							</Menu>
						</div>
					</Hidden>
				</Grid>

				<Drawer open={this.state.openSideBar} onClose={() => this.OpenSideBar()}>
					<Sidebar SidebarClicked={() => this.OpenSideBar()} SidebarLogout={this.handleLogout} />
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
	}
});

export default compose(connect(null, { setUser }), withStyles(styles), withWidth())(LoginBar);
