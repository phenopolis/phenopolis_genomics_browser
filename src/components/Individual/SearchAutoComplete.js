import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid, Collapse } from '@material-ui/core';

import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { setSnack } from '../../redux/actions/snacks';

import ChipInput from 'material-ui-chip-input';

import TypeChip from '../Chip/TypeChip';

class SearchAutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      featureArray: this.props.featureArray,
      type: this.props.type,
      featureInput: '',
      autoCompleteContent: null,
      searchLoaded: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      featureArray: nextProps.featureArray,
      type: nextProps.type,
      featureInput: '',
      autoCompleteContent: null,
      searchLoaded: false,
    });
  }

  handleFeatureAddChip = (item) => {
    this.props.ModifyFeature(item.split("::")[1], 'Add', this.state.type);
  };

  handleFeatureDeleteChip = (item, index) => {
    this.props.ModifyFeature(index, 'Remove', this.state.type);
  };

  handleFeatureSearchChange = (event) => {
    this.setState({ featureInput: event.target.value });
    this.changeName(event.target.value);
  };

  changeName = (value) => {
    var searchText = value; // this is the search text

    let self = this;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (searchText !== '') {
        self.autocomplete(searchText, self.state.type);
      } else {
        self.setState({ autoCompleteContent: null, searchLoaded: false });
      }
    }, 500);
  };

  autocomplete = (searchText, type) => {
    this.setState({ autoCompleteContent: null, searchLoaded: true });
    let self = this;
    axios
      .get('/api/autocomplete/' + searchText + '?query_type=' + type, { withCredentials: true })
      .then((res) => {
        let filteredOptions = res.data.filter((x) => {
          return self.state.featureArray.indexOf(x) < 0;
        });
        self.setState({ autoCompleteContent: filteredOptions, searchLoaded: false });
      })
      .catch((err) => {
        this.props.setSnack('Autocomplete failed.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <ChipInput
          fullWidth
          inputValue={this.state.featureInput}
          value={this.state.featureArray}
          classes={{
            chip: classes.chipinInput,
          }}
          onDelete={(chip, index) => this.handleFeatureDeleteChip(chip, index)}
          onUpdateInput={(event) => this.handleFeatureSearchChange(event)}
        />

        <Collapse in={this.state.searchLoaded === true || this.state.autoCompleteContent !== null}>
          <Paper elevation={0} className={classes.paperCollapse}>
            <Grid container justify="center">
              {this.state.searchLoaded === true ? (
                <Typography variant="subtitle1" gutterBottom>
                  Searching for auto completing...
                </Typography>
              ) : this.state.autoCompleteContent !== null ? (
                this.state.autoCompleteContent.length > 0 ? (
                  this.state.autoCompleteContent.map((item, index) => {
                    return (
                      <TypeChip
                        key={index}
                        size="small"
                        label={item.split("::")[1]}
                        type={this.state.type}
                        emit={true}
                        onClick={this.handleFeatureAddChip}
                        to={item}
                      />
                    );
                  })
                ) : (
                    <Typography variant="subtitle1" gutterBottom>
                      Sorry, we did not get any auto completing options...
                    </Typography>
                  )
              ) : (
                    <Typography variant="subtitle1" gutterBottom>
                      Nothing for search.
                    </Typography>
                  )}
            </Grid>
          </Paper>
        </Collapse>
      </div>
    );
  }
}

SearchAutoComplete.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    height: 'calc(100vh - 64px)',
    position: 'relative',
    backgroundColor: '#eeeeee',
    padding: '4em',
  },
  paper: {
    padding: theme.spacing(5),
  },
  paperCollapse: {
    padding: theme.spacing(2),
  },
  margin: {
    margin: '3em',
  },
  searchIcon: {
    fontSize: '4em',
    color: '#2E84CF',
  },
  input: {
    width: '100%',
  },
  resizeFont: {
    fontSize: 30,
    fontWeight: 'bolder',
  },
  example: {
    color: '#2E84CF',
  },
  link: {
    textDecoration: 'none',
    color: '#2E84CF',
    padding: '0em 0.5em 0em 0.5em',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
    },
  },
  chip: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    textShadow: 'none',
    color: '#2E84CF',
    '&:hover': {
      textShadow: '-0.06ex 0 #2E84CF, 0.06ex 0 #2E84CF',
    },
  },
  chipinInput: {
    backgroundColor: 'transparent',
    color: '#2E84CF',
    border: '1.3px solid lightgrey',
  },
});

export default compose(withStyles(styles), connect(null, { setSnack }))(SearchAutoComplete);
