import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import PublicationList from '../components/Publication/PublicationList';
import { useTranslation } from 'react-i18next';

const Publication = () => {
  const { t } = useTranslation();

  return (
    <>
      <CssBaseline />
      <HomeBanner BannerText={t('Publication.Title')} />
      <PublicationList />
    </>
  );
};

export default Publication;
