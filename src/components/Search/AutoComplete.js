import React, { useEffect, useState } from 'react';
import { Paper, Typography, Grid, Collapse } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { setSnack } from '../../redux/actions/snacks';
import ChipInput from 'material-ui-chip-input';
import TypeChip from '../Chip/TypeChip';
import { getSearchAutocomplete } from '../../redux/actions/search';

const AutoComplete = (props) => {
  const [featureArray, setFeatureArray] = useState(props.featureArray);
  const [type, setType] = useState(null);
  const [featureInput, setFeatureInput] = useState('');
  const [autoCompleteContent, setAutoCompleteContent] = useState(null);
  const [searchLoaded, setSearchLoaded] = useState(false);

  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => ({
    data: state.Search.data,
    error: state.Search.error,
  }));

  useEffect(() => {
    setFeatureArray(props.featureArray);
    setType(props.type);
    if (error) {
      dispatch(setSnack('Autocomplete failed.', 'error'));
    }
  }, [props.featureArray, error]);

  useEffect(() => {
    if (data && searchLoaded) {
      const filteredOptions = data.filter((x) => {
        return featureArray.indexOf(x.split('::')[1]);
      });
      setAutoCompleteContent(filteredOptions.length ? filteredOptions : []);
      setSearchLoaded(false);
    }
  }, [data]);

  const handleFeatureAddChip = (item) => {
    props.ModifyFeature(item, 'Add', type);
  };

  const handleFeatureDeleteChip = (item) => {
    props.ModifyFeature(item, 'Remove', type);
  };

  const handleFeatureSearchChange = (event) => {
    setFeatureInput(event.target.value);
    changeName(event.target.value);
  };

  const changeName = (searchText) => {
    setTimeout(() => {
      if (searchText !== '') {
        autocomplete(searchText, type);
      } else {
        setAutoCompleteContent(null);
        setSearchLoaded(false);
      }
    }, 500);
  };

  const autocomplete = (searchText, type) => {
    setAutoCompleteContent(null);
    setSearchLoaded(true);
    dispatch(getSearchAutocomplete({ query: searchText, query_type: type, component: 'searchAutoComplete' }));
  };

  return (
    <div>
      <ChipInput
        fullWidth
        inputValue={featureInput}
        value={featureArray}
        classes={{
          chip: 'autocomplete-chipinInput',
        }}
        onDelete={(chip, value) => handleFeatureDeleteChip(chip)}
        onUpdateInput={(event) => handleFeatureSearchChange(event)}
        chipRenderer={(value) => {
          return (
            <TypeChip
              size="small"
              label={value.chip}
              type={type}
              emit={false}
              action="no"
              popover={false}
              deletable={true}
              onDeleteClick={handleFeatureDeleteChip}
              to={'//'}
            />
          );
        }}
      />
      <Collapse in={searchLoaded === true || autoCompleteContent !== null}>
        <Paper elevation={0} className={'autocomplete-paperCollapse'}>
          <Grid container justify="center">
            {searchLoaded === true ? (
              <Typography variant="subtitle1" gutterBottom>
                Searching for auto completing...
              </Typography>
            ) : autoCompleteContent !== null ? (
              autoCompleteContent.length > 0 ? (
                autoCompleteContent.map((item, index) => {
                  return (
                    <TypeChip
                      key={index}
                      size="small"
                      label={item.split('::')[1]}
                      type={type}
                      popover={true}
                      emit={true}
                      emitContent={item}
                      onClick={handleFeatureAddChip}
                      to={'/' + item.split('::')[0] + '/' + item.split('::')[2]}
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

export default AutoComplete;
