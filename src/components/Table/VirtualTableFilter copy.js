import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, Typography, Grid, TextField, IconButton, Icon, List, ListItem, Container, Menu, MenuItem, ListItemIcon } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import clsx from 'clsx';

export default function MediaCard({ variableList, tableFilter, onClickClose }) {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [myfilter, setFilter] = React.useState([]);
  const operationOptions = [
    { des: 'Equal', icon: '=' },
    { des: 'Greater', icon: '>' },
    { des: 'Smaller', icon: '<' },
    { des: 'Include', icon: '⊂' },
    { des: 'Exclude', icon: '⊄' }
  ]
  const [tmpFilter, setTmpFilter] = React.useState(0);

  const handleAddNewFilter = () => {
    setFilter([...myfilter,
    {
      column: null,
      operation: '=',
      value: '',
      andor: 'and'
    }
    ])
  }

  const handleSelectColumn = (event, newValue, index) => {
    const newFilter = [...myfilter];
    newFilter[index].column = newValue
    setFilter(newFilter)
  }

  const handleOperationOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setTmpFilter(index)
  };

  const handleOperationClose = () => {
    setAnchorEl(null);
  };

  const handleOperationChange = (operation) => {
    const newFilter = [...myfilter];
    newFilter[tmpFilter].operation = operation
    setFilter(newFilter)
    handleOperationClose()
  }

  const handleValueChange = (event, index) => {
    const newFilter = [...myfilter];
    newFilter[index].value = event.target.value
    setFilter(newFilter)
  }

  const handleAndOrChange = (index) => {
    const newFilter = [...myfilter];
    if (newFilter[index].andor === 'and') {
      newFilter[index].andor = 'or'
    } else {
      newFilter[index].andor = 'and'
    }
    setFilter(newFilter)
  }

  const handleDeleteFilter = (index) => {
    const newFilter = [...myfilter];
    newFilter.splice(index, 1);
    setFilter(newFilter)
  }

  return (
    <Card className={classes.root}>

      <Card
        className={clsx('card-box bg-composed-wrapper bg-midnight-bloom border-0 text-center m-2 mb-4', classes.card)}
      >
        <div className={clsx("bg-composed-img-1 bg-composed-wrapper--image rounded", classes.bg)} />
        <div className="bg-composed-wrapper--content text-light">
          <div className="py-0 px-0">
            <h4 className="font-size-xl font-weight-bold mb-2">
              Create Your Own Filter
              </h4>
            <p className="opacity-6 font-size-md mb-3">
              1.Select Variables; 2.Define Operations; 3.Set Value.
              </p>
          </div>
        </div>

      </Card>

      <CardContent>
        <List>
          {
            myfilter.map((item, index) => {
              return (
                <ListItem key={index} style={{ paddingTop: 0, paddingBottom: 0 }}>
                  <Grid container spacing={0} style={{ padding: 0, margin: 0 }} className={classes.filterList}>
                    <Grid item xs={1} className={classes.centerGrid}>
                      <span> {index + 1} </span>
                    </Grid>

                    <Grid item xs={4} className={classes.centerGrid}>
                      <Autocomplete
                        value={item.column}
                        onChange={(event, newValue) => handleSelectColumn(event, newValue, index)}
                        id="combo-box-demo"
                        size="small"
                        options={variableList}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => <TextField {...params} label="Select Column" variant="outlined" />}
                      />
                    </Grid>

                    <Grid item xs={1} className={classes.centerGrid}>
                      <IconButton
                        edge="start"
                        size="small"
                        className={classes.menuButton}
                        color="inherit"
                        onClick={(event) => handleOperationOpen(event, index)}
                      >
                        {item.operation}
                      </IconButton>

                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleOperationClose}
                      >
                        {
                          operationOptions.map(function (operationItem, operationIndex) {
                            return (
                              <MenuItem key={operationIndex} onClick={() => handleOperationChange(operationItem.icon)}>
                                <ListItemIcon>
                                  <Typography variant="h5" noWrap>
                                    {operationItem.icon}
                                  </Typography>
                                </ListItemIcon>
                                <Typography variant="body2" noWrap>
                                  {operationItem.des}
                                </Typography>
                              </MenuItem>
                            )

                          })
                        }

                      </Menu>
                    </Grid>

                    <Grid item xs={3} className={classes.centerGrid}>
                      <TextField label="Value" variant="outlined" id="standard-size-small" size="small" onChange={(event) => handleValueChange(event, index)} />
                    </Grid>

                    <Grid item xs={2} className={classes.centerGrid}>
                      <Button
                        size="small"
                        variant="contained"
                        color={item.andor === "and" ? 'secondary' : 'primary'}
                        className={classes.andorButton}
                        onClick={() => handleAndOrChange(index)}>
                        {item.andor}
                      </Button>
                    </Grid>

                    <Grid item xs={1} className={classes.centerGrid}>
                      <IconButton
                        edge="start"
                        size="small"
                        color="inherit"
                        onClick={() => handleDeleteFilter(index)}
                      >
                        <Icon className={clsx(classes.smallFilter, 'far fa-trash-alt')} />
                      </IconButton>
                    </Grid>

                  </Grid>
                </ListItem>
              )
            })
          }
        </List>

        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <Button onClick={handleAddNewFilter}>Add New Filter</Button>
        </Grid>
      </CardContent>


      <Container>
        <Grid container
          direction="row"
          justify="flex-end"
          alignItems="center">
          {/* <Button size="small" color="primary">
            Apply
        </Button> */}
          <Button size="small" color="secondary" onClick={onClickClose}>
            Close
        </Button>
        </Grid>
      </Container>

    </Card >
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 600,
    maxHeight: 600,
    overflowY: 'auto'
  },
  media: {
    height: 80,
  },
  card: {
    border: 0
  },
  bg: {
    backgroundImage: `url(${'https://images.unsplash.com/photo-1587327903256-2265e70b5660?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80'})`
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  centerGrid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: theme.spacing(0.8)
  },
  menuButton: {
    color: '#2E84CF',
    fontWeight: 900,
    '&:hover': {
      cursor: 'pointer',
      color: 'black',
    }
  },
  iconHover: {
    fontSize: 20,
    margin: theme.spacing(0),
  },
  smallFilter: {
    fontSize: 15,
    margin: theme.spacing(0),
  },
  andorButton: {
    marginRight: theme.spacing(3)
  },
  filterList: {
    border: "1px solid white",
    '&:hover': {
      borderTop: "1px solid lightgrey",
      borderBottom: "1px solid lightgrey",
      fontWeight: 900
    }
  },
  imageIcon: {
    height: '0.8em',
    width: '0.8em',
    color: 'red'
  }
}));