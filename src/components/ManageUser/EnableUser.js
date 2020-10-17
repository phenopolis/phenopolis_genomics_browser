import React, { Fragment, useState, useEffect } from 'react';

import { Container, Card, Divider, Grid, Button, Collapse, Paper } from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';

import { useDispatch, useSelector } from 'react-redux';
// import { deleteOneIndividual, ResetDelete } from '../../redux/actions/individuals';

export default function UserDelete(props) {
  const dispatch = useDispatch();
  const [ConfirmOpen, setConfirmOpen] = useState(false);

  // const { deleteLoaded } = useSelector((state) => ({
  //   deleteLoaded: state.Individuals.deleteLoaded,
  // }));

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleDeletePatient = () => {
    // dispatch(deleteOneIndividual(props.Patient_ID));
  };

  // useEffect(() => {
  //   if (deleteLoaded) {
  //     setConfirmOpen(false);
  //     dispatch(ResetDelete());
  //     props.actionSuccess('delete');
  //   }
  // }, [deleteLoaded]);

  return (
    <Fragment>
      <Container className="mt-0 px-0 py-0">
        <Card className="p-4 mb-2">
          <div className="font-size-lg font-weight-bold">Delete Patient</div>
          <Divider className="my-4" />
          <Grid container justify="center">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DeleteIcon />}
              disabled={ConfirmOpen}
              onClick={() => handleOpenConfirm()}>
              Delete User {props.Patient_ID}
            </Button>
          </Grid>

          <Collapse in={ConfirmOpen}>
            <Paper
              elevation={5}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '1.5em',
                margin: '0.5em 0em',
              }}>
              <Grid container direction="row" justify="space-around" alignItems="center">
                <Grid item xs={6}>
                  This action will remove this User forever from the database, are you sure you want
                  to do this?
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction="row" justify="flex-end" alignItems="center">
                    <Button
                      variant="outlined"
                      style={{ color: 'white', border: '1px solid white', 'margin-right': '1em' }}
                      onClick={() => setConfirmOpen(false)}>
                      Give up
                    </Button>
                    <Button
                      variant="outlined"
                      style={{ color: 'white', border: '1px solid white' }}
                      onClick={() => handleDeletePatient()}>
                      Confirm
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Collapse>
        </Card>
      </Container>
    </Fragment>
  );
}
