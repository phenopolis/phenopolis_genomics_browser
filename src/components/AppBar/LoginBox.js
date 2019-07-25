import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

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
	},
	palette: {
		primary: '#2E84CF'
	}
});

class LoginBox extends React.Component {
	render() {
		const { classes } = this.props;

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
					<form className={classes.form} noValidate>
						<TextField
							className={classes.textfild}
							variant='outlined'
							margin='normal'
							required
							fullWidth
							id='name'
							label='User Name'
							name='name'
							autoFocus
						/>
						<TextField
							className={classes.textfild}
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
							type='button'
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

export default withStyles(styles)(LoginBox);
