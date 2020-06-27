import { combineReducers } from 'redux';
import users from './users';
import snacks from './snacks';
import Statistics from "./statistic";

export default combineReducers({
    users,
    snacks ,
    Statistics
});
