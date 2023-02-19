const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-secret");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login

exports.login = (req, res) => {
    const [email, password] = Object.values(req.body);

    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    const userId = 0; // change to user Id in the database
    const token = jwt.sign({ token: userId }, config.secret, {expiresIn: 86400} );
    res.status(200).end(JSON.stringify({
        token: token
    }))
}

exports.register = (req, res) => {
    const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    // Add user to database if necessary, else send invalid response back
    const userId = 0; // change to user Id in the database
    const token = jwt.sign({ token: userId }, config.secret, {expiresIn: 86400} );
    res.status(200).end(JSON.stringify({
        token: token
    }))
}