import React, { Suspense } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { blue, red } from '@material-ui/core/colors';

import './assets/carolina/base.scss';

import HomeAppBar from './page/HomeAppBar';
import Footer from './page/Footer';
import Login from './page/Login';
import Home from './page/Home';
import Product from './page/Product';
import Publication from './page/Publication';
import Search from './page/Search';
import AuthCheck from './page/AuthCheck';
import CustomizedSnackbars from './page/CustomizedSnackbars';

import Gene from './page/Gene';
import HPO from './page/HPO';
import Individual from './page/Individual';
import Variant from './page/Variant';
import MyPatient from './page/MyPatient';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import Loading from './components/General/Loading';

const outerTheme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: red[500],
    },
  },
});

function App() {
  return (
    <CookiesProvider>
      <Suspense fallback={<Loading message={'Loading Phenopolis...'} />}>
        <Router>
          <AuthCheck />
          <CustomizedSnackbars />

          <ThemeProvider theme={outerTheme}>
            <HomeAppBar>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/publications" component={Publication} />
              <Route path="/product" component={Product} />
              <Route path="/search" component={Search} />
              <Route path="/my_patients" component={MyPatient} />
              <Route path="/gene/:geneId" component={Gene} />
              <Route path="/hpo/:hpoId" component={HPO} />
              <Route path="/individual/:individualId" component={Individual} />
              <Route path="/variant/:variantId" component={Variant} />
            </HomeAppBar>
            <Footer />
          </ThemeProvider>
        </Router>
      </Suspense>
    </CookiesProvider>
  );
}

export default App;
