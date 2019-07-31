import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Cookies from 'universal-cookie';
import { Redirect } from 'react-router';

import { connect } from 'react-redux';
import { setUser } from '../../redux/actions';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import axios from 'axios';
const qs = require('querystring');

const styles = (theme) => ({
	paper: {
		margin: theme.spacing(4),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1)
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	},
	textfild: {
		color: '#2E84CF'
	}
});

const CssTextField = withStyles({
	root: {
		'& label.Mui-focused': {
			color: '#2E84CF'
		},
		'& .MuiInput-underline:after': {
			borderBottomColor: 'green'
		},
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: 'lightgray'
			},
			'&:hover fieldset': {
				borderColor: 'black'
			},
			'&.Mui-focused fieldset': {
				borderColor: '#2E84CF'
			}
		}
	}
})(TextField);

class LoginBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			password: '',
			redirect: false
		};
	}

	handleSubmit = (event) => {
		event.preventDefault();

		const cookies = new Cookies();

		const loginData = qs.stringify({
			name: this.state.name,
			password: this.state.password
		});

		axios
			.post('/api/login', loginData, { withCredentials: true })
			.then((res) => {
				let respond = res.data;
				if (respond.success === 'Authenticated') {
					cookies.set('username', respond.username, { path: '/', maxAge: 86400 * 60 * 24 * 30 });
					this.setState({ redirect: true });
					this.props.setUser(respond.username);
					this.props.onLoginSuccess();
				} else {
					window.alert('Login Failed.');
				}
			})
			.catch((err) => {
				window.alert('Login Failed.');
			});

		// fetch('/api/login', {
		// 	method: 'POST',
		// 	body: loginData,
		// 	credentials: 'include',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded'
		// 	}
		// })
		// 	.then(function(response) {
		// 		if (response.status !== 200) {
		// 			console.log('Looks like there was a problem. Status Code: ' + response.status);
		// 			window.alert('Login Failed.');
		// 			return;
		// 		}
		// 		response.json().then(function(data) {
		// 			console.log(data.username);
		// 			window.alert('Login Success!');
		// 			cookies.set('username', data.username, { path: '/', maxAge: 86400 * 60 * 24 * 30 });
		// 			this.props.setUser(data.username);
		// 			this.props.onLoginSuccess();
		// 		});
		// 	})
		// 	.catch(function(err) {
		// 		console.log('Fetch Error :-S', err);
		// 		window.alert('Login Error.');
		// 	});
	};

	handleNameChange = (event) => {
		this.setState({ name: event.target.value });
	};

	handlePasswordChange = (event) => {
		this.setState({ password: event.target.value });
	};

	render() {
		const { classes } = this.props;

		if (this.state.redirect) {
			return <Redirect to='/search' />;
		}

		return (
			<Container component='main' maxWidth='xs'>
				<CssBaseline />
				<div className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component='h1' variant='h6'>
						Sign in
					</Typography>

					<form className={classes.form} noValidate onSubmit={this.handleSubmit}>
						<CssTextField
							className={classes.textfild}
							value={this.state.name}
							onChange={this.handleNameChange}
							variant='outlined'
							margin='normal'
							required
							fullWidth
							id='name'
							label='User Name'
							name='name'
							autoFocus
						/>
						<CssTextField
							className={classes.textfild}
							value={this.state.password}
							onChange={this.handlePasswordChange}
							variant='outlined'
							margin='normal'
							required
							fullWidth
							name='password'
							label='Password'
							type='password'
							id='password'
						/>
						<Button
							type='submit'
							fullWidth
							variant='contained'
							className={classes.submit}
							style={{ backgroundColor: '#2E84CF', color: 'white' }}>
							Sign In
						</Button>
					</form>
				</div>
			</Container>
		);
	}
}

LoginBox.propTypes = {
	classes: PropTypes.object.isRequired
};

export default compose(withStyles(styles), connect(null, { setUser }))(LoginBox);
