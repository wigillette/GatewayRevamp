import { combineReducers } from "redux";
import authReducer from "./auth";
import planReducer from "./planner";

export default combineReducers({authReducer, planReducer});