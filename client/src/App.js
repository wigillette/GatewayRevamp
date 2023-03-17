// client/src/App.js
import "./App.css";
import React from "react";
import Main from "./components/Main/Main";
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import store from "./redux/store";

const App = () => (
    <BrowserRouter>
        <Provider store={store}>
            <div className="App"><Main /></div>
        </Provider>
    </BrowserRouter>
);
export default App;