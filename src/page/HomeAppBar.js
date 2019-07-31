import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';
import { Redirect } from 'react-router';

import AppBar from '@material-ui/core/AppBar';

import NoLoginBar from '../components/AppBar/NoLoginBar';
import LoginBar from '../components/AppBar/LoginBar';

import { connect } from 'react-redux';
import { getUsername } from '../redux/selectors';

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });

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

class HomeAppBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openLoginDialog: false,
			redirect: false
		};
	}

	getReduxName() {
		return this.props.reduxName;
	}

	OpenDialog() {
		this.setState({
			openLoginDialog: !this.state.openLoginDialog
		});
	}

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

export default compose(withStyles(styles), withWidth(), connect(mapStateToProps, {}))(HomeAppBar);
