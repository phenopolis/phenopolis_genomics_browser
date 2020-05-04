import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Button, Typography, Tabs, Tab, Grid, Paper, TextField, IconButton, Icon, List, ListItem } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import clsx from 'clsx';


const top100Films = [
  { title: 'The Shawshank Redemption', year: 1994 },
  { title: 'The Godfather', year: 1972 },
  { title: 'The Godfather: Part II', year: 1974 },
  { title: 'The Dark Knight', year: 2008 },
  { title: '12 Angry Men', year: 1957 },
  { title: "Schindler's List", year: 1993 }
];

export default function MediaCard() {
  const classes = useStyles();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
            [1, 2, 3, 4, 5].map((item, index) => {
              return (
                <ListItem style={{ border: '1px solid red', paddingTop: 0, paddingBottom: 0 }}>
                  <Grid container spacing={0} style={{ border: '1px solid red', padding: 0, margin: 0 }}>
                    <Grid item xs={1} className={classes.centerGrid}>
                      <span>1</span>
                    </Grid>
                    <Grid item xs={4} className={classes.centerGrid}>
                      <Autocomplete
                        id="combo-box-demo"
                        size="small"
                        options={top100Films}
                        getOptionLabel={(option) => option.title}
                        renderInput={(params) => <TextField {...params} label="Select Column" variant="outlined" />}
                      />
                    </Grid>
                    <Grid item xs={1} className={classes.centerGrid}>
                      <IconButton
                        edge="start"
                        size="small"
                        className={classes.menuButton}
                        color="inherit"
                      >
                        <Icon className={clsx(classes.iconHover, 'fas fa-equals')} />
                      </IconButton>
                    </Grid>
                    <Grid item xs={4} className={classes.centerGrid}>
                      <TextField label="Assign Value" variant="outlined" id="standard-size-small" size="small" />
                    </Grid>
                    <Grid item xs={2} className={classes.centerGrid}>
                      <Button variant="contained" color="secondary" className={classes.andorButton}>
                        AND
                    </Button>
                    </Grid>
                  </Grid>
                </ListItem>
              )
            })
          }
        </List>
      </CardContent>

      <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
        <Button size="small" color="primary">
          Learn More
        </Button>
      </CardActions>
    </Card >
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 600,
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
    justifyContent: "center"
  },
  menuButton: {
    color: '#2E84CF',
    '&:hover': {
      cursor: 'pointer',
      color: 'black',
    }
  },
  iconHover: {
    fontSize: 20,
    margin: theme.spacing(0),
  },
  andorButton: {
    margin: theme.spacing(3),
  }
}));