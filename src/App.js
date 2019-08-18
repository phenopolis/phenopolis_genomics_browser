import React from 'react';

import HomeAppBar from './page/HomeAppBar';
import Footer from './page/Footer';
import Login from './page/Login';
import Home from './page/Home';
import Publication from './page/Publication';
import Search from './page/Search';
import AuthCheck from './page/AuthCheck';

import Gene from './page/Gene';
import Variant from './page/Variant'

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

function App() {
  return (
    <CookiesProvider>
      <Router>
        <AuthCheck />

        <HomeAppBar />

        <Route exact path='/' component={Home} />
        <Route path='/login' component={Login} />
        <Route path='/publications' component={Publication} />
        <Route path='/search' component={Search} />
        <Route path='/gene/:geneId' component={Gene} />
        <Route path='/variant/:variantId' component={Variant} />

        <Footer />

      </Router>
    </CookiesProvider>
  );
}

export default App;
