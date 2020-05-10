import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { TableCell, ButtonGroup, Button, Chip, Typography } from '@material-ui/core';

class GridColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mystyle: {}
    };
  }
  componentWillMount() {
    var mystyle = JSON.parse(JSON.stringify(this.props.style))
    mystyle['backgroundColor'] = 'white'
    this.setState({ mystyle: mystyle })
  }

  componentWillReceiveProps(nextProps) {
    // var mystyle = nextProps.style

    if (nextProps.data.currentRow === nextProps.rowIndex | nextProps.data.currentColumn === nextProps.columnIndex) {
      var mystyle = JSON.parse(JSON.stringify(nextProps.style))
      mystyle.backgroundColor = '#eeee'
      this.setState({ mystyle: mystyle })
    } else {
      // mystyle['backgroundColor'] = 'white'
      // console.log(nextProps.style)
      var mystyle = JSON.parse(JSON.stringify(nextProps.style))
      mystyle.backgroundColor = 'white'
      this.setState({ mystyle: mystyle })
    }
  }

  myfunction = () => {
    this.props.data.toggleItemActive(this.props.rowIndex, this.props.columnIndex)
  }

  render() {
    // console.log(this.props)

    const { data, index, rowIndex, columnIndex, style, classes } = this.props;

    var key = data.columns[columnIndex].key
    let cellData = data.rows[rowIndex][key]

    var currentRow = data.currentRow

    return (
      <TableCell
        // className={"sticky-grid__data__column"} 
        className={classes.tableCell}
        id={rowIndex + 1 + "," + (columnIndex + 1)}
        style={this.state.mystyle}
        onMouseEnter={this.myfunction}
      >
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
          ) :
            (
              <Typography variant="body2" gutterBottom >
                {cellData}
              </Typography>
            )}
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
    // display: 'flex',
    // 'flex-direction': 'row',
    // 'align-items': 'center',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingLeft: '10px',
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