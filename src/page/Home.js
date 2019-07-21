import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeAppBar from '../components/HomeAppBar';

class Home extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<HomeAppBar />
			</React.Fragment>
		);
	}
}

export default Home;
