// server/index.js
const path = require('path');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Handle login
app.use('/login', (req, res) => {
  res.json({
    token: 'test123'
  });
});

// Handle register
app.use('/register', (req, res) => {
  const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
  // Save this data to the database
  res.end(JSON.stringify({ token: 'test123' }));
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});