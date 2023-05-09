import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeMainPart from '../components/Home/HomeMainPart';
import HomeBanner from '../components/Home/HomeBanner';

const Home = () => {
  return (
    <>
      <CssBaseline />
      <HomeBanner BannerText="Open-source Genome Browser" />
      <HomeMainPart />
    </>
  );
};

export default Home;
