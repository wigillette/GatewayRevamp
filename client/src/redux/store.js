import { applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import rootReducer from "./reducers";

const middleware = [thunk];
const store = configureStore(rootReducer, composeWithDevTools(applyMiddleware(...middleware)));
export default store;