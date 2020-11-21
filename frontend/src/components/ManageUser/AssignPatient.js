import React, { Fragment, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  List,
  Card,
  CardHeader,
  Checkbox,
  Button,
  Divider,
  Container,
  IconButton,
  Tooltip,
  Input,
  Typography,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';

import { useDispatch, useSelector } from 'react-redux';
import { getAllPatients } from '../../redux/actions/user';
import {
  addUserIndividual,
  ResetAdd,
  deleteUserIndividual,
  ResetDelete,
} from '../../redux/actions/userIndividual';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronSquareLeft, faChevronSquareRight } from '@fortawesome/pro-solid-svg-icons';

import TypeChip from '../Chip/TypeChip';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 200,
    height: 230,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

export default function TransferList(props) {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [page, setPage] = React.useState(1);
  const [page2, setPage2] = React.useState(1);

  const [ItemToRemove, setItemToRemove] = React.useState([]);
  const [ItemToAdd, setItemToAdd] = React.useState([]);

  const [FilteredPatientList, setFilteredPatientList] = React.useState([]);

  const [FullList, setFullList] = React.useState([]);
  const [FilteredFullList, setFilteredFullList] = React.useState([]);

  const { allPatientsInfo, fetchAllPatientLoaded } = useSelector((state) => ({
    allPatientsInfo: state.User.allPatientsInfo,
    fetchAllPatientLoaded: state.User.fetchAllPatientLoaded,
  }));

  const {
    addUserInidividualInfo,
    addUserIndividualLoaded,
    deleteUserInidividualInfo,
    deleteUserIndividualLoaded,
  } = useSelector((state) => ({
    addUserInidividualInfo: state.UserIndividual.addUserInidividualInfo,
    addUserIndividualLoaded: state.UserIndividual.addUserIndividualLoaded,
    deleteUserInidividualInfo: state.UserIndividual.addUserInidividualInfo,
    deleteUserIndividualLoaded: state.UserIndividual.deleteUserIndividualLoaded,
  }));

  useEffect(() => {
    if (addUserIndividualLoaded) {
      dispatch(ResetAdd());
      setItemToAdd([]);
    }

    if (deleteUserIndividualLoaded) {
      dispatch(ResetDelete());
      setItemToRemove([]);
    }
  }, [addUserIndividualLoaded, deleteUserIndividualLoaded]);

  useEffect(() => {
    if (fetchAllPatientLoaded) {
      setFullList(allPatientsInfo.individuals.filter((x) => !props.patients.includes(x)));
      setFilteredFullList(allPatientsInfo.individuals.filter((x) => !props.patients.includes(x)));
    }
  }, [fetchAllPatientLoaded]);

  useEffect(() => {
    dispatch(getAllPatients());
    setFilteredPatientList(props.patients);
  }, []);

  const handleChange = (event, value) => {
    setPage(value);
  };

  const handleChange2 = (event, value) => {
    setPage2(value);
  };

  const handleRemoveClick = (id) => {
    if (ItemToRemove.includes(id)) {
      setItemToRemove(ItemToRemove.filter((element) => element !== id));
    } else {
      setItemToRemove([...ItemToRemove, id]);
    }
  };

  const handleAddClick = (id) => {
    if (ItemToAdd.includes(id)) {
      setItemToAdd(ItemToAdd.filter((element) => element !== id));
    } else {
      setItemToAdd([...ItemToAdd, id]);
    }
  };

  const handleCheckedRight = () => {
    let userIndividualData = ItemToRemove.map((x) => {
      return {
        user: props.id,
        internal_id: x,
      };
    });
    dispatch(deleteUserIndividual(userIndividualData));
  };

  const handleCheckedLeft = () => {
    let userIndividualData = ItemToAdd.map((x) => {
      return {
        user: props.id,
        internal_id: x,
      };
    });
    dispatch(addUserIndividual(userIndividualData));
  };

  const handleToggleAllRemove = () => {
    if (ItemToRemove.length !== 0) {
      setItemToRemove([]);
    } else {
      setItemToRemove(props.patients);
    }
  };

  const handleToggleAllAdd = () => {
    if (ItemToAdd.length !== 0) {
      setItemToAdd([]);
    } else {
      setItemToAdd(FullList);
    }
  };

  const handlePatientType = (event) => {
    if (event.target.value === '') {
      setFilteredPatientList(props.patients);
    } else {
      setFilteredPatientList(
        props.patients.filter((x) =>
          RegExp(event.target.value.toUpperCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).test(
            x.toUpperCase()
          )
        )
      );
    }
  };

  const handlePatientType2 = (event) => {
    if (event.target.value === '') {
      setFilteredFullList(FullList);
    } else {
      setFilteredFullList(
        FullList.filter((x) =>
          RegExp(event.target.value.toUpperCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).test(
            x.toUpperCase()
          )
        )
      );
    }
  };

  return (
    <Grid container spacing={0} justify="center" alignItems="center" className={classes.root}>
      <Grid item xs={5}>
        <Card>
          <CardHeader
            className={classes.cardHeader}
            avatar={
              <Checkbox
                onClick={handleToggleAllRemove}
                checked={ItemToRemove.length === props.patients.length && ItemToRemove.length !== 0}
                indeterminate={
                  ItemToRemove.length !== props.patients.length && ItemToRemove.length !== 0
                }
                disabled={props.patients.length === 0}
                inputProps={{ 'aria-label': 'all items selected to removed' }}
              />
            }
            action={<div />}
            title={
              <Grid container direction="column" justify="flex-start" alignItems="center">
                <Typography
                  variant="subtitle1"
                  component="h1"
                  gutterBottom
                  style={{ fontWeight: 900 }}>
                  Already Assigned Patients
                </Typography>
                <Input
                  margin="dense"
                  placeholder="Type to filter less"
                  inputProps={{ 'aria-label': 'description' }}
                  onChange={handlePatientType}
                />
              </Grid>
            }
            subheader={`${ItemToRemove.length}/${props.patients.length} selected to remove`}
          />
          <Divider />
          <Container>
            <Grid container justify="center" style={{ padding: '1em' }}>
              <Pagination
                shape="rounded"
                count={Math.ceil(FilteredPatientList.length / 18)}
                size="small"
                page={page}
                onChange={handleChange}
              />
            </Grid>
            <Grid container spacing={2} className="mb-2">
              {FilteredPatientList.slice((page - 1) * 18, page * 18).map((item, index) => {
                return (
                  <Grid key={index} item xs={4} lg={6} xl={4} className="m-0 p-0">
                    <TypeChip
                      size="small"
                      label={item}
                      type={'individual'}
                      emit={true}
                      action="no"
                      popover={true}
                      emitContent={item}
                      slash={ItemToRemove.includes(item)}
                      // deletable={true}
                      // onDeleteClick={handleFeatureDeleteChip}
                      to={'/individual/' + item}
                      onClick={handleRemoveClick}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Card>
      </Grid>
      <Grid item xs={1}>
        <Grid container direction="column" alignItems="center">
          <Tooltip title="Remove select patients on the left for this user" placement="top">
            <span>
              <IconButton
                disabled={ItemToRemove.length === 0}
                color="secondary"
                aria-label="delete"
                onClick={handleCheckedRight}>
                <FontAwesomeIcon icon={faChevronSquareRight} />
              </IconButton>
            </span>
          </Tooltip>

          <IconButton
            disabled={ItemToAdd.length === 0}
            color="primary"
            aria-label="add"
            onClick={handleCheckedLeft}>
            <FontAwesomeIcon icon={faChevronSquareLeft} />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={5}>
        {fetchAllPatientLoaded ? (
          <Card>
            <CardHeader
              className={classes.cardHeader}
              avatar={
                <Checkbox
                  onClick={handleToggleAllAdd}
                  checked={ItemToAdd.length === FullList.length && ItemToAdd.length !== 0}
                  indeterminate={ItemToAdd.length !== FullList.length && ItemToAdd.length !== 0}
                  disabled={FullList.length === 0}
                  inputProps={{ 'aria-label': 'all items selected to removed' }}
                />
              }
              action={<div />}
              title={
                <Grid container direction="column" justify="flex-start" alignItems="center">
                  <Typography
                    variant="subtitle1"
                    component="h1"
                    gutterBottom
                    style={{ fontWeight: 900 }}>
                    Unassigned Patients
                  </Typography>
                  <Input
                    margin="dense"
                    placeholder="Type to filter less"
                    inputProps={{ 'aria-label': 'description' }}
                    onChange={handlePatientType2}
                  />
                </Grid>
              }
              subheader={`${ItemToAdd.length}/${FullList.length} selected to remove`}
            />
            <Divider />
            <Container>
              <Grid container justify="center" style={{ padding: '1em' }}>
                <Pagination
                  shape="rounded"
                  count={Math.ceil(FilteredFullList.length / 18)}
                  size="small"
                  page={page2}
                  onChange={handleChange2}
                />
              </Grid>
              <Grid container spacing={2} className="mb-2">
                {FilteredFullList.slice((page2 - 1) * 18, page2 * 18).map((item, index) => {
                  return (
                    <Grid key={index} item xs={4} lg={6} xl={4} className="m-0 p-0">
                      <TypeChip
                        size="small"
                        label={item}
                        type={'individual'}
                        emit={true}
                        action="no"
                        popover={true}
                        emitContent={item}
                        slash={!ItemToAdd.includes(item)}
                        // deletable={true}
                        // onDeleteClick={handleFeatureDeleteChip}
                        to={'/individual/' + item}
                        onClick={handleAddClick}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Container>
          </Card>
        ) : null}
      </Grid>
    </Grid>
  );
}
