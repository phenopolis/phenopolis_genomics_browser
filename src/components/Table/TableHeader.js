import React from 'react';
import PropTypes from 'prop-types';
import { fade, withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import InputBase from '@material-ui/core/InputBase';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

// **************************************************
const BootstrapInput = withStyles((theme) => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(3)
		}
	},
	input: {
		borderRadius: 4,
		marginTop: theme.spacing(2),
		position: 'relative',
		backgroundColor: theme.palette.common.white,
		border: '1px solid #ced4da',
		fontSize: 16,
		width: '80%',
		padding: '10px 12px',
		transition: theme.transitions.create([ 'border-color', 'box-shadow' ]),
		// Use the system font instead of the default Roboto font.
		fontFamily: [
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'Roboto',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"'
		].join(','),
		'&:focus': {
			boxShadow: `${fade('#2E84CF', 0.25)} 0 0 0 0.2rem`,
			borderColor: theme.palette.primary.main
		}
	}
}))(InputBase);

class FilterInput extends React.Component {
	constructor(props) {
		super(props);
		this.changeName = this.changeName.bind(this);
		this.timeout = 0;
		this.state = {
			column: JSON.parse(JSON.stringify(this.props.value.column)),
			name: ''
		};
	}

	changeName = (event) => {
		var searchText = event.target.value; // this is the search text
		var operation = null;
		var filter = '';

		let self = this;
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			// window.alert(searchText);

			switch (true) {
				case />=/.test(searchText):
					operation = '>=';
					filter = searchText.match(/>=(.*)/)[1];
					break;
				case />/.test(searchText):
					operation = '>';
					filter = searchText.match(/>(.*)/)[1];
					break;
				case /<=/.test(searchText):
					operation = '<=';
					filter = searchText.match(/<=(.*)/)[1];
					break;
				case /</.test(searchText):
					operation = '<';
					filter = searchText.match(/<(.*)/)[1];
					break;
				default:
					operation = 'search';
					filter = searchText;
					break;
			}

			if (filter === '') {
				operation = null;
				filter = '';
			}

			if (operation !== 'search') {
				filter = Number(filter);
			}

			if (!filter) {
				operation = null;
				filter = '';
			}
			self.props.onReturnFilter(operation, filter, self.props.index);
		}, 500);
	};

	render() {
		return <BootstrapInput placeholder='Filter' onChange={this.changeName} />;
	}
}

// **************************************************

const styles = (theme) => ({
	head: {
		backgroundColor: '#bdbdbd'
	},
	headcell: {
		fontSize: '1em',
		padding: '1em 0.25em 1em .25em',
		margin: 0
	},
	sortlabel: {
		color: 'white',
		'&:focus': {
			color: 'red'
		}
	},
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1
	},
	input: {
		margin: theme.spacing(1)
	},
	textField: {
		margin: theme.spacing(0),
		borderColor: 'lightgray',
		'&:focus': {
			color: '#2E84CF',
			backgroundColor: 'white'
		}
	},
	dense: {
		marginTop: theme.spacing(1)
	}
});

const StyledTooltip = withStyles({
	tooltip: {
		fontSize: '1em'
	}
})(Tooltip);

class TableHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	createSortHandler = (property) => (event) => {
		this.props.onRequestSort(event, property);
	};

	handleUpdateFilter = (operation, filter, index) => {
		this.props.onUpdateFilter(operation, filter, index);
	};

	render() {
		const { classes } = this.props;
		// const metadata = this.props.metadata;

		return (
			<TableHead className={classes.head}>
				<TableRow>
					{this.props.header.map((h, i) => {
						if (h.default) {
							return (
								<StyledTooltip title={h.description} placement='top'>
									<TableCell align='center' key={i} className={classes.headcell}>
										<Grid container direction='column' justify='center' alignItems='center'>
											<Grid item xs={12} style={{ height: '3em' }}>
												<TableSortLabel
													// className={classes.sortlabel}
													active={this.props.orderBy === h.key}
													direction={this.props.order}
													onClick={this.createSortHandler(h.key)}>
													{h.name}
													{this.props.orderBy === h.key ? (
														<span className={classes.visuallyHidden}>
															{this.props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
														</span>
													) : null}
												</TableSortLabel>
											</Grid>
											<Grid item xs={12}>
												<FilterInput value={this.props.filter[i]} index={i} onReturnFilter={this.handleUpdateFilter} />
											</Grid>
										</Grid>
									</TableCell>
								</StyledTooltip>
							);
						} else {
							return null;
						}
					})}
				</TableRow>
			</TableHead>
		);
	}
}

TableHeader.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TableHeader);
