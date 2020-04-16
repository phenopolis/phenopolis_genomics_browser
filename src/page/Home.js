import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeMainPart from '../components/Home/HomeMainPart';
import HomeBanner from '../components/Home/HomeBanner';

class Home extends React.Component {
  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <HomeBanner BannerText='Phenopolis Dev Version' />
        <HomeMainPart />
      </React.Fragment>
    );
  }
}

export default Home;
