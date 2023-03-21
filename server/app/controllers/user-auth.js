const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
const { createToken } = require("./refresh-token");
const { fetchDB } = require("../model");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login
const db = fetchDB(); // Retrieve the database

exports.login = (req, res) => {
    const [email, password] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    if (db) {
        let query = "SELECT * FROM Students WHERE email = ?";
        db.run(query, [email], (err, dataEntry) => {
            if (err) {
                res.status(500).json({message: err.message});
            } else {
                if (dataEntry) {
                    const passwordIsValid = bcrypt.compareSync(password, dataEntry.password);
                    if (!passwordIsValid) {
                        res.status(401).json({
                            accessToken: null,
                            message: "Invalid Password!"
                        });
                    } else {
                        const userId = dataEntry.ID; // change to user Id in the database
                        const token = jwt.sign({ id: userId }, config.secret, {expiresIn: config.jwtExpiration} );
                        let refreshToken = createToken(userId);
                        res.status(200).json({
                            accessToken: token,
                            email: email,
                            refreshToken: refreshToken
                        })
                    }
                } else {
                    res.status(404).json({ message: "User not found!" });
                }
            }
        });
    } else {
        res.status(404).json({ message: "Database not initialized!" });
    }
}

exports.register = (req, res) => {
    const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    // TO-DO: Check if a user already exists in the database with that email
    if (db) {
        let query = 'INSERT INTO Students (fName, lName, email, password, gradDate, headshot) VALUES (?, ?, ?, ?, ?, ?)'
        db.serialize(() => {
            // Encrypt password
            const encryptedPassword = bcrypt.hashSync(password, 8)
            db.run(query, [fName, lName, email, encryptedPassword, gradDate, headshot], 
            (err) => {
                if (err) {
                    res.status(500).json({message: err.message, valid: false})
                    console.error(err);
                } else {
                    let lastId = this.lastID || 0;
                    console.log(`Inserted a row with the ID: ${lastId} - ${fName} ${lName}`)
                    query = `INSERT INTO StudentMajors (studentId, majorId) VALUES (?, ?)`
                    db.run(query, [lastId, major], (err) => {
                        if (err) {
                            res.status(500).json({message: err.message, valid: false})
                        } else {
                            console.log(`Inserted a major with the ID: ${this.lastID || 0} - ${fName} ${lName} - ${major} - ${lastId}`);
                            res.status(200).json({message: "Account creation successful!", valid: true});
                        }
                    })
                }
            })
        })
    } else {
        res.status(404).json({ message: "Database not initialized!" });
    }
}

exports.refreshToken = async (req, res) => {
    // Adapted from: https://www.bezkoder.com/jwt-refresh-token-node-js/
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required" });
    }
}