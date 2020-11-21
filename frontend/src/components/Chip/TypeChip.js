import React, { useEffect, useState } from 'react';
import {
  Chip,
  Avatar,
  Popover,
  Container,
  Typography,
  CircularProgress,
  Grid,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
  Tooltip,
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDna,
  faChartNetwork,
  faUser,
  faCut,
  faLink,
  faWindowClose,
  faExternalLinkAlt,
  faExternalLinkSquare,
} from '@fortawesome/pro-solid-svg-icons';

import { useDispatch, useSelector } from 'react-redux';
import { getSearchBest, clearSearchBest } from '../../redux/actions/search';
import {
  getPreviewInformation,
  clearPreviewInformation,
  setPopoverIndex,
} from '../../redux/actions/preview';
import { useHistory } from 'react-router-dom';

const TypeChip = (props) => {
  const ChipIcon = {
    gene: { icon: faDna, des: 'Gene' },
    phenotype: { icon: faChartNetwork, des: 'HPO(Human Phenotype Ontology)' },
    hpo: { icon: faChartNetwork, des: 'HPO(Human Phenotype Ontology)' },
    patient: { icon: faUser, des: 'Patient' },
    individual: { icon: faUser, des: 'Patient' },
    variant: { icon: faCut, des: 'Variant' },
    other: { icon: faLink, des: 'Other' },
  };

  const dispatch = useDispatch();
  const history = useHistory();

  const { best, previewName, previewInfo, loaded, error, indexTo } = useSelector((state) => ({
    best: state.Search.best.redirect,
    previewName: state.Preview.name,
    previewInfo: state.Preview.data,
    loaded: state.Preview.loaded,
    error: state.Preview.error,
    indexTo: state.Preview.indexTo,
  }));

  const [randomIndex, setRandomIndex] = useState(Math.random().toString(36).substr(2, 5));

  const [type, setType] = useState('other');
  const [anchorEl, setAnchorEl] = useState(null);

  const redirectTo = () => {
    history.push(best);
    dispatch(clearSearchBest());
  };

  useEffect(() => {
    if (best) {
      redirectTo();
    }
    if (['gene', 'phenotype', 'hpo', 'patient', 'individual', 'variant'].includes(props.type)) {
      setType(props.type);
    }
  }, [best, props.type]);

  const handleSearch = (event, to) => {
    event.preventDefault();

    if (event.button === 0) {
      if (props.action === 'guess') {
        let guessText = to;
        dispatch(getSearchBest(guessText));
      } else if (props.action === 'forward') {
        history.push(to);
      } else if (props.action === 'externalforward') {
        window.location.href = to;
      }

      if (props.emit === true) {
        props.onClick(props.emitContent);
      }
    } else if (event.button === 1) {
      if (props.action === 'forward') {
        handleOpenNewTab(to);
      } else if (props.action === 'externalforward') {
        handleOpenNewTab(to);
      }
    }
  };

  const handleTurnToPage = (to) => {
    history.push(to);
  };

  const handleOpenNewTab = (to) => {
    let win = window.open(window.location.origin + to, '_blank');
    win.focus();
  };

  const handlePopoverOpen = (event, to) => {
    if ((props.action !== 'guess') & (props.type !== 'other') & (props.popover === true)) {
      dispatch(getPreviewInformation(to));
      dispatch(setPopoverIndex(randomIndex));
      setAnchorEl(event.currentTarget);
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    dispatch(setPopoverIndex(false));
    dispatch(clearPreviewInformation());
  };

  const handleDeleteClick = (event, label) => {
    event.preventDefault();
    props.onDeleteClick(label);
  };

  const open = Boolean(anchorEl) & (indexTo === randomIndex);

  return (
    <span>
      <Chip
        size={props.size}
        label={props.label}
        color={props.slash ? 'primary' : 'primary'}
        className={'search-chip-' + props.size}
        onDelete={props.deletable ? (event) => handleDeleteClick(event, props.label) : null}
        avatar={
          <Avatar className={`${type}-bg white-fg`}>
            <FontAwesomeIcon icon={ChipIcon[type].icon} />
          </Avatar>
        }
        clickable
        variant="outlined"
        onMouseDown={(event) => handleSearch(event, props.to)}
        onMouseEnter={(event) => handlePopoverOpen(event, props.to)}
        // onMouseLeave={handlePopoverClose}
        style={
          props.slash ? { backgroundColor: 'white', opacity: 0.5 } : { backgroundColor: 'white' }
        }
      />

      <ClickAwayListener onClickAway={handlePopoverClose}>
        <Popper
          id="mouse-over-popover"
          className={'chip-popover'}
          open={open}
          anchorEl={anchorEl}
          placement="right"
          onClose={handlePopoverClose}>
          <Paper elevation={8}>
            <Container
              className={
                loaded ? `${type}-bg chip-title-loaded` : `${type}-bg chip-title-unloaded`
              }>
              <Grid container direction="row" justify="space-between" alignItems="center">
                <Typography variant="subtitle1" style={{ 'font-weight': '900', color: 'white' }}>
                  {props.label}

                  {(loaded === false) | (props.to.split('/')[2] !== previewName) ? (
                    <small style={{ color: 'white' }}>
                      {' '}
                      &nbsp;&nbsp;
                      <CircularProgress size={12} color="white" />
                    </small>
                  ) : null}
                </Typography>

                <Grid item>
                  <Tooltip title={'Go to ' + previewName + ' page'} placement="top">
                    <IconButton size="small" onClick={() => handleTurnToPage(props.to)}>
                      <FontAwesomeIcon
                        icon={faExternalLinkSquare}
                        style={{ color: 'white', fontSize: '15' }}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Open in new Tab" placement="top">
                    <IconButton size="small" onClick={() => handleOpenNewTab(props.to)}>
                      <FontAwesomeIcon
                        icon={faExternalLinkAlt}
                        style={{ color: 'white', fontSize: '13' }}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Close Preview Panel" placement="top">
                    <IconButton size="small" onClick={handlePopoverClose}>
                      <FontAwesomeIcon
                        icon={faWindowClose}
                        style={{ color: 'white', fontSize: '15' }}
                      />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Container>

            {(loaded === true) & (props.to.split('/')[2] === previewName) ? (
              <Container className="chip-container">
                {error ? (
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
                                return (
                                  <span key={subchipIndex}>
                                    {subchipIndex === 0 ? '' : ', '} {subchip}
                                  </span>
                                );
                              })
                            : item[1]}
                        </Grid>
                      </Grid>
                    );
                  })
                )}
              </Container>
            ) : null}
          </Paper>
        </Popper>
      </ClickAwayListener>
    </span>
  );
};

export default TypeChip;
