import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { Card, CardContent, Chip, Icon, Avatar, Grid, Typography, Box, Container } from '@material-ui/core';
import clsx from 'clsx';

class HideColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  handleClick = (index) => {
    this.props.onHideColumn(index)
  }

  handleSelectAll = () => {
    this.props.onHideColumn(-1)
  }

  render() {
    const { classes } = this.props;

    return (
      <Card elevation={0} className={classes.root}>
        <CardContent style={{ marginBottom: 0, paddingBottom: 0 }}>
          <Chip
            color="secondary"
            variant={this.props.columnHide.every(x => x.show === true) ? 'default' : 'outlined'}
            icon={<Icon className={clsx('fas fa-check-circle')} />}
            label={'Select All'}
            className={classes.chip}
            onClick={() => this.handleSelectAll()} />
        </CardContent>
        <CardContent>
          {
            this.props.columnHide.map((item, index) => {
              return (
                <Chip
                  key={index}
                  variant="outlined"
                  color={item.show ? 'primary' : 'default'}
                  deleteIcon={<Icon className={clsx(classes.smallFilter, 'far fa-trash-alt')} />}
                  onClick={() => this.handleClick(index)}
                  label={item.name}
                  avatar={<Avatar>
                    {
                      item.type === 'string' ?
                        // <Icon className={clsx(classes.smallFilter, 'fas fa-font')} />
                        "T"
                        : item.type === 'number' ?
                          // <Icon className={clsx(classes.smallFilter, 'fas fa-sort-numeric-up-alt')} />
                          "9"
                          : item.type === 'object' ?
                            <Icon className={clsx(classes.smallFilter, 'fas fa-ellipsis-h')} />
                            :
                            "?"
                    }
                  </Avatar>}
                  // icon={
                  //   item.type === 'string' ?
                  //     <Icon className={clsx(classes.smallFilter, 'fas fa-font')} />
                  //     : item.type === 'numeric' ?
                  //       // <Icon className={clsx(classes.smallFilter, 'far fa-trash-alt')} />
                  //       9
                  //       : item.type === 'object' ?
                  //         <Icon className={clsx(classes.smallFilter, 'fas fa-list')} />
                  //         :
                  //         <Icon className={clsx(classes.smallFilter, 'fas fa-question')} />
                  // }
                  className={classes.chip}
                  style={item.show ? null : { color: 'darkgrey' }}
                />
              )
            })
          }
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            className="m-4"
            style={{ paddingTop: '1em', color: 'darkgrey' }}
          >
            &nbsp;<b style={{ fontSize: 20, color: '#2E84CF' }}>S</b>  &nbsp;means this column is text;
                &nbsp;<b style={{ fontSize: 20, color: '#2E84CF' }}>9</b> &nbsp; means this column is numeric;&nbsp;
                <Icon className='fas fa-ellipsis-h' style={{ fontSize: 20, color: '#2E84CF' }} />&nbsp; means this column contains a list;
                &nbsp;<b style={{ fontSize: 20, color: '#2E84CF' }}>?</b>&nbsp; means this column's type is not any of above 3.
          </Grid>
        </CardContent>
      </Card >
    )
  }
}

HideColumn.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    width: 1000,
    maxHeight: 600,
    overflowY: 'auto'
  },
  chip: {
    margin: theme.spacing(0.8),
    // textShadow: 'none',
    // '&:hover': {
    //   textShadow: '-0.06ex 0 white, 0.06ex 0 white'
    // }
  },
  smallFilter: {
    fontSize: 12,
    margin: theme.spacing(0),
  },
});

export default compose(withStyles(styles))(HideColumn)
