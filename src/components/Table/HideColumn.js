import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { Card, CardContent, Chip, Icon, Avatar, Grid, Tooltip } from '@material-ui/core';
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
    const { classes, columnHide } = this.props;

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
            columnHide.map((item, index) => {

              return (
                <Tooltip key={index} title={item.des} placement='top'>
                  <Chip
                    key={index}
                    variant="outlined"
                    color='default'
                    // color={item.show ? 'black' : 'default'}
                    // deleteIcon={<Icon className={clsx(classes.smallFilter, 'far fa-trash-alt')} />}
                    onClick={() => this.handleClick(index)}
                    label={item.name}
                    avatar={
                      item.type === 'string' ?
                        <Avatar style={{ backgroundColor: "#26a69a", color: 'white' }}>T</Avatar>
                        : item.type === 'number' ?
                          <Avatar style={{ backgroundColor: "#ef5350", color: 'white' }}>9</Avatar>
                          : item.type === 'object' ?
                            <Avatar style={{ backgroundColor: "#42a5f5", color: 'white' }}>
                              <Icon className={clsx(classes.smallFilter, 'fas fa-ellipsis-h')} />
                            </Avatar>
                            :
                            <Avatar style={{ backgroundColor: "black", color: 'white' }}>?</Avatar>
                    }
                    className={classes.chip}
                    style={item.show ? { color: 'white', fontWeight: "900", backgroundColor: "#9e9e9e" } : { color: 'darkgrey' }}
                  />
                </Tooltip>
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
            <Avatar className={classes.smallAvatar} style={{ backgroundColor: "#26a69a", color: 'white' }}>T</Avatar> means this column is text;
              <Avatar className={classes.smallAvatar} style={{ backgroundColor: "#ef5350", color: 'white' }}>9</Avatar>means this column is numeric;
              <Avatar className={classes.smallAvatar} style={{ backgroundColor: "#42a5f5", color: 'white' }}>
              <Icon className={clsx(classes.smallFilter, 'fas fa-ellipsis-h')} />
            </Avatar>means this column contains a list;
            <Avatar className={classes.smallAvatar} style={{ backgroundColor: "black", color: 'white' }}>?</Avatar>means this column's type is not any of above 3.
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
  smallAvatar: {
    fontSize: 12,
    margin: theme.spacing(0),
    width: theme.spacing(3),
    height: theme.spacing(3),
    margin: theme.spacing(1)
  },
  smallFilter: {
    fontSize: 12,
    margin: theme.spacing(0),
  },
});

export default compose(withStyles(styles))(HideColumn)
