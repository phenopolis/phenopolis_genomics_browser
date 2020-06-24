import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/arrowbox.css';

import {
  TableCell,
  Chip,
  Typography,
  Popover,
  Container,
  CircularProgress,
  Grid,
} from '@material-ui/core';

class GridColumn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mystyle: {},
      anchorEl: null,
      previewName: null,
      previewInfo: null,
      previewLoaded: false,
    };
  }
  componentWillMount() {
    var mystyle = JSON.parse(JSON.stringify(this.props.style));
    mystyle['backgroundColor'] = 'white';
    this.setState({ mystyle: mystyle });
  }

  componentWillReceiveProps(nextProps) {
    // var mystyle = nextProps.style

    if (
      (nextProps.data.currentRow === nextProps.rowIndex) |
      (nextProps.data.currentColumn === nextProps.columnIndex)
    ) {
      var mystyle = JSON.parse(JSON.stringify(nextProps.style));
      mystyle.backgroundColor = '#eeee';
      this.setState({ mystyle: mystyle });
    } else {
      var mystyle = JSON.parse(JSON.stringify(nextProps.style));
      mystyle.backgroundColor = 'white';
      this.setState({ mystyle: mystyle });
    }
  }

  myfunction = () => {
    this.props.data.toggleItemActive(this.props.rowIndex, this.props.columnIndex);
  };

  getPreviewInformation = (link) => {
    var self = this;
    axios
      .get('/api/' + link + '/preview', {
        withCredentials: true,
      })
      .then((res) => {
        let respond = res.data;
        self.setState({
          previewInfo: respond[0],
          previewLoaded: true,
        });
      })
      .catch((err) => {});
  };

  handlePopoverOpen = (name, link, event) => {
    this.setState({ anchorEl: event.currentTarget, previewName: name });
    this.getPreviewInformation(link);
  };

  handlePopoverClose = () => {
    this.setState({
      anchorEl: null,
      previewInfo: [],
      previewName: null,
      previewLoaded: false,
    });
  };

  render() {
    const { data, index, rowIndex, columnIndex, style, classes } = this.props;

    const open = Boolean(this.state.anchorEl);

    var key = data.columns[columnIndex].key;
    let cellData = data.rows[rowIndex][key];
    var h = data.columns[columnIndex];

    var currentRow = data.currentRow;

    return (
      <TableCell
        // className={"sticky-grid__data__column"}
        className={classes.tableCell}
        id={rowIndex + 1 + ',' + (columnIndex + 1)}
        style={this.state.mystyle}
        onMouseEnter={this.myfunction}>
        <div>
          {(typeof cellData !== 'object') | (cellData === null) ? (
            <Typography variant="body2" gutterBottom>
              {cellData}
            </Typography>
          ) : (typeof cellData[0] === 'object') & (cellData[0] !== null) ? (
            cellData.map((chip, j) => {
              if (chip !== null) {
                return (
                  <Chip
                    key={j}
                    size="small"
                    variant="outlined"
                    label={chip.display}
                    className={classes.chip}
                    component={Link}
                    to={
                      chip.end_href
                        ? (h.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                        : (h.base_href + '/' + chip.display).replace(/\/\//g, '/')
                    }
                    clickable
                    aria-owns={open ? 'mouse-over-popover' : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event) =>
                      this.handlePopoverOpen(
                        chip.display,
                        chip.end_href
                          ? (h.base_href + '/' + chip.end_href).replace(/\/\//g, '/')
                          : (h.base_href + '/' + chip.display).replace(/\/\//g, '/'),
                        event
                      )
                    }
                    onMouseLeave={this.handlePopoverClose}
                  />
                );
              } else {
                return null;
              }
            })
          ) : (
            <div>{cellData.join(',')}</div>
          )}
        </div>

        <Popover
          id="mouse-over-popover"
          className={classes.popover}
          classes={{
            paper: classes.paperPopover,
          }}
          open={open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
          elevation={0}>
          <Container
            className="arrow_box"
            style={
              this.state.previewLoaded !== true
                ? { 'border-bottom-left-radius': '0.3em', 'border-bottom-right-radius': '0.3em' }
                : { 'border-bottom-left-radius': '0em', 'border-bottom-right-radius': '0em' }
            }>
            <Typography variant="subtitle1" style={{ 'font-weight': 'bold', color: 'yellow' }}>
              {this.state.previewName}

              {this.state.previewLoaded !== true ? (
                <small style={{ color: 'white' }}>
                  {' '}
                  &nbsp;(Loading ...
                  <CircularProgress size={18} color="white" />
                  &nbsp; &nbsp;)
                </small>
              ) : null}
            </Typography>
          </Container>

          {this.state.previewLoaded === true && (
            <Container
              style={{
                background: '#242424',
                'min-width': '25em',
                'border-bottom-left-radius': '0.3em',
                'border-bottom-right-radius': '0.3em',
                'padding-bottom': '1em',
              }}>
              {this.state.previewInfo === null ? (
                <span> Can not Fetch preview information </span>
              ) : (
                this.state.previewInfo.preview.map((item, index) => {
                  return (
                    <Grid container spacing={1} key={index} className={classes.blockgrid}>
                      <Grid item xs={4} className={classes.namegrid}>
                        {item[0]}
                      </Grid>

                      <Grid item xs={8} className={classes.datagrid}>
                        {item[1]}
                      </Grid>
                    </Grid>
                  );
                })
              )}
            </Container>
          )}
        </Popover>
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
    borderRight: '1px solid lightgray',
    borderBottom: '1px solid lightgray',
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
    borderRight: '1px solid gray',
    borderBottom: '1px solid gray',
  },
  datagrid: {
    borderBottom: '1px solid gray',
  },
});

export default withStyles(styles)(GridColumn);
