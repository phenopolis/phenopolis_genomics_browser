import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import PublicationList from '../components/Publication/PublicationList';

import { withTranslation } from 'react-i18next';

class Publication extends React.Component {
  render() {
    const { t, i18n } = this.props;

    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText={t('Publication.Title')} />
        <PublicationList />
      </>
    );
  }
}

export default withTranslation()(Publication)
