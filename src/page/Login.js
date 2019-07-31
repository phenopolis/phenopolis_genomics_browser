import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { setUser } from '../redux/actions';
import { getUsername } from '../redux/selectors';

import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';

import LoginBox from '../components/AppBar/LoginBox';

const mapStateToProps = (state) => ({ reduxName: getUsername(state) });

const styles = (theme) => ({
	root: {
		height: 'calc(100vh - 64px)',
		position: 'relative',
		backgroundColor: '#eeeeee',
		padding: '4em'
	},
	paper2: {
		padding: theme.spacing(5)
	}
});

class Login extends React.Component {
	getReduxName() {
		return this.props.reduxName;
	}

	render() {
		const { classes } = this.props;

		return (
			<div>
				<CssBaseline />
				{this.props.reduxName === '' ? (
					<LoginBox onLoginSuccess={() => {}}>/</LoginBox>
				) : (
					<div className={classes.root}>
						<Container maxWidth='md'>
							<Paper className={classes.paper2}>
								<Typography component='div'>
									<Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
										You have logge in.
									</Box>
									<Box fontWeight='fontWeightLight' m={1}>
										If you want to log out, click Account Icon on the top right of the page.
									</Box>
								</Typography>
							</Paper>
						</Container>
					</div>
				)}
			</div>
		);
	}
}

Login.propTypes = {
	classes: PropTypes.object.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, { setUser }))(Login);
