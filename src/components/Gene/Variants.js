import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const styles = (theme) => ({
	paper: {
		padding: theme.spacing(3),
		marginTop: theme.spacing(5)
	}
});

class Variant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { classes } = this.props;
		// const metadata = this.props.metadata;

		return (
			<React.Fragment>
				<CssBaseline />
				<Container maxWidth='lg'>
					<Paper className={classes.paper}>
						<Typography component='div'>
							<Box fontWeight='fontWeightBold' fontSize='h4.fontSize' mb={0}>
								Variants Analysis
							</Box>
							<Box fontWeight='fontWeightLight' mb={2}>
								Here are a list of variants found within this gene.
							</Box>
						</Typography>
					</Paper>
				</Container>
			</React.Fragment>
		);
	}
}

Variant.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Variant);
