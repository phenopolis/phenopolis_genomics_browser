import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import PublicationList from '../components/Publication/PublicationList';

class Home extends React.Component {
	render() {
		return (
			<React.Fragment>
				<CssBaseline />
				<HomeBanner BannerText='Publications' />
				<PublicationList />
			</React.Fragment>
		);
	}
}

export default Home;
