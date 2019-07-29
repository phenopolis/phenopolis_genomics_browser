import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';

import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import MenuIcon from '@material-ui/icons/Menu';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Dialog from '@material-ui/core/Dialog';

import LoginBox from './LoginBox';

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
	}
});

class NoLoginBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openLoginDialog: false
		};
	}

	OpenDialog() {
		this.setState({
			openLoginDialog: !this.state.openLoginDialog
		});
	}

	render() {
		const { classes } = this.props;

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
						</Grid>
					</Hidden>
				</Grid>

				<Dialog
					open={this.state.openLoginDialog}
					onClose={() => this.OpenDialog()}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'>
					<LoginBox onLoginSuccess={() => this.OpenDialog()} />
				</Dialog>
			</Toolbar>
		);
	}
}

NoLoginBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

export default compose(withStyles(styles), withWidth())(NoLoginBar);
