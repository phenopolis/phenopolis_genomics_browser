import { combineReducers } from 'redux';
import users from './users';
import snacks from './snacks';
import Statistics from './statistic';
import Search from './search';
import Preview from './preview';
import Login from './auth';
import IsLoggedIn from './isLoggedIn';
import Patients from './patients';
import Gene from './gene';
import Variant from './variant';
import HPO from './hpo';
import Individuals from './individuals';

export default combineReducers({
  users,
  snacks,
  Statistics,
  Search,
  Preview,
  Login,
  IsLoggedIn,
  Patients,
  Gene,
  Variant,
  HPO,
  Individuals,
});
