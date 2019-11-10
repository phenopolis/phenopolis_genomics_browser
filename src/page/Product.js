import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import HomeBanner from '../components/Home/HomeBanner';
import Pricing from '../components/Product/Pricing';

class Product extends React.Component {
  render() {
    return (
      <>
        <CssBaseline />
        <HomeBanner BannerText='Purchase Analysis Service' BannerImage="Product.jpg" />
        <Pricing />
      </>
    );
  }
}

export default Product;
