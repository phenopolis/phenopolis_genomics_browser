import React from 'react';
import { Card, CardContent, Button, Grid } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/pro-duotone-svg-icons';

const ExportExcel = (props) => {
  return (
    <Card elevation={0}>
      <CardContent>
        <Grid container direction="row" justify="center" alignItems="center">
          <Button
            color="primary"
            variant="outlined"
            className="mt-1"
            onClick={props.onRequestDownload}>
            <span className="btn-wrapper--icon">
              <FontAwesomeIcon icon={faFileDownload} />
            </span>
            <span className="btn-wrapper--label">Download Table</span>
          </Button>
        </Grid>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className="m-2"
          style={{ paddingTop: '1em', color: 'darkgrey', 'white-space': 'pre-wrap' }}>
          {'1. Please click above button to download current table.\n' +
            '2. This is the table after your filtering.\n' +
            "3. If one cell in below table contains multiple chips, they will be joined by ';'."}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default ExportExcel;
