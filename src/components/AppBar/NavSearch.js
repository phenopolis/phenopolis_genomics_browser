import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import axios from 'axios';

import { fade, withStyles } from '@material-ui/core/styles';
import {
	Paper,
	Container,
	Box,
	Typography,
	TextField,
	Grid,
	CircularProgress,
	Collapse,
	Chip,
	InputBase
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

class NavSearch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchContent: '',
			redirect: false,
			guesslink: '',
			autoCompleteContent: null,
			searchLoaded: false
		};
	}

	handleSearch = (guess) => {
		var guessText = guess;
		if (guessText === 'default') {
			guessText = this.state.searchContent;
		}

		axios
			.get('/api/best_guess?query=' + guessText, { withCredentials: true })
			.then((res) => {
				console.log(res);
				this.setState({ redirect: true, guesslink: res.data.redirect });
			})
			.catch((err) => {
				window.alert('Best guess Failed.');
			});
	};

	handlesearchChange = (event) => {
		this.setState({ searchContent: event.target.value });

		this.changeName(event);
	};

	changeName = (event) => {
		var searchText = event.target.value; // this is the search text

		let self = this;
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			if (searchText !== '') {
				self.autocomplete(searchText);
			} else {
				self.setState({ autoCompleteContent: null, searchLoaded: false });
			}
		}, 500);
	};

	autocomplete = (searchText) => {
		this.setState({ autoCompleteContent: null, searchLoaded: true });
		let self = this;
		axios
			.get('/api/autocomplete/' + searchText, { withCredentials: true })
			.then((res) => {
				console.log(res.data);
				self.setState({ autoCompleteContent: res.data, searchLoaded: false });
			})
			.catch((err) => {
				window.alert('autocomplete failed.');
			});
	};

	render() {
		const { classes } = this.props;
		if (this.state.redirect) {
			return <Redirect to={this.state.guesslink} />;
		}

		return (
			<div className={classes.search}>
				<div className={classes.searchIcon}>
					{this.state.searchLoaded !== true ? (
						<SearchIcon className={classes.searchIcon} />
					) : (
						<CircularProgress size={20} color='secondary' />
					)}
				</div>
				<InputBase
					placeholder='Search for a phenotype, patient, gene, variant or region…'
					classes={{
						root: classes.inputRoot,
						input: classes.inputInput
					}}
					inputProps={{ 'aria-label': 'search' }}
					value={this.state.searchContent}
					onChange={this.handlesearchChange}
				/>
				{this.state.searchLoaded === true || this.state.autoCompleteContent !== null ? (
					<div
						style={{
							backgroundColor: 'white',
							borderRadius: '0.3em',
							position: 'absolute',
							top: '2.8em',
							left: '0px',
							width: '100%',
							padding: '0.5em',
							paddingTop: '0.8em',
							paddingBottom: '0.8em',
							border: '1px solid #2E84CF'
						}}>
						<Collapse in={this.state.searchLoaded === true || this.state.autoCompleteContent !== null}>
							<Paper elevation={0} className={classes.paperCollapse}>
								<Grid container justify='center'>
									{this.state.searchLoaded === true ? (
										<Typography variant='subtitle1' gutterBottom>
											Searching for auto completing...
										</Typography>
									) : this.state.autoCompleteContent !== null ? this.state.autoCompleteContent.length > 0 ? (
										this.state.autoCompleteContent.map((item, index) => {
											return (
												<Chip
													key={index}
													size='small'
													label={item}
													className={classes.chip}
													clickable
													variant='outlined'
													onClick={(event) => this.handleSearch(event, item)}
												/>
											);
										})
									) : (
										<Typography variant='subtitle1' gutterBottom>
											Sorry, we did not get any auto completing options...So sad.
										</Typography>
									) : (
										<Typography variant='subtitle1' gutterBottom>
											Nothing for search.
										</Typography>
									)}
								</Grid>
							</Paper>
						</Collapse>
					</div>
				) : (
					<div />
				)}
			</div>
		);
	}
}

NavSearch.propTypes = {
	classes: PropTypes.object.isRequired
};

const styles = (theme) => ({
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25)
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto'
		}
	},
	searchIcon: {
		width: theme.spacing(7),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	inputRoot: {
		color: 'inherit'
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 7),
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: 200
		}
	},
	chip: {
		margin: theme.spacing(0.5),
		padding: theme.spacing(0.5),
		textShadow: 'none',
		color: '#2E84CF',
		'&:hover': {
			textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
		}
	}
});

export default withStyles(styles)(NavSearch);
