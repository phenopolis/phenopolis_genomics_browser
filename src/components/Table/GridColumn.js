import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { TableCell, ButtonGroup, Button, Chip } from '@material-ui/core';

class GridColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {

    const { data, index, rowIndex, columnIndex, style, classes } = this.props;
    // let value = "Cell " + rowIndex + ", " + columnIndex;

    var key = Object.keys(data[rowIndex])[columnIndex];
    let cellData = data[rowIndex][key]

    return (
      <TableCell
        // className={"sticky-grid__data__column"} 
        className={classes.tableCell}
        id={rowIndex + 1 + "," + (columnIndex + 1)}
        style={style}>
        <div>
          {typeof cellData === 'object' ? (
            cellData.map((chip, j) => {
              if (chip !== null) {
                return (
                  <Chip
                    key={j}
                    size='small'
                    variant="outlined"
                    label={chip.display}
                    className={classes.chip}
                  />
                )
              } else {
                return null
              }
            })
          ) : cellData}
        </div>
      </TableCell>
    );
  }
}

GridColumn.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  tableCell: {
    padding: 2,
    display: 'flex',
    'flex-direction': 'row',
    'align-items': 'center',
    paddingLeft: '10px',
    borderRight: '1px solid lightgray',
    borderBottom: '1px solid lightgray',
    fontSize: '14px'
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

export default withStyles(styles)(GridColumn)