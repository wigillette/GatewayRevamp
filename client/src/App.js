// client/src/App.js
import "./App.css";

import React from "react";
import Main from "./components/Main/Main";
import useToken from "./services/useToken";

const App = () => {
    const { token, setToken } = useToken();    
    
    return <div className="App">
      <Main setToken={setToken} />
    </div>
}

export default App;