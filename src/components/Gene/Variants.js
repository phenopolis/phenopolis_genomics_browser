import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

import TablePaginationActions from '../Table/TablePaginationActions';

const styles = (theme) => ({
	paper: {
		padding: theme.spacing(3),
		marginTop: theme.spacing(5)
	},
	root: {
		width: '100%',
		marginTop: theme.spacing(3)
	},
	tableWrapper: {
		overflowX: 'auto'
	},
	table: {
		Width: '100%'
	},
	head: {
		backgroundColor: 'black',
		color: 'white'
	},
	headcell: {
		color: 'white',
		fontSize: '1.1em'
	},
	tableRow: {
		'&:hover': {
			textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
			backgroundColor: '#f5f5f5'
		}
	},
	chip: {
		margin: theme.spacing(0.5),
		textShadow: 'none',
		color: '#2E84CF',
		'&:hover': {
			textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
		}
	}
});

class Variant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			variants: JSON.parse(JSON.stringify(this.props.variants.data)),
			header: JSON.parse(JSON.stringify(this.props.variants.colNames)),
			rowsPerPage: 10,
			page: 0
		};
	}

	handleChangePage = (event, newPage) => {
		this.setState({ page: newPage });
	};

	handleChangeRowsPerPage = (event) => {
		this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
		this.setState({ page: 0 });
	};

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

						<div className={classes.root}>
							<TableFooter>
								<TablePagination
									rowsPerPageOptions={[ 25, 50, 75, 100 ]}
									count={this.state.variants.length}
									rowsPerPage={this.state.rowsPerPage}
									page={this.state.page}
									SelectProps={{
										inputProps: { 'aria-label': 'rows per page' },
										native: true
									}}
									onChangePage={this.handleChangePage}
									onChangeRowsPerPage={this.handleChangeRowsPerPage}
									ActionsComponent={TablePaginationActions}
								/>
							</TableFooter>
							<div className={classes.tableWrapper}>
								<Table className={classes.table}>
									<TableHead className={classes.head}>
										<TableRow>
											{this.state.header.map((h, i) => {
												if (h.default) {
													return (
														<TableCell align='center' key={i} className={classes.headcell}>
															{h.name}
														</TableCell>
													);
												} else {
													return <div />;
												}
											})}
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.variants
											.slice(
												this.state.page * this.state.rowsPerPage,
												this.state.page * this.state.rowsPerPage + this.state.rowsPerPage
											)
											.map((row, m) => {
												return (
													<TableRow key={m} className={classes.tableRow}>
														{this.state.header.map((h, i) => {
															if (h.default) {
																return (
																	<TableCell align='center' key={i}>
																		{typeof row[h.key] !== 'object' ? (
																			row[h.key]
																		) : (
																			row[h.key].map((chip, j) => {
																				return (
																					<Chip
																						key={m}
																						size='small'
																						label={chip.display}
																						className={classes.chip}
																						component='a'
																						href='#chip'
																						clickable
																					/>
																				);
																			})
																		)}
																	</TableCell>
																);
															} else {
																return <div />;
															}
														})}
													</TableRow>
												);
											})}
									</TableBody>
								</Table>
							</div>

							<TableFooter>
								<TablePagination
									rowsPerPageOptions={[ 10, 25, 50, 75, 100 ]}
									count={this.state.variants.length}
									rowsPerPage={this.state.rowsPerPage}
									page={this.state.page}
									SelectProps={{
										inputProps: { 'aria-label': 'rows per page' },
										native: true
									}}
									onChangePage={this.handleChangePage}
									onChangeRowsPerPage={this.handleChangeRowsPerPage}
									ActionsComponent={TablePaginationActions}
								/>
							</TableFooter>
						</div>
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
