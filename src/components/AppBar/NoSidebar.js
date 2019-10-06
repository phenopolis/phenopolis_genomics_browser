import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import { withWidth, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';

import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

class NoSideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	toggleDrawer = () => {
		this.props.SidebarClicked();
	};

	toggleLogin = () => {
		this.props.SidebarLogin();
	};

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.list} role='presentation' onClick={this.toggleDrawer} onKeyDown={this.toggleDrawer}>
				<List>
					<ListItem button component={Link} to='/publications'>
						<ListItemIcon>
							<DescriptionIcon />
						</ListItemIcon>
						<ListItemText primary='Publication' classes={{ primary: classes.listItemText }} />
					</ListItem>
					<ListItem button onClick={this.toggleLogin}>
						<ListItemIcon>
							<AccountCircleIcon />
						</ListItemIcon>
						<ListItemText primary='Login' classes={{ primary: classes.listItemText }} />
					</ListItem>
				</List>
			</div>
		);
	}
}

NoSideBar.propTypes = {
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

export default compose(withStyles(styles), withWidth())(NoSideBar);
