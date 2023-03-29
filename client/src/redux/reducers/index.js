import { combineReducers } from "redux";
import authReducer from "./auth";
import planReducer from "./planner";
import progressReducer from "./progress"

export default combineReducers({authReducer, planReducer, progressReducer});