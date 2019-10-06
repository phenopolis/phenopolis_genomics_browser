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

		return (
			<div className={classes.list} role='presentation' onClick={this.toggleDrawer} onKeyDown={this.toggleDrawer}>
				<List>
					<ListItem button component={Link} to='/search'>
						<ListItemIcon>
							<SearchIcon />
						</ListItemIcon>
						<ListItemText primary='Search' classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button component={Link} to='/publications'>
						<ListItemIcon>
							<DescriptionIcon />
						</ListItemIcon>
						<ListItemText primary='Publication' classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button component={Link} to='/my_patients'>
						<ListItemIcon>
							<PeopleIcon />
						</ListItemIcon>
						<ListItemText primary='My Patients' classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button>
						<ListItemIcon>
							<LockIcon />
						</ListItemIcon>
						<ListItemText primary='Change Password' classes={{ primary: classes.listItemText }} />
					</ListItem>

					<ListItem button onClick={this.toggleLogout}>
						<ListItemIcon>
							<ExitToAppIcon />
						</ListItemIcon>
						<ListItemText primary='Logout' classes={{ primary: classes.listItemText }} />
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

export default compose(withStyles(styles), withWidth())(SideBar);
