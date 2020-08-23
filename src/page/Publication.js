import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import PublicationList from '../components/Publication/PublicationList';
import { useTranslation } from 'react-i18next';

const Publication = () => {
  const { t } = useTranslation();

  return (
    <>
      <CssBaseline />
      <PublicationList />
    </>
  );
};

export default Publication;
