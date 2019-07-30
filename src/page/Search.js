import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';

import SearchBox from '../components/Search/SearchBox';

class Search extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<SearchBox />
			</React.Fragment>
		);
	}
}

export default Search;
