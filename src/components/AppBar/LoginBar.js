import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import { setUser } from '../../redux/actions';

import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import Cookies from 'universal-cookie';

import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';

import MenuIcon from '@material-ui/icons/Menu';
import People from '@material-ui/icons/People';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

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
		color: 'white'
	},
	grid: {
		textAlign: 'center'
	},
	listItemText: {
		fontSize: '0.8em' //Insert your required size
	}
});

class LoginBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openMenu: false,
			anchorEl: null,
			redirect: false
		};
	}

	OpenMenu() {
		this.setState({
			openMenu: !this.state.openMenu
		});
	}

	handleClick = (event) => {
		this.state.ancherEl ? this.setState({ anchorEl: null }) : this.setState({ anchorEl: event.currentTarget });
		this.OpenMenu();
	};

	handleLogout = (event) => {
		event.preventDefault();

		const cookies = new Cookies();

		axios
			.post('/api/logout', { withCredentials: true })
			.then((res) => {
				let respond = res.data;
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
							<IconButton size='small'>
								<MenuIcon className={classes.menuicon} />
							</IconButton>
						</Grid>
					</Hidden>

					<Grid item xs={10} md={2} className={classes.grid}>
						<Typography className={classes.Homelabel} variant='h6' color='inherit' noWrap component={Link} to='/'>
							Phenopolis
						</Typography>
					</Grid>

					<Hidden smDown>
						<Grid item xs={3} className={classes.gridpaper} />
					</Hidden>

					<Hidden smDown>
						<Grid item xs={3} className={classes.gridpaper}>
							<BottomNavigationAction
								className={classes.navigationbutton}
								label='My Patients'
								showLabel
								icon={<People />}
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
						</Grid>
					</Hidden>
				</Grid>
			</Toolbar>
		);
	}
}

LoginBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

export default compose(connect(null, { setUser }), withStyles(styles), withWidth())(LoginBar);
