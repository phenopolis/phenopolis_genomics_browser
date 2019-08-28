import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';
import {
  Paper, Container, Box, Typography, TextField,
  Grid, CircularProgress, Collapse, Chip
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      examples: [
        { name: 'TTLL5', type: '(Gene)', to: '/gene/ENSG00000119685' },
        { name: 'Nystagmus', type: '(HPO Phenotype)', to: '/hpo/HP:0000639' },
        {
          name: 'PH00008257',
          type: '(Patient)',
          to: '/individual/PH00008257'
        },
        {
          name: '22-38212762-A-G',
          type: '(Variant)',
          to: '/variant/22-38212762-A-G'
        }
      ],
      searchContent: '',
      redirect: false,
      guesslink: '',
      autoCompleteContent: null,
      searchLoaded: false
    };
  }

  handleSearch = (event, guess) => {
    event.preventDefault();

    var guessText = guess
    if (guessText === 'default') {
      guessText = this.state.searchContent
    }

    axios
      .get('/api/best_guess?query=' + guessText, { withCredentials: true })
      .then(res => {
        console.log(res)
        this.setState({ redirect: true, guesslink: res.data.redirect });
      })
      .catch(err => {
        window.alert('Best guess Failed.');
      });

    // fetch('/api/best_guess?query=' + this.state.searchContent)
    //   .then(response => {
    //     console.log(response)
    //     if (response.status === '200') {
    //       window.alert('Success')
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     window.alert('Error')
    //   });
  };

  handlesearchChange = event => {
    this.setState({ searchContent: event.target.value });

    this.changeName(event)
  };

  changeName = event => {
    var searchText = event.target.value; // this is the search text

    let self = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (searchText !== '') {
        self.autocomplete(searchText)
      } else {
        self.setState({ autoCompleteContent: null, searchLoaded: false })
      }
    }, 500);
  };

  autocomplete = (searchText) => {
    this.setState({ autoCompleteContent: null, searchLoaded: true })
    let self = this;
    axios
      .get('/api/autocomplete/' + searchText, { withCredentials: true })
      .then(res => {
        console.log(res.data)
        self.setState({ autoCompleteContent: res.data, searchLoaded: false })
      })
      .catch(err => {
        window.alert('autocomplete failed.');
      });
  }

  render() {
    const { classes } = this.props;
    if (this.state.redirect) {
      return <Redirect to={this.state.guesslink} />;
    }

    return (
      <div className={classes.root}>
        <Container maxWidth='lg'>
          <Paper className={classes.paper}>
            <Typography component='div'>
              <Box fontWeight='fontWeightBold' fontSize='h3.fontSize' m={1}>
                Search Phenopolis
              </Box>
              <Box fontWeight='fontWeightLight' m={1}>
                An open platform for harmonization and analysis of sequencing
                and phenotype data.
              </Box>
            </Typography>

            <div className={classes.margin}>
              <form
                className={classes.form}
                noValidate
                onSubmit={event => this.handleSearch(event, 'default')}>
                <Grid container spacing={1} alignItems='flex-end'>
                  <Grid item xs={1}>
                    {
                      this.state.searchLoaded !== true ? (
                        <SearchIcon className={classes.searchIcon} />
                      ) : (
                          <CircularProgress size={40} color="primary" />
                        )
                    }

                  </Grid>
                  <Grid item xs={11}>
                    <CssTextField
                      className={classes.input}
                      InputProps={{
                        classes: {
                          input: classes.resizeFont
                        }
                      }}
                      id='input-with-icon-grid'
                      label='Search for a phenotype, patient, gene, variant or region.'
                      autoFocus={true}
                      value={this.state.searchContent}
                      onChange={this.handlesearchChange}
                    />
                  </Grid>
                </Grid>
              </form>
              <Collapse in={this.state.searchLoaded === true || this.state.autoCompleteContent !== null}>
                <Paper elevation={0} className={classes.paperCollapse}>
                  <Grid container justify="center">
                    {
                      this.state.searchLoaded === true ? (
                        <Typography variant="subtitle1" gutterBottom>
                          Search for auto completing...
                      </Typography>
                      ) : (
                          this.state.autoCompleteContent !== null ? (

                            this.state.autoCompleteContent.length > 0 ? (

                              this.state.autoCompleteContent.map((item, index) => {
                                return (
                                  <Chip
                                    key={index}
                                    size="large"
                                    label={item}
                                    className={classes.chip}
                                    clickable
                                    variant="outlined"
                                    onClick={event => this.handleSearch(event, item)}
                                  />

                                )
                              })
                            ) : (
                                <Typography variant="subtitle1" gutterBottom>
                                  Sorry, we did not get any auto completing options...So sad.
                          </Typography>
                              )

                          ) : (
                              <Typography variant="subtitle1" gutterBottom>
                                Nothing for search.
                            </Typography>
                            )
                        )
                    }
                  </Grid>
                </Paper>
              </Collapse>
              <Typography component='div'>
                <Box
                  className={classes.example}
                  fontWeight='fontWeightLight'
                  m={2}>
                  Examples:
                  {this.state.examples.map((item, index) => {
                    return (
                      <span>
                        <Link className={classes.link} to={item.to}>
                          {item.name + item.type}
                        </Link>
                        &bull;
                      </span>
                    );
                  })}
                </Box>
              </Typography>
            </div>
          </Paper>
        </Container>
      </div>
    );
  }
}

SearchBox.propTypes = {
  classes: PropTypes.object.isRequired
};

const styles = theme => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '4em'
  },
  paper: {
    padding: theme.spacing(5)
  },
  paperCollapse: {
    padding: theme.spacing(2)
  },
  margin: {
    margin: '3em'
  },
  searchIcon: {
    fontSize: '4em',
    color: '#2E84CF'
  },
  input: {
    width: '100%'
  },
  resizeFont: {
    fontSize: 30,
    fontWeight: 'bolder'
  },
  example: {
    color: '#2E84CF'
  },
  link: {
    textDecoration: 'none',
    color: '#2E84CF',
    padding: '0em 0.5em 0em 0.5em',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
    }
  },
  chip: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF'
    }
  }
});

const CssTextField = withStyles({
  root: {
    '& label.Mui-focused': {
      color: '#2E84CF'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#2E84CF'
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#2E84CF'
      },
      '&:hover fieldset': {
        borderColor: 'black'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#2E84CF'
      }
    }
  }
})(TextField);

export default withStyles(styles)(SearchBox);
