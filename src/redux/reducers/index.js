import { combineReducers } from 'redux';
import users from './users';
import snacks from './snacks';
import Statistics from './statistic';
import Search from './search';
import Preview from './preview';

export default combineReducers({
  users,
  snacks,
  Statistics,
  Search,
  Preview,
});
