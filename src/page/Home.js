import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeAppBar from '../components/Home/HomeAppBar';
import HomeMainPart from '../components/Home/HomeMainPart';

class Home extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<HomeAppBar />
				<HomeMainPart />
			</React.Fragment>
		);
	}
}

export default Home;
