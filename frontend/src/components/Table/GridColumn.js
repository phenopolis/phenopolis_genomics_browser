import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import '../../assets/css/arrowbox.css';

import { TableCell, Typography, ButtonGroup, Button, IconButton, Tooltip } from '@material-ui/core';

import TypeChip from '../Chip/TypeChip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrashAlt } from '@fortawesome/pro-solid-svg-icons';

class GridColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mystyle: {},
    };
  }
  componentWillMount() {
    // if (this.props.columnIndex == 0) {
    //   this.props.data.rowStatus(this.props.rowIndex, true);
    // }

    const mystyle = JSON.parse(JSON.stringify(this.props.style));
    mystyle['backgroundColor'] = 'white';

    let key = this.props.data.columns[this.props.columnIndex].key;
    if (key === 'action') {
      mystyle['backgroundColor'] = '#f8f9ff';
    }

    if (this.props.data.highlightRow === this.props.rowIndex) {
      mystyle.backgroundColor = '#fff9c4';
    }

    this.setState({ mystyle: mystyle });
  }

  componentWillReceiveProps(nextProps) {
    // var mystyle = nextProps.style
    let mystyle = {};
    if (
      (nextProps.data.currentRow === nextProps.rowIndex) |
      (nextProps.data.currentColumn === nextProps.columnIndex)
    ) {
      mystyle = JSON.parse(JSON.stringify(nextProps.style));
      mystyle.backgroundColor = '#eeee';
    } else {
      mystyle = JSON.parse(JSON.stringify(nextProps.style));
      mystyle.backgroundColor = 'white';

      let key = this.props.data.columns[this.props.columnIndex].key;
      if (key === 'action') {
        mystyle['backgroundColor'] = '#f8f9ff';
      }
    }

    this.setState({ mystyle: mystyle });
  }

  componentWillUnmount() {
    // if (this.props.columnIndex == 0) {
    //   this.props.data.rowStatus(this.props.rowIndex, false);
    // }
  }

  myfunction = () => {
    this.props.data.toggleItemActive(this.props.rowIndex, this.props.columnIndex);
  };

  triggerAction = (action) => {
    this.props.data.toggleAction(this.props.rowIndex, action);
  };

  render() {
    const { data, rowIndex, columnIndex, classes } = this.props;

    var key = data.columns[columnIndex].key;
    let cellData = data.rows[rowIndex][key];
    var h = data.columns[columnIndex];

    return (
      <TableCell
        className={classes.tableCell}
        id={rowIndex + 1 + ',' + (columnIndex + 1)}
        style={this.state.mystyle}
        onMouseEnter={this.myfunction}>
        {key === 'action' ? (
          <div>
            <span>
              <Tooltip title="Update User Information/Files" placement="top">
                <IconButton
                  className="bg-white text-third ml-1"
                  style={{ width: 30, height: 30, padding: 0, border: '0.5px solid #616161' }}
                  aria-label="update"
                  onClick={() => this.triggerAction('update')}>
                  <FontAwesomeIcon icon={faPencil} style={{ fontSize: '12' }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete This User" placement="top">
                <IconButton
                  className="bg-white text-third ml-1"
                  style={{ width: 30, height: 30, padding: 0, border: '0.5px solid #f44336' }}
                  aria-label="delete"
                  color="secondary"
                  onClick={() => this.triggerAction('delete')}>
                  <FontAwesomeIcon icon={faTrashAlt} style={{ fontSize: '12' }} />
                </IconButton>
              </Tooltip>
            </span>
          </div>
        ) : (
            <div>
              {(typeof cellData !== 'object') | (cellData === null) ? (
                <Typography variant="body2" gutterBottom>
                  {cellData}
                </Typography>
              ) : (typeof cellData[0] === 'object') & (cellData[0] !== null) ? (
                cellData.map((chip, j) => {
                  if (chip !== null) {
                    if (h.base_href) {
                      return (
                        <TypeChip
                          label={chip.display}
                          type={h.base_href.replace(/[^a-zA-Z0-9_-]/g, '')}
                          size="small"
                          action="forward"
                          popover={true}
                          to={
                            chip.end_href
                              ? (h.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                              : (h.base_href + '/' + chip.display).replace(/\/\//g, '/')
                          }
                        />
                      );
                    } else {
                      return chip.display;
                    }
                  } else {
                    return null;
                  }
                })
              ) : (
                    <div>{cellData.join(', ')}</div>
                  )}
            </div>
          )}
      </TableCell>
    );
  }
}

GridColumn.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
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
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
    },
  },
  tooltip: {
    fontSize: '3em',
  },
  popover: {
    pointerEvents: 'none',
    marginLeft: '0.2em',
  },
  paperPopover: {
    padding: theme.spacing(1),
    color: 'white',
    backgroundColor: 'transparent',
  },
  namegrid: {
    borderRight: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
  },
  datagrid: {
    borderBottom: '1px solid #e0e0e0',
  },
});

export default withStyles(styles)(GridColumn);
