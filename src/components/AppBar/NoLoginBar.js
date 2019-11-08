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
	ListItemText
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TranslateIcon from '@material-ui/icons/Translate';

import NoSidebar from './NoSidebar';
import LoginBox from './LoginBox';

import GB from '../../assets/svg/gb.svg'
import CN from '../../assets/svg/cn.svg'
import JP from '../../assets/svg/jp.svg'

import { withTranslation } from 'react-i18next';

class NoLoginBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openLoginDialog: false,
			openSideBar: false,
			openLan: false,
			anchorEl: null,
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

	handleLanClick = (event) => {
		this.state.ancherEl ? this.setState({ anchorEl: null }) : this.setState({ anchorEl: event.currentTarget });
		this.OpenLan();
	};

	OpenLan() {
		this.setState({
			openLan: !this.state.openLan
		});
	}

	render() {
		const { classes } = this.props;
		const { t, i18n } = this.props;

		const changeLanguage = lng => {
			i18n.changeLanguage(lng);
			this.OpenLan()
		};

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
								label={t('AppBar.NoLoginBar.Label_Publication')}
								showLabel
								icon={<DescriptionIcon />}
								component={Link}
								to='/publications'
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
					id='simple-menu'
					anchorEl={this.state.anchorEl}
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
					<MenuItem onClick={() => changeLanguage('ch')}>
						<ListItemIcon>
							<img className={classes.imageIcon} src={CN} />
						</ListItemIcon>
						<ListItemText classes={{ primary: classes.listItemText }} primary='中文' />
					</MenuItem>
					<MenuItem onClick={() => this.OpenLan()}>
						<ListItemIcon>
							<img className={classes.imageIcon} src={JP} />
						</ListItemIcon>
						<ListItemText classes={{ primary: classes.listItemText }} primary='日本語' />
					</MenuItem>
				</Menu>

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
	imageIcon: {
		height: '1.2em',
		width: '1.2em',
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
	}
});

export default compose(withStyles(styles), withWidth(), withTranslation())(NoLoginBar);
