import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeMainPart from '../components/Home/HomeMainPart';

class Home extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />

				<HomeMainPart />
			</React.Fragment>
		);
	}
}

export default Home;
