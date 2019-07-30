import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { textAlign } from '@material-ui/system';

const styles = (theme) => ({
	root: {
		height: 'calc(100vh - 64px)',
		position: 'relative',
		backgroundColor: '#eeeeee',
		textAlign: 'center',
		padding: '4em'
	},
	paper: {
		padding: theme.spacing(5)
	}
});

class SearchBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			BannerText: null
		};
	}

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.root}>
				<Container maxWidth='md'>
					<Paper className={classes.paper}>
						<Typography component='div'>
							<Box fontWeight='fontWeightBold' fontSize='h3.fontSize' m={1}>
								Search Phenopolis
							</Box>
							<Box fontWeight='fontWeightLight' m={1}>
								An open platform for harmonization and analysis of sequencing and phenotype data.
							</Box>
						</Typography>
					</Paper>
				</Container>
			</div>
		);
	}
}

SearchBox.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SearchBox);
