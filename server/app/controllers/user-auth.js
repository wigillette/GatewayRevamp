const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth-config");
const { createToken } = require("./refresh-token");
const { fetchDB } = require("../model");
// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login

exports.login = async (req, res) => {
    /// TODO - Get the major from the Majors table
    try {
        const db = await fetchDB();
        const { email, password } = req.body;
        let query = "SELECT * FROM Students WHERE email = ?"
        const dataEntry = await db.get(query, [email])        
        if (dataEntry) {
            const passwordIsValid = bcrypt.compareSync(password, dataEntry.password)
            if (!passwordIsValid) {
                res.status(401).json({message: "Invalid Password!"})
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
            res.status(404).json({ message: "User not found!" });
        }
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

exports.register = async (req, res) => {
    try {
        const db = await fetchDB(); 
        const { email, password, fName, lName, gradDate, major, headshot } = req.body;
        const query = 'INSERT INTO Students (fName, lName, email, password, gradDate, headshot) VALUES (?, ?, ?, ?, ?, ?)'
        const encryptedPassword = bcrypt.hashSync(password, 8)
        const registerResult = await db.run(query, [fName, lName, email, encryptedPassword, gradDate, headshot])
        const lastID = registerResult.lastID || 0

        // Insert major 
        const majorQuery = 'INSERT INTO StudentMajors (studentId, majorId) VALUES (?, ?)'
        const majorResult = await db.run(majorQuery, [lastID, major])
        console.log(`Inserted a major with the ID: ${lastID || 0} - ${fName} ${lName} - ${major} - ${majorResult.lastID}`);
        res.status(200).json({ message: "Account creation successful!", valid: true});
    } catch (err) {
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

