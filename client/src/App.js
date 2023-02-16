// client/src/App.js
import "./App.css";

import { BrowserRouter } from "react-router-dom";
import React from "react";
import Main from "./components/Main/Main";

function App() {


  return (
    <BrowserRouter>
      <div className="App">
        <Main />
      </div>
    </BrowserRouter>
  );
}

export default App;