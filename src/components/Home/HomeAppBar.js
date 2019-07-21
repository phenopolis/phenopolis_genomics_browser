import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';

import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const styles = (theme) => ({
	appbar: {
		backgroundColor: '#2E84CF'
	},
	menuicon: {
		color: 'white'
	},
	root: {
		width: 100,
		backgroundColor: '#2E84CF'
	},
	navigationbutton: {
		color: 'white'
	}
});

class HomeAppBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: null
		};
	}
	render() {
		const { classes } = this.props;

		return (
			<AppBar position='relative' className={classes.appbar}>
				<Toolbar>
					<Grid container direction='row' justify='space-between' alignItems='center'>
						<Hidden mdUp>
							<Grid item>
								<IconButton size='small'>
									<MenuIcon className={classes.menuicon} />
								</IconButton>
							</Grid>
						</Hidden>
						<Hidden smDown>
							<Grid item />
						</Hidden>
						<Grid item>
							<Typography variant='h6' color='inherit' noWrap>
								Phenopolis
							</Typography>
						</Grid>

						<Hidden smDown>
							<Grid item>
								<BottomNavigationAction
									className={classes.navigationbutton}
									label='Publication'
									showLabel
									icon={<DescriptionIcon />}
								/>
								<BottomNavigationAction
									className={classes.navigationbutton}
									label='Login'
									showLabel
									icon={<AccountCircleIcon />}
								/>
							</Grid>
						</Hidden>

						<Grid item />
					</Grid>
				</Toolbar>
			</AppBar>
		);
	}
}

HomeAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

export default compose(withStyles(styles), withWidth())(HomeAppBar);
