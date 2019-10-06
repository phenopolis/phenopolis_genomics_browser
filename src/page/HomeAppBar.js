import React from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import { AppBar, withWidth } from '@material-ui/core';

import NoLoginBar from '../components/AppBar/NoLoginBar';
import LoginBar from '../components/AppBar/LoginBar';

import { getUsername } from '../redux/selectors';

class HomeAppBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// openLoginDialog: false,
			redirect: false
		};
	}

	getReduxName() {
		return this.props.reduxName;
	}

	// OpenDialog() {
	//   this.setState({
	//     openLoginDialog: !this.state.openLoginDialog
	//   });
	// }

	render() {
		const { classes } = this.props;

		if (this.state.redirect) {
			return <Redirect to='/' />;
		}

		return (
			<AppBar position='relative' className={classes.appbar}>
				{this.props.reduxName === '' ? <NoLoginBar /> : <LoginBar username={this.props.reduxName} />}
			</AppBar>
		);
	}
}

HomeAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

const styles = (theme) => ({
	appbar: {
		backgroundColor: '#2E84CF'
	},
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

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });
export default compose(withStyles(styles), withWidth(), connect(mapStateToProps, {}))(HomeAppBar);
