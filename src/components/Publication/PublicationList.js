import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import compose from 'recompose/compose';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import paperlist from '../../assets/js/paperlist';

const styles = (theme) => ({
	root: {
		padding: '4em 0em 4em 0em',
		backgroundColor: '#eeeeee'
	},
	paper: {
		textAlign: 'center',
		color: theme.palette.text.secondary
	},
	paperlink: {
		textDecoration: 'none',
		color: '#2E84CF'
	},
	paperbox: {
		textIndent: '-1.35em',
		paddingLeft: '4em'
	}
});

class PublicationList extends React.Component {
	render() {
		const { classes } = this.props;
		const pl = paperlist;

		return (
			<div className={classes.root}>
				<Container maxWidth='md'>
					{pl.map((section) => {
						return (
							<Typography component='div'>
								<Box fontWeight='fontWeightBold' fontSize='h4.fontSize' m={1}>
									{section.title}
								</Box>
								{section.data.map((subsection) => {
									return (
										<div>
											<Box fontWeight='fontWeightBold' fontSize='h5.fontSize' m={1}>
												{subsection.subtitle}
											</Box>
											{subsection.publications.map((paper, index) => {
												return (
													<Box className={classes.paperbox} fontSize='subtitle1.fontSize' m={1}>
														{index + 1} .{' '}
														<a className={classes.paperlink} href={paper.link}>
															{paper.title}
														</a>
														{paper.display}
													</Box>
												);
											})}
										</div>
									);
								})}
							</Typography>
						);
					})}
				</Container>
			</div>
		);
	}
}

PublicationList.propTypes = {
	classes: PropTypes.object.isRequired,
	width: PropTypes.oneOf([ 'lg', 'md', 'sm', 'xl', 'xs' ]).isRequired
};

export default compose(withStyles(styles), withWidth())(PublicationList);
