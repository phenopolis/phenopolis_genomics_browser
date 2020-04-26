import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { TableCell, ButtonGroup, Button, Chip } from '@material-ui/core';

class StickyHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {

    const { stickyHeight, stickyWidth, headerColumns, classes } = this.props;
    // let value = "Cell " + rowIndex + ", " + columnIndex;

    const baseStyle = {
      height: stickyHeight,
      width: stickyWidth
    };
    const scrollableStyle = {
      left: stickyWidth
    };

    return (
      <div className={classes.stickyGridHeader}>
        {/* <div className={"sticky-grid__header__base"} style={baseStyle}>
        Sticky Base
      </div> */}
        <div className={"sticky-grid__header__scrollable"} style={scrollableStyle}>
          {
            headerColumns.map(({ label, ...style }, i) => {
              return (
                <div
                  className={classes.stickyGridHeaderScrollableColumn}
                  style={style}
                  key={i}>
                  {label}
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}

StickyHeader.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  stickyGridHeader: {
    position: 'sticky',
    top: '0',
    left: '0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: '3'
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
  }
});

export default withStyles(styles)(StickyHeader)