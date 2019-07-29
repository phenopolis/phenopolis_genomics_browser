import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';

import AppBar from '@material-ui/core/AppBar';

import NoLoginBar from '../components/AppBar/NoLoginBar';
import LoginBar from '../components/AppBar/LoginBar';

import { connect } from 'react-redux';
import { getUsername } from '../redux/selectors';
import { setUser } from '../redux/actions';

import axios from 'axios';

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
			openLoginDialog: false
		};
	}

	componentDidMount() {
		axios
			.get('/api/is_logged_in', { withCredentials: true })
			.then((res) => {
				let respond = res.data;
				this.props.setUser(respond.username);
			})
			.catch((err) => {});
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

export default compose(withStyles(styles), withWidth(), connect(mapStateToProps, { setUser }))(HomeAppBar);
