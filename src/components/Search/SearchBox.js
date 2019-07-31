import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';

const styles = (theme) => ({
	root: {
		height: 'calc(100vh - 64px)',
		position: 'relative',
		backgroundColor: '#eeeeee',
		padding: '4em'
	},
	paper: {
		padding: theme.spacing(5)
	},
	margin: {
		margin: '3em'
	},
	searchIcon: {
		fontSize: '4em',
		color: '#2E84CF'
	},
	input: {
		width: '100%'
	},
	resizeFont: {
		fontSize: 30,
		fontWeight: 'bolder'
	},
	example: {
		color: '#2E84CF'
	},
	link: {
		textDecoration: 'none',
		color: '#2E84CF',
		padding: '0em 0.5em 0em 0.5em',
		'&:hover': {
			textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
		}
	}
});

const CssTextField = withStyles({
	root: {
		'& label.Mui-focused': {
			color: '#2E84CF'
		},
		'& .MuiInput-underline:after': {
			borderBottomColor: '#2E84CF'
		},
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: '#2E84CF'
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

class SearchBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			examples: [
				{ name: 'TTLL5', type: '(Gene)', to: '/gene/ENSG00000119685' },
				{ name: 'Nystagmus', type: '(HPO Phenotype)', to: '/hpo/HP:0000639' },
				{ name: 'PH00008257', type: '(Patient)', to: '/individual/WebsterURMD_Sample_GV4344' },
				{ name: '22-38212762-A-G', type: '(Variant)', to: '/variant/22-38212762-A-G' }
			]
		};
	}

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.root}>
				<Container maxWidth='lg'>
					<Paper className={classes.paper}>
						<Typography component='div'>
							<Box fontWeight='fontWeightBold' fontSize='h3.fontSize' m={1}>
								Search Phenopolis
							</Box>
							<Box fontWeight='fontWeightLight' m={1}>
								An open platform for harmonization and analysis of sequencing and phenotype data.
							</Box>
						</Typography>

						<div className={classes.margin}>
							<Grid container spacing={1} alignItems='flex-end'>
								<Grid item>
									<SearchIcon className={classes.searchIcon} />
								</Grid>
								<Grid item xs={8}>
									<CssTextField
										className={classes.input}
										InputProps={{
											classes: {
												input: classes.resizeFont
											}
										}}
										id='input-with-icon-grid'
										label='Search for a phenotype, patient, gene, variant or region.'
										autoFocus={true}
									/>
								</Grid>
							</Grid>
							<Typography component='div'>
								<Box className={classes.example} fontWeight='fontWeightLight' m={2}>
									Examples:
									{this.state.examples.map((item, index) => {
										return (
											<span>
												<Link className={classes.link} to={item.to}>
													{item.name + item.type}
												</Link>
												&bull;
											</span>
										);
									})}
								</Box>
							</Typography>
						</div>
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
