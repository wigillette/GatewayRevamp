const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login

exports.login = (req, res) => {
    const [email, password] = Object.values(req.body);

    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    const userId = 0; // change to user Id in the database
    const token = jwt.sign({ token: userId }, config.secret, {expiresIn: config.jwtExpiration} );
    res.status(200).json({
        token: token
    })
}

exports.register = (req, res) => {
    const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
    console.log(email, password, fName, lName, gradDate, major, headshot);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    // Add user to database if necessary, else send invalid response back
    const userId = 0; // change to user Id in the database
    // Encrypt password
    const token = jwt.sign({ id: userId }, config.secret, {expiresIn: config.jwtExpiration} );
    
    res.status(200).json({
        accessToken: token,
        email: email,
        fName: fName,
        lName: lName,
        gradDate: gradDate,
        major: major,
        headshot: headshot
    })
}

exports.refreshToken = async (req, res) => {
    // Adapted from: https://www.bezkoder.com/jwt-refresh-token-node-js/
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required" });
    }

}