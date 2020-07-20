import { combineReducers } from 'redux';
import users from './users';
import snacks from './snacks';
import Statistics from './statistic';
import Search from './search';

export default combineReducers({
  users,
  snacks,
  Statistics,
  Search,
});
