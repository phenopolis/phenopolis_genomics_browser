import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import TeamMembers from '../components/About/TeamMembers';

class About extends React.Component {
  render() {
    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText='About Us' />
        <TeamMembers />
      </>
    );
  }
}

export default About;
