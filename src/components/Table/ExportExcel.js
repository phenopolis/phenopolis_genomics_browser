import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import compose from 'recompose/compose';

import { Card, CardContent, Button, Grid } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/pro-duotone-svg-icons';

class ExportExcel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;

    return (
      <Card elevation={0} className={classes.root}>
        <CardContent>
          <Grid container direction="row" justify="center" alignItems="center">
            <Button
              color="primary"
              variant="outlined"
              className="mt-1"
              onClick={this.props.onRequestDownload}>
              <span className="btn-wrapper--icon">
                <FontAwesomeIcon icon={faFileDownload} className={classes.smallFilter} />
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
}

ExportExcel.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  root: {
    width: 1000,
    maxHeight: 600,
    overflowY: 'auto',
  },
  smallFilter: {
    fontSize: 15,
    margin: theme.spacing(0),
  },
});

export default compose(withStyles(styles))(ExportExcel);
