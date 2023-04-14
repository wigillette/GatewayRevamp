const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
const { createToken } = require("./refresh-token");
const { fetchDB } = require("../model");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login


exports.login = async (req, res) => {
    const [email, password] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    const db = await fetchDB(); // Retrieve the database
    try {
        let query = "SELECT * FROM Students WHERE email = ?";
        const rows = await db.all(query, [email]);
        if (rows && rows.length > 0) {
            const dataEntry = rows[0];
            if (dataEntry) {
                const passwordIsValid = bcrypt.compareSync(password, dataEntry.password);
                if (!passwordIsValid) {
                    res.status(401).json({message: "Invalid Password!"});
                } else {
                    const userId = dataEntry.ID;
                    const token = jwt.sign({ id: userId }, config.secret, {expiresIn: config.jwtExpiration} );
                    let refreshToken = createToken(userId);
                    res.status(200).json({
                        accessToken: token,
                        email: dataEntry.email,
                        major: dataEntry.major,
                        startDate: dataEntry.startDate,
                        refreshToken: refreshToken
                    })
                }
            } else {
                res.status(404).json({ message: "Invalid password!" }); // (user not found)
            }
        } else {
            res.status(500).json({message: "Error in user table"});
        }
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}


exports.register = async (req, res) => {
    const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    // TO-DO: Check if a user already exists in the database with that email
    const db = await fetchDB(); // Retrieve the database
    // Encrypt password
    const encryptedPassword = bcrypt.hashSync(password, 8)
    try { 
        let query = 'INSERT INTO Students (fName, lName, email, password, gradDate, headshot) VALUES (?, ?, ?, ?, ?, ?)'
        const res1 = await db.run(query, [fName, lName, email, encryptedPassword, gradDate, headshot])
        query = `INSERT INTO StudentMajors (studentId, majorId) VALUES (?, ?)`
        const res2 = await db.run(query, [lastId, major])
        res.status(200).json({message: "Account creation successful!", valid: true});
    } catch (error) {
        res.status(500).json({message: err.message, valid: false})
    }
}

exports.refreshToken = async (req, res) => {
    // Adapted from: https://www.bezkoder.com/jwt-refresh-token-node-js/
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required" });
    }
}

