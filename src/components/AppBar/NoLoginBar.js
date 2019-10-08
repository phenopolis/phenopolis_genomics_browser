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
	Drawer
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import NoSidebar from './NoSidebar';
import LoginBox from './LoginBox';

class NoLoginBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openLoginDialog: false,
			openSideBar: false
		};
	}

	OpenDialog() {
		this.setState({
			openLoginDialog: !this.state.openLoginDialog
		});
	}

	OpenSideBar() {
		this.setState({
			openSideBar: !this.state.openSideBar
		});
	}

	render() {
		const { classes } = this.props;

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

					<Grid item xs={10} md={1} className={classes.grid}>
						<Typography className={classes.Homelabel} variant='h6' color='inherit' noWrap component={Link} to='/'>
							Phenopolis
						</Typography>
					</Grid>

					<Hidden smDown>
						<Grid item xs={6} className={classes.gridpaper} />
					</Hidden>

					<Hidden smDown>
						<div>
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
								label='Login'
								showLabel
								icon={<AccountCircleIcon />}
								onClick={() => this.OpenDialog()}
							/>
						</div>
					</Hidden>
				</Grid>

				<Dialog
					open={this.state.openLoginDialog}
					onClose={() => this.OpenDialog()}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'>
					<LoginBox onLoginSuccess={() => this.OpenDialog()} />
				</Dialog>

				<Drawer open={this.state.openSideBar} onClose={() => this.OpenSideBar()}>
					<NoSidebar SidebarClicked={() => this.OpenSideBar()} SidebarLogin={() => this.OpenDialog()} />
				</Drawer>
			</Toolbar>
		);
	}
}

NoLoginBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
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
	}
});

export default compose(withStyles(styles), withWidth())(NoLoginBar);
