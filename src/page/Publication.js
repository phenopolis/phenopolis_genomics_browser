import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';

class Home extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<HomeBanner BannerText='Publications' />
			</React.Fragment>
		);
	}
}

export default Home;
