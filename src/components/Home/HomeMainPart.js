import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';

import { Parallax } from 'react-parallax';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = (theme) => ({
	button: {
		margin: theme.spacing(1)
	}
});

class HomeMainPart extends React.Component {
	render() {
		const { classes } = this.props;

		return (
			<div>
				<Parallax
					bgImage={
						'https://images.unsplash.com/photo-1498092651296-641e88c3b057?auto=format&fit=crop&w=1778&q=60&ixid=dW5zcGxhc2guY29tOzs7Ozs%3D'
					}
					strength={500}>
					<div style={{ height: 500 }}>
						<Grid container justify='center'>
							<Box display='flex' alignItems='center' css={{ height: 500 }}>
								<div style={{ 'text-align': 'center' }}>
									<Typography variant='h2' align='center' gutterBottom>
										Phenopolis
									</Typography>
									<Typography variant='h6' align='center' gutterBottom>
										Harmonization & Analysis of Sequencing & Phenotype Data
									</Typography>
									<Button variant='outlined' color='inherit' className={classes.button}>
										LOGIN AS DEMO USER
									</Button>
								</div>
							</Box>
						</Grid>
					</div>
				</Parallax>
			</div>
		);
	}
}

HomeMainPart.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

export default compose(withStyles(styles), withWidth())(HomeMainPart);
