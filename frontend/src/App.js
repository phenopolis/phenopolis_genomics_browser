import React, { Suspense } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { blue, red } from '@material-ui/core/colors';

import './assets/carolina/base.scss';
import './assets/scss/base.scss';

import HomeAppBar from './page/HomeAppBar';
import Login from './page/Login';
import Home from './page/Home';
import Dashboard from './page/Dashboard';
import Publication from './page/Publication';
import NotFoundPage from './page/NotFoundPage';
import CreatePatient from './page/CreatePatient';
import ManagePatient from './page/ManagePatient';
import ManageUser from './page/ManageUser';
import ConfirmPage from './page/ConfirmPage';

import CustomizedSnackbars from './components/CustomizedSnackbars/CustomizedSnackbars';
import AuthCheck from './components/AuthCheck/AuthCheck';
import GlobalDialogs from './components/GlobalDialogs/GlobalDialogs';
import ScrollToTop from './components/General/ScrollToTop';

import Gene from './page/Gene';
import HPO from './page/HPO';
import Individual from './page/Individual';
import Variant from './page/Variant';
import MyPatient from './page/MyPatient';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
          <GlobalDialogs />
          <ScrollToTop />
          <ThemeProvider theme={outerTheme}>
            <HomeAppBar>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/login" component={Login} />
                <Route path="/create_patient" component={CreatePatient} />
                <Route path="/manage_patient" component={ManagePatient} />
                <Route path="/manage_user" component={ManageUser} />
                <Route path="/publications" component={Publication} />
                <Route path="/my_patients" component={MyPatient} />
                <Route path="/gene/:geneId" component={Gene} />
                <Route path="/hpo/:hpoId" component={HPO} />
                <Route path="/individual/:individualId" component={Individual} />
                <Route path="/variant/:variantId" component={Variant} />
                <Route path="/confirm" component={ConfirmPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </HomeAppBar>
          </ThemeProvider>
        </Router>
      </Suspense>
    </CookiesProvider>
  );
}

export default App;
