import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Input from '@material-ui/core/Input';

const styles = (theme) => ({
	head: {
		backgroundColor: '#e0e0e0'
	},
	headcell: {
		fontSize: '1em'
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
	}
});

class Variant extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	createSortHandler = (property) => (event) => {
		this.props.onRequestSort(event, property);
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
								<TableCell align='center' key={i} className={classes.headcell}>
									<TableSortLabel
										className={classes.sortlabel}
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
									<Input
										placeholder='filter'
										className={classes.input}
										inputProps={{
											'aria-label': 'description'
										}}
									/>
								</TableCell>
							);
						} else {
							return <div />;
						}
					})}
				</TableRow>
			</TableHead>
		);
	}
}

Variant.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Variant);
