import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { TableSortLabel, Tooltip } from '@material-ui/core';

const StyledTableSortLabel = withStyles({
  root: {
    color: 'white',
    fontWeight: '500',
    '&:hover': {
      color: 'white',
      fontWeight: '900',
    },
    '&$active': {
      color: 'white',
      fontWeight: '900',
    },
  },
  active: {},
  icon: {
    color: 'inherit !important',
  },
})(TableSortLabel);

const StyledTooltip = withStyles({
  tooltip: {
    fontSize: '0.9em',
  },
})(Tooltip);

class StickyHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  createSortHandler = (key) => (event) => {
    this.props.onRequestSort(event, key);
  };

  render() {
    const { stickyWidth, headerColumns, classes } = this.props;
    // let value = "Cell " + rowIndex + ", " + columnIndex;

    const scrollableStyle = {
      left: stickyWidth,
    };

    return (
      <div className={classes.stickyGridHeader}>
        {/* <div className={"sticky-grid__header__base"} style={baseStyle}>
        Sticky Base
      </div> */}
        <div className={'sticky-grid__header__scrollable'} style={scrollableStyle}>
          {headerColumns.map(({ label, des, key, ...style }, i) => {
            return (
              <StyledTooltip key={i} title={des} placement="top">
                <div className={classes.stickyGridHeaderScrollableColumn} style={style}>
                  <StyledTableSortLabel
                    active={this.props.orderBy === key}
                    direction={this.props.order}
                    onClick={this.createSortHandler(key)}>
                    {label}
                    {this.props.orderBy === key ? (
                      <span className={classes.visuallyHidden}>
                        {this.props.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </span>
                    ) : null}
                  </StyledTableSortLabel>
                  {/* {label} */}
                </div>
              </StyledTooltip>
            );
          })}
        </div>
      </div>
    );
  }
}

StickyHeader.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  stickyGridHeader: {
    position: 'sticky',
    top: '0',
    left: '0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '3',
  },
  stickyGridHeaderScrollableColumn: {
    position: 'absolute',
    backgroundColor: '#2E84CF',
    color: 'white',
    fontSize: '13px',
    fontWeight: '900',
    // display: 'flex',
    // flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    padding: '20px 0',
    // borderBottom: '1px solid lightgray',
    // borderRight: '1px solid lightgray'
  },
  sortlabel: {
    color: 'red',
    fontWeight: '500',
    '&:hover': {
      color: 'white',
      fontWeight: '900',
    },
  },
  activeSortLabel: {
    color: 'white',
    fontWeight: '900',
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
    width: 1,
  },
});

export default withStyles(styles)(StickyHeader);
