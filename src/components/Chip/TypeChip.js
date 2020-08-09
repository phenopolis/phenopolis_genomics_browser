import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Chip,
  Avatar,
  Popover,
  Container,
  Typography,
  CircularProgress,
  Grid,
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDna, faChartNetwork, faUser, faCut, faLink } from '@fortawesome/pro-solid-svg-icons';

import { useDispatch, useSelector } from 'react-redux';
import { getSearchBest, clearSearchBest } from '../../redux/actions/search';
import { getPreviewInformation, clearPreviewInformation } from '../../redux/actions/preview';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  popover: {
    pointerEvents: 'none',
    margin: '0.3em',
    marginLeft: '0.5em',
  },
  paper: {
    backgroundColor: 'transparent',
    color: '#424242',
  },
}));

const TypeChip = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();

  const { best, previewName, previewInfo, previewLoaded, error } = useSelector((state) => ({
    best: state.Search.best.redirect,
    previewName: state.Preview.previewName,
    previewInfo: state.Preview.previewInfo,
    previewLoaded: state.Preview.previewLoaded,
    error: state.Preview.error,
  }));

  const [type, setType] = useState('other');
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (best) {
      redirectTo();
    }
    if (['gene', 'phenotype', 'hpo', 'patient', 'individual', 'variant'].includes(props.type)) {
      setType(props.type);
    }
  }, [best, props.type]);

  const redirectTo = () => {
    history.push(best);
    dispatch(clearSearchBest());
  };

  const ChipIcon = {
    gene: { backgroundColor: '#e07a5f', icon: faDna, des: 'Gene' },
    phenotype: {
      backgroundColor: '#81b29a',
      icon: faChartNetwork,
      des: 'HPO(Human Phenotype Ontology)',
    },
    hpo: {
      backgroundColor: '#81b29a',
      icon: faChartNetwork,
      des: 'HPO(Human Phenotype Ontology)',
    },
    patient: { backgroundColor: '#f2cc8f', icon: faUser, des: 'Patient' },
    individual: { backgroundColor: '#f2cc8f', icon: faUser, des: 'Patient' },
    variant: { backgroundColor: '#3d405b', icon: faCut, des: 'Variant' },
    other: { backgroundColor: '#5C95FF', icon: faLink, des: 'Other' },
  };

  const handleSearch = (event, to) => {
    event.preventDefault();

    if (props.action === 'guess') {
      let guessText = to;
      dispatch(getSearchBest(guessText));
    } else if (props.action === 'forward') {
      history.push(to);
    } else if (props.action === 'externalforward') {
      window.location.href = to;
    }

    if (props.emit === true) {
      props.onClick(to);
    }
  };

  const handlePopoverOpen = (event, to) => {
    if ((props.action !== 'guess') & (props.type !== 'other') & (props.popover === true)) {
      dispatch(getPreviewInformation(to));
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    dispatch(clearPreviewInformation());
  };

  const open = Boolean(anchorEl);

  return (
    <span>
      <Chip
        size={props.size}
        label={props.label}
        color="primary"
        className={'search-chip-' + props.size}
        avatar={
          <Avatar
            style={{
              backgroundColor: ChipIcon[type].backgroundColor,
              color: 'white',
            }}>
            <FontAwesomeIcon icon={ChipIcon[type].icon} />
          </Avatar>
        }
        clickable
        variant="outlined"
        onClick={(event) => handleSearch(event, props.to)}
        onMouseEnter={(event) => handlePopoverOpen(event, props.to)}
        onMouseLeave={handlePopoverClose}
      />

      <Popover
        id="mouse-over-popover"
        className={classes.popover}
        classes={{
          paper: classes.paper,
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        elevation={8}>
        <Container
          className={previewLoaded ? 'chip-title-loaded' : 'chip-title-unloaded'}
          style={
            previewLoaded !== true
              ? { backgroundColor: ChipIcon[type].backgroundColor }
              : { backgroundColor: ChipIcon[type].backgroundColor }
          }>
          <Typography variant="subtitle1" style={{ 'font-weight': '900', color: 'white' }}>
            {props.label}

            {(previewLoaded !== true) | (props.to.split('/')[2] !== previewName) ? (
              <small style={{ color: 'white' }}>
                {' '}
                &nbsp;&nbsp;
                <CircularProgress size={12} color="white" />
              </small>
            ) : null}
          </Typography>
        </Container>

        {(previewLoaded === true) & (props.to.split('/')[2] === previewName) ? (
          <Container className="chip-container">
            {(previewInfo === null) | (previewInfo === undefined) | error ? (
              <span> Can not Fetch preview information </span>
            ) : (
              previewInfo.map((item, index) => {
                return (
                  <Grid container spacing={1} key={index}>
                    <Grid item xs={4} className="chip-popover-namegrid">
                      {item[0]}
                    </Grid>

                    <Grid item xs={8} className="chip-popover-datagrid">
                      {typeof item[1] === 'object'
                        ? item[1].map((subchip, subchipIndex) => {
                            return <span key={subchipIndex}>{subchip + ', '}</span>;
                          })
                        : item[1]}
                    </Grid>
                  </Grid>
                );
              })
            )}
          </Container>
        ) : null}
      </Popover>
    </span>
  );
};

export default TypeChip;
