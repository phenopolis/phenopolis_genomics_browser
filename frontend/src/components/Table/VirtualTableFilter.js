import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  FormControl,
  Avatar,
} from '@material-ui/core';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import { faPlus, faTrashAlt } from '@fortawesome/pro-duotone-svg-icons';

import ReactSelect from './ReactSelect';

const animatedComponents = makeAnimated();

class VirtualTableFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      anchorEl: null,
      anchorElString: null,
      anchorElNumber: null,
      anchorElObject: null,
      myfilter: [],
      operationOptions: {
        string: [
          { des: 'SubString', icon: '=' },
          { des: 'Equal to', icon: '==' },
          { des: 'Not Empty', icon: '∅' },
        ],
        number: [
          { des: 'SubString', icon: '=' },
          { des: 'Equal to', icon: '==' },
          { des: 'Greater than', icon: '>' },
          { des: 'No Smaller than', icon: '≥' },
          { des: 'Smaller than', icon: '<' },
          { des: 'No Larger than', icon: '≤' },
          { des: 'Not Empty', icon: '∅' },
        ],
        object: [
          { des: 'SubString', icon: '=' },
          { des: 'Include', icon: '⊂' },
          { des: 'Exclude', icon: '⊄' },
          { des: 'Not Empty', icon: '∅' },
        ],
        other: [
          { des: 'SubString', icon: '=' },
          { des: 'Equal to', icon: '==' },
          { des: 'Greater than', icon: '>' },
          { des: 'No Smaller than', icon: '≥' },
          { des: 'Smaller than', icon: '<' },
          { des: 'No Larger than', icon: '≤' },
          { des: 'Not Empty', icon: '∅' },
        ],
      },
      tmpFilter: 0,
    };
  }

  componentDidMount() {
    var tmpfilter = JSON.parse(JSON.stringify(this.props.tableFilter))
    if (tmpfilter.length > 0) {
      this.setState({ myfilter: tmpfilter });
    } else {
      this.setState({
        myfilter: [{
          inuse: true,
          column: null,
          operation: '=',
          value: [],
          andor: 'and',
        },]
      });
    }
  }

  handleAddNewFilter = () => {
    this.setState({
      myfilter: [
        ...this.state.myfilter,
        {
          inuse: true,
          column: null,
          operation: '=',
          value: [],
          andor: 'and',
        },
      ],
    });
  };

  handleCheckboxChange = (index) => {
    const newFilter = [...this.state.myfilter];
    newFilter[index].inuse = !newFilter[index].inuse;
    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });
  };

  handleSelectColumn = (selectOption, index) => {
    const newFilter = [...this.state.myfilter];
    newFilter[index].column = selectOption;

    if (selectOption === null) {
      newFilter[index].value = [];
    } else {
      if (selectOption.type === 'object') {
        newFilter[index].value = [];
      } else {
        newFilter[index].value = '';
      }
    }

    this.setState({ myfilter: newFilter });
  };

  handleSelectObjectChip = (event, newValue, index) => {
    const newFilter = [...this.state.myfilter];
    newFilter[index].value = newValue;
    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });
  };

  handleOperationOpen = (event, index, column) => {
    if (column.type === 'object') {
      this.setState({ anchorElObject: event.currentTarget, tmpFilter: index });
    } else if (column.type === 'string') {
      this.setState({ anchorElString: event.currentTarget, tmpFilter: index });
    } else if (column.type === 'number') {
      this.setState({ anchorElNumber: event.currentTarget, tmpFilter: index });
    } else {
      this.setState({ anchorEl: event.currentTarget, tmpFilter: index });
    }
  };

  handleOperationClose = () => {
    this.setState({
      anchorEl: null,
      anchorElObject: null,
      anchorElString: null,
      anchorElNumber: null,
    });
  };

  handleOperationChange = (operation) => {
    const newFilter = [...this.state.myfilter];
    newFilter[this.state.tmpFilter].operation = operation;

    if ((operation === '⊂') | (operation === '⊄')) {
      newFilter[this.state.tmpFilter].value = [];
    }

    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });

    this.handleOperationClose();
  };

  handleValueChange = (event, index) => {
    const newFilter = [...this.state.myfilter];
    newFilter[index].value = event.target.value;
    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });
  };

  handleAndOrChange = (index) => {
    const newFilter = [...this.state.myfilter];
    if (newFilter[index].andor === 'and') {
      newFilter[index].andor = 'or';
    } else {
      newFilter[index].andor = 'and';
    }
    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });
  };

  handleDeleteFilter = (index) => {
    const newFilter = [...this.state.myfilter];
    newFilter.splice(index, 1);
    this.setState({ myfilter: newFilter }, () => {
      this.handleSubmitFilter();
    });
  };

  handleSubmitFilter = () => {
    this.props.UpdateFilter(
      this.state.myfilter.filter((item) => (item.column !== null) & (item.inuse === true))
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <Card elevation={0} className={classes.root}>
        <CardContent>
          <Grid container className={classes.root} spacing={2}>
            <Grid item xs={12}>
              {this.state.myfilter.map((item, index) => {
                return (
                  <Grid container direction="row" justify="center" alignItems="center">
                    <Grid item xs={1}>
                      <FormControlLabel
                        value={item.inuse}
                        control={
                          <Checkbox checked={item.inuse} className="align-self-center mr-3" />
                        }
                        label={index + 1}
                        labelPlacement="start"
                        style={{ fontSize: 20 }}
                        onChange={() => this.handleCheckboxChange(index)}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <ReactSelect
                        currentValue={item.column}
                        placeholder="Select Column"
                        optionList={this.props.variableList.filter((x) => x.show)}
                        onSelectChange={(selectOption) =>
                          this.handleSelectColumn(selectOption, index)
                        }
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <div className="d-flex align-items-center justify-content-center">
                        <IconButton
                          disabled={item.column === null}
                          edge="start"
                          size="small"
                          color="primary"
                          component="span"
                          onClick={(event) => this.handleOperationOpen(event, index, item.column)}>
                          <Avatar
                            style={
                              item.column === null
                                ? { backgroundColor: 'lightgrey' }
                                : { backgroundColor: '#2E84CF' }
                            }>
                            <b>{item.operation}</b>
                          </Avatar>
                        </IconButton>
                      </div>

                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorEl}
                        keepMounted
                        open={Boolean(this.state.anchorEl)}
                        onClose={this.handleOperationClose}>
                        {this.state.operationOptions.other.map((operationItem, operationIndex) => {
                          return (
                            <MenuItem
                              key={operationIndex}
                              onClick={() => this.handleOperationChange(operationItem.icon)}>
                              <ListItemIcon>
                                <Typography variant="h5" noWrap>
                                  {operationItem.icon}
                                </Typography>
                              </ListItemIcon>
                              <Typography variant="body2" noWrap>
                                {operationItem.des}
                              </Typography>
                            </MenuItem>
                          );
                        })}
                      </Menu>

                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorElObject}
                        keepMounted
                        open={Boolean(this.state.anchorElObject)}
                        onClose={this.handleOperationClose}>
                        {this.state.operationOptions.object.map((operationItem, operationIndex) => {
                          return (
                            <MenuItem
                              key={operationIndex}
                              onClick={() => this.handleOperationChange(operationItem.icon)}>
                              <ListItemIcon>
                                <Typography variant="h5" noWrap>
                                  {operationItem.icon}
                                </Typography>
                              </ListItemIcon>
                              <Typography variant="body2" noWrap>
                                {operationItem.des}
                              </Typography>
                            </MenuItem>
                          );
                        })}
                      </Menu>

                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorElString}
                        keepMounted
                        open={Boolean(this.state.anchorElString)}
                        onClose={this.handleOperationClose}>
                        {this.state.operationOptions.string.map((operationItem, operationIndex) => {
                          return (
                            <MenuItem
                              key={operationIndex}
                              onClick={() => this.handleOperationChange(operationItem.icon)}>
                              <ListItemIcon>
                                <Typography variant="h5" noWrap>
                                  {operationItem.icon}
                                </Typography>
                              </ListItemIcon>
                              <Typography variant="body2" noWrap>
                                {operationItem.des}
                              </Typography>
                            </MenuItem>
                          );
                        })}
                      </Menu>

                      <Menu
                        id="simple-menu"
                        anchorEl={this.state.anchorElNumber}
                        keepMounted
                        open={Boolean(this.state.anchorElNumber)}
                        onClose={this.handleOperationClose}>
                        {this.state.operationOptions.number.map((operationItem, operationIndex) => {
                          return (
                            <MenuItem
                              key={operationIndex}
                              onClick={() => this.handleOperationChange(operationItem.icon)}>
                              <ListItemIcon>
                                <Typography variant="h5" noWrap>
                                  {operationItem.icon}
                                </Typography>
                              </ListItemIcon>
                              <Typography variant="body2" noWrap>
                                {operationItem.des}
                              </Typography>
                            </MenuItem>
                          );
                        })}
                      </Menu>
                    </Grid>
                    <Grid item xs={4}>
                      {item.column === null ? (
                        <FormControl fullWidth variant="outlined">
                          <TextField
                            disabled={item.column === null}
                            label="Value"
                            variant="outlined"
                            id="standard-size-small"
                            size="small"
                            value={item.value}
                            onChange={(event) => this.handleValueChange(event, index)}
                            className={classes.valueInput}
                          />
                        </FormControl>
                      ) : item.operation === '∅' ? null : (item.column.type === 'object') &
                        (item.operation !== '=') ? (
                          <Select
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            getOptionValue={(option) => option}
                            getOptionLabel={(option) => option}
                            options={item.column.chips}
                            menuPortalTarget={document.querySelector('body')}
                          />
                        ) : (
                          <FormControl fullWidth variant="outlined">
                            <TextField
                              disabled={item.column === null}
                              label="Value"
                              variant="outlined"
                              id="standard-size-small"
                              size="small"
                              value={item.value}
                              onChange={(event) => this.handleValueChange(event, index)}
                              className={classes.valueInput}
                            />
                          </FormControl>
                        )}
                    </Grid>
                    <Grid item xs={1}>
                      <div className="d-flex align-items-center justify-content-center">
                        {index !== this.state.myfilter.length - 1 ? (
                          <Button
                            size="small"
                            variant="contained"
                            color={item.andor === 'and' ? 'secondary' : 'primary'}
                            className={classes.andorButton}
                            onClick={() => this.handleAndOrChange(index)}>
                            {item.andor}
                          </Button>
                        ) : null}
                      </div>
                    </Grid>
                    <Grid item xs={1}>
                      <div className="d-flex align-items-center justify-content-center">
                        <IconButton
                          edge="start"
                          size="small"
                          color="inherit"
                          onClick={() => this.handleDeleteFilter(index)}>
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </IconButton>
                        <FontAwesomeIcon
                          icon={['fad', 'arrow-down']}
                          className="font-size-sm opacity-5"
                        />
                      </div>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          <Grid container direction="row" justify="center" alignItems="center">
            <Button color="primary" className="mt-1" onClick={this.handleAddNewFilter}>
              <span className="btn-wrapper--icon">
                <FontAwesomeIcon icon={faPlus} />
              </span>
              <span className="btn-wrapper--label">Add New Filter</span>
            </Button>
          </Grid>

          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            className="m-4"
            style={{ paddingTop: '1em', color: 'darkgrey', 'white-space': 'pre-wrap' }}>
            {`1. Firstly, please click Add New Filter button to create a new filter.
              "2. After that, you must firstly select one variable (table column). Based on two types of varaible (vector or list), two different filter mode would be presented in following opration and value section.
              "3. By click operation button, you may select one maths symbol to created a filtering operation for corresponding varaible.
              "4. Input (or select) value to finish one filter, the result should be present promptly by filtering table below.
              "5. If you have more than one filter, AND/OR button would show up, you may consider how to join your various filters.`}
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

VirtualTableFilter.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    width: 1000,
    maxHeight: 600,
    overflowY: 'auto',
  },
  media: {
    height: 80,
  },
  card: {
    border: 0,
  },
  bg: {
    backgroundImage: `url(${'https://images.unsplash.com/photo-1587327903256-2265e70b5660?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80'})`,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  centerGrid: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(0.8),
  },
  menuButton: {
    color: 'white',
    fontWeight: 900,
    fontSize: 20,
    backgroundColor: '#2E84CF',
    '&:hover': {
      cursor: 'pointer',
      color: 'black',
    },
  },
  iconHover: {
    fontSize: 20,
    margin: theme.spacing(0),
  },
  smallFilter: {
    fontSize: 15,
    margin: theme.spacing(0),
  },
  filterList: {
    border: '1px solid white',
    '&:hover': {
      borderTop: '1px solid lightgrey',
      borderBottom: '1px solid lightgrey',
      fontWeight: 900,
    },
  },
  imageIcon: {
    height: '0.8em',
    width: '0.8em',
    color: 'red',
  },
  chip: {
    margin: theme.spacing(0.5),
    textShadow: 'none',
    color: '#2E84CF',
  },
  valueInput: {
    width: '300',
  },
  smallAvatar: {
    fontSize: 12,
    margin: theme.spacing(0),
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
});

export default compose(withStyles(styles))(VirtualTableFilter);
