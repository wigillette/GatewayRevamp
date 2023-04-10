const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
const { createToken } = require("./refresh-token");
const { fetchDB } = require("../model");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login
const db = fetchDB(); // Retrieve the database

// Validate that the login matches the patterns so that we do not make unnecessary HTTP requests
const validateLogin = (email, password) => {
    const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
    const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null;
    return emailValid && passwordValid;
}

// Check if the major exists in the majors table
const validateMajor = (major) => {
    if (db) {
        let query = 'SELECT * FROM Majors WHERE ID = ?';
        return new Promise((resolve, reject) => {
            db.all(query, [major], (err, rows) => {
                if (err) {
                    reject(err.message)
                } else if (rows.length > 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
    }
}

// Validate that the registration matches the patterns so that we do not make unnecessary HTTP requests
const validateRegistration = async (email, password, fName, lName, gradDate, major, headshot) => {
    const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
    const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null;
    const fNameValid = fName.match(/[A-Za-z]/) !== null;
    const lNameValid = lName.match(/[A-Za-z]/) !== null;
    const gradDateValid = gradDate !== null && gradDate.length === 5 && ["F,S"].includes(gradDate.charAt(0)) && parseInt(gradDate.substring(1,gradDate.length)) !== NaN;
    const majorValid = major !== null && await validateMajor(major);
    const headshotValid = headshot !== null && [".png", ".jpg", ".jpeg"].includes(headshot.substring(headshot.length-4, headshot.length))
    return emailValid && passwordValid && fNameValid && lNameValid && gradDateValid && majorValid && headshotValid;
}

exports.login = (req, res) => {
    const [email, password] = Object.values(req.body);
    const validParameters = validateLogin(email,password);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    if (db && validParameters) {
        let query = "SELECT * FROM Students WHERE email = ?";
        db.serialize(() => {
            db.all(query, [email], (err, rows) => {
                if (err) {
                    res.status(500).json({message: err.message});
                } else {
                    const dataEntry = rows[0];
                    console.log(dataEntry);
                    if (dataEntry) {
                        const passwordIsValid = bcrypt.compareSync(password, dataEntry.password);
                        if (!passwordIsValid) {
                            res.status(401).json({message: "Invalid Password!"});
                        } else {
                            const userId = dataEntry.ID; // change to user Id in the database
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
                        res.status(404).json({ message: "User not found!" });
                    }
                }
            });
        })
    } else {
        res.status(404).json({ message: "Database not initialized!" });
    }
}


exports.register = (req, res) => {
    const [email, password, fName, lName, gradDate, major, headshot] = Object.values(req.body);
    // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
    // TO-DO: Check if a user already exists in the database with that email
    const validParameters = validateRegistration(email, password, fName, lName, gradDate, major, headshot);
    if (db && validParameters) {
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