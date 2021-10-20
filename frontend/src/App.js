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
import EditPatient from './page/EditPatient';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { useSelector } from 'react-redux';

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

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { username } = useSelector((state) => ({
    username: state.Auth.username,
  }));

  return (
    <>
      {username === '' ? (
        <Loading message={'Waiting for Auth Validation'} />
      ) : (
        <Route {...rest} render={(props) => <Component {...rest} {...props} />} />
      )}
    </>
  );
};

function App() {
  return (
    <CookiesProvider>
      {/* <Suspense fallback={<Loading message={'Loading Translation...'} />}> */}
      <Router>
        <ThemeProvider theme={outerTheme}>
          <AuthCheck />
          <CustomizedSnackbars />
          <GlobalDialogs />
          <ScrollToTop />
          <HomeAppBar>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/publications" component={Publication} />
              <Route path="/confirm" component={ConfirmPage} />

              <ProtectedRoute path="/dashboard" component={Dashboard} />
              <ProtectedRoute path="/create_patient" component={CreatePatient} />
              <ProtectedRoute path="/manage_patient" component={ManagePatient} />
              <ProtectedRoute path="/manage_user" component={ManageUser} />
              <ProtectedRoute path="/my_patients" component={MyPatient} />
              <ProtectedRoute path="/gene/:geneId" component={Gene} />
              <ProtectedRoute path="/hpo/:hpoId" component={HPO} />
              <ProtectedRoute path="/individual/:individualId" component={Individual} />
              <ProtectedRoute path="/variant/:variantId" component={Variant} />
              <ProtectedRoute path="/editpatient/:individualId" component={EditPatient} />

              <Route component={NotFoundPage} />
            </Switch>
          </HomeAppBar>
        </ThemeProvider>
      </Router>
      {/* </Suspense> */}
    </CookiesProvider>
  );
}

export default App;
