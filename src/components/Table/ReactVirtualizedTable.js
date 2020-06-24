import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { AutoSizer } from 'react-virtualized';

import MuiVirtualizedTable from './MuiVirtualizedTable';

class ReactVirtualizedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      variants: null,
      filtered: null,
      header: null,
      filter: [],
    };
  }

  componentWillMount() {
    var newHeader = [];
    this.props.mycolumn.forEach((element) => {
      newHeader.push({
        width: 250,
        label: element.name,
        dataKey: element.key,
      });
    });
    this.setState({
      header: newHeader,
      filtered: this.props.data,
      variants: this.props.data,
      loaded: true,
    });
  }

  render() {
    return (
      <Paper
        elevation={6}
        style={{ height: '60vh', width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
        {this.state.loaded ? (
          // <DynamicHeightTableColumn list={this.state.filtered} width={5000} />
          <MuiVirtualizedTable
            rows={this.state.filtered}
            rowCount={this.state.filtered.length}
            rowGetter={({ index }) => this.state.filtered[index]}
            columns={this.state.header}
            // onClick={(item, action) => this.props.onClick(item, action)}
          />
        ) : null}
      </Paper>
    );
  }
}

ReactVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

const tablestyles = (theme) => ({});

export default withStyles(tablestyles)(ReactVirtualizedTable);
