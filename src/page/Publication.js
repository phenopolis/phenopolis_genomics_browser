import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import PublicationList from '../components/Publication/PublicationList';

class Publication extends React.Component {
  render() {
    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText='Publications' />
        <PublicationList />
      </>
    );
  }
}

export default Publication;
