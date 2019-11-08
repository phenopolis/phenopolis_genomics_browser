import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import { withWidth, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

import SearchIcon from '@material-ui/icons/Search';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import LockIcon from '@material-ui/icons/Lock';
import DescriptionIcon from '@material-ui/icons/Description';
import PeopleIcon from '@material-ui/icons/People';

import { withTranslation } from 'react-i18next';

class SideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	toggleDrawer = () => {
		this.props.SidebarClicked();
	};

	toggleLogout = () => {
		this.props.SidebarLogout();
	};

	render() {
		const { classes } = this.props;
		const { t, i18n } = this.props;

		return (
			<div className={classes.list} role='presentation' onClick={this.toggleDrawer} onKeyDown={this.toggleDrawer}>
				<List>
					<ListItem button component={Link} to='/search'>
						<ListItemIcon>
							<SearchIcon />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Search')} classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button component={Link} to='/publications'>
						<ListItemIcon>
							<DescriptionIcon />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Publication')} classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button component={Link} to='/my_patients'>
						<ListItemIcon>
							<PeopleIcon />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Patients')} classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button>
						<ListItemIcon>
							<LockIcon />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Change_Password')} classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button onClick={this.toggleLogout}>
						<ListItemIcon>
							<ExitToAppIcon />
						</ListItemIcon>
						<ListItemText primary={t('AppBar.SideBar.Label_Logout')} classes={{ primary: classes.listItemText }} />
					</ListItem>
				</List>
			</div>
		);
	}
}

SideBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

const styles = (theme) => ({
	list: {
		width: 250
	},
	listItemText: {
		fontSize: '0.97em'
	}
});

export default compose(withStyles(styles), withWidth(),withTranslation())(SideBar);
