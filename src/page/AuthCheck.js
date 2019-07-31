import React from 'react';
import compose from 'recompose/compose';
import { Redirect } from 'react-router';

import { connect } from 'react-redux';
import { setUser } from '../redux/actions';

import axios from 'axios';

class AuthCheck extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openLoginDialog: false,
			redirect: false
		};
	}

	componentWillMount() {
		axios
			.get('/api/is_logged_in', { withCredentials: true })
			.then((res) => {
				let respond = res.data;
				this.props.setUser(respond.username);
			})
			.catch((err) => {
				console.log(err);
				if (
					(window.location.pathname !== '/') &
					(window.location.pathname !== '/publications') &
					(window.location.pathname !== '/login')
				) {
					this.setState({ redirect: true });
				}
			});
	}

	render() {
		if (this.state.redirect) {
			return <Redirect to='/login' />;
		}

		return <div />;
	}
}

export default compose(connect(null, { setUser }))(AuthCheck);
