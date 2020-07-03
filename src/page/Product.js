import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import Pricing from '../components/Product/Pricing';

import { withTranslation } from 'react-i18next';

class Product extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText={t('Product.Title')} />
        <Pricing />
      </>
    );
  }
}

export default withTranslation()(Product);
