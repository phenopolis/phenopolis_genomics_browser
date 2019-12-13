import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import TeamMembers from '../components/About/TeamMembers';

import { withTranslation } from 'react-i18next';

class About extends React.Component {
  render() {
    const { t, i18n } = this.props;

    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText={t('About.Title')} />
        <TeamMembers />
      </>
    );
  }
}

export default withTranslation()(About);
