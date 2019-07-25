import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Parallax } from 'react-parallax';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = (theme) => ({
	button: {
		margin: theme.spacing(1)
	},
	bannertext: {
		textAlign: 'center',
		color: 'white'
	}
});

class HomeBanner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			BannerText: null
		};
	}

	render() {
		const { classes } = this.props;

		return (
			<div>
				<Parallax bgImage={require('../../assets/image/Homebanner.jpg')} strength={500}>
					<div style={{ height: 500 }}>
						<Grid container justify='center'>
							<Box display='flex' alignItems='center' css={{ height: 500 }}>
								<div className={classes.bannertext}>
									<Typography variant='h2' align='center' gutterBottom>
										{this.props.BannerText}
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

HomeBanner.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomeBanner);
