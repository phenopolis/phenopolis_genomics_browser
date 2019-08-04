import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import TableHeader from '../Table/TableHeader';
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
	},
	pagination: {
		float: 'right',
		border: '0px'
	}
});

function desc(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [ el, index ]);
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0]);
		if (order !== 0) return order;
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

function getSorting(order, orderBy) {
	return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

class Variant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			variants: JSON.parse(JSON.stringify(this.props.variants.data)),
			header: JSON.parse(JSON.stringify(this.props.variants.colNames)),
			rowsPerPage: 10,
			page: 0,
			order: 'asc',
			orderBy: 'variant_id'
		};
	}

	handleChangePage = (event, newPage) => {
		this.setState({ page: newPage });
	};

	handleChangeRowsPerPage = (event) => {
		this.setState({ rowsPerPage: parseInt(event.target.value, 10) });
		this.setState({ page: 0 });
	};

	handleRequestSort = (event, property) => {
		const isDesc = this.state.orderBy === property && this.state.order === 'desc';
		this.setState({ order: isDesc ? 'asc' : 'desc' });
		this.setState({ orderBy: property });
	};

	render() {
		const { classes } = this.props;

		return (
			<React.Fragment>
				<CssBaseline />
				<Container maxWidth='xl'>
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
							<Grid container direction='column' justify='center' alignItems='stretch'>
								<Grid item xs={12}>
									<TablePagination
										className={classes.pagination}
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
								</Grid>
								<Grid item xs={12}>
									<div className={classes.tableWrapper}>
										<Table className={classes.table}>
											<TableHeader
												header={this.state.header}
												order={this.state.order}
												orderBy={this.state.orderBy}
												onRequestSort={this.handleRequestSort}
											/>
											<TableBody>
												{stableSort(this.state.variants, getSorting(this.state.order, this.state.orderBy))
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
								</Grid>
								<Grid item xs={12}>
									<TablePagination
										rowsPerPageOptions={[ 10, 25, 50, 75, 100 ]}
										className={classes.pagination}
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
								</Grid>
							</Grid>
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
