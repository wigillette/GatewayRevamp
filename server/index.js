// server/index.js
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')

// Modules
const userAuth = require("./app/routes/auth-routes")

app.use(cors());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

userAuth(app);


// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});