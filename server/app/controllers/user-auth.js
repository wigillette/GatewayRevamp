const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('../config/auth-config')
const { createToken } = require('./refresh-token')
const { fetchDB } = require('../model')
const gradDates = require('../../../client/src/shared/gradDates.json')
const majors = require('../../../client/src/shared/majors.json')

// User Authentication Module: Controls the encryption of user passwords and generates an authentication token for user login

// Validate that the login matches the patterns so that we do not make unnecessary HTTP requests
const validateLogin = (email, password) => {
  const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null
  const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null
  return emailValid && passwordValid
}
exports.validateLogin = validateLogin

// Validate that the registration matches the patterns so that we do not make unnecessary HTTP requests
const validateRegistration = (email, password, fName, lName, gradDate, startDate, major, headshot) => {
  const emailValid = email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null
  const passwordValid = password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/) !== null
  const fNameValid = fName.match(/[A-Za-z]/) !== null
  const lNameValid = lName.match(/[A-Za-z]/) !== null
  const gradDateValid = gradDate !== null && gradDates.includes(gradDate)
  const startDateValid = startDate !== null && gradDates.includes(startDate)
  const majorValid = major !== null && majors.includes(major)
  const headshotValid = headshot !== null && /\.(png|jpe?g)$/i.test(headshot)
  return emailValid && passwordValid && fNameValid && lNameValid && gradDateValid && majorValid && startDateValid && headshotValid
}

exports.validateRegistration = validateRegistration

exports.login = async (req, res) => {
  const [email, password] = Object.values(req.body)
  // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
  const db = await fetchDB() // Retrieve the database
  try {
    if (validateLogin(email, password)) {
      let query = 'SELECT * FROM Students WHERE email = ?'
      const rows = await db.all(query, [email])
      console.log(rows && rows.length > 0)
      if (rows && rows.length > 0) {
        const dataEntry = rows[0]
        if (dataEntry) {
          const passwordIsValid = bcrypt.compareSync(password, dataEntry.password)
          if (!passwordIsValid) {
            res.status(401).json({ message: 'Invalid Password!' })
          } else {
            query = 'SELECT * FROM StudentMajors WHERE studentId = ?'
            const userId = dataEntry.ID
            const token = jwt.sign({ id: userId }, config.secret, { expiresIn: config.jwtExpiration })
            const refreshToken = createToken(userId)
            const major = await db.get('SELECT StudentMajors.majorId from StudentMajors WHERE studentId = ?', [userId])
            res.status(200).json({
              accessToken: token,
              email: dataEntry.email,
              major: major ? major.majorId : 'NULL',
              startDate: dataEntry.startDate,
              headshot: dataEntry.headshot,
              fName: dataEntry.fName,
              lName: dataEntry.lName,
              refreshToken
            })
          }
        } else {
          res.status(404).json({ message: 'Invalid password!' }) // (user not found)
        }
        const passwordIsValid = bcrypt.compareSync(password, dataEntry.password)
        if (!passwordIsValid) {
          res.status(401).json({ message: 'Invalid Password!' })
        } else {
          query = 'SELECT * FROM StudentMajors WHERE studentId = ?'
          const userId = dataEntry.ID
          const token = jwt.sign({ id: userId }, config.secret, { expiresIn: config.jwtExpiration })
          const refreshToken = createToken(userId)
          const major = await db.get('SELECT StudentMajors.majorId from StudentMajors WHERE studentId = ?', [userId])
          res.status(200).json({
            accessToken: token,
            email: dataEntry.email,
            major: major.majorId,
            startDate: dataEntry.startDate,
            headshot: dataEntry.headshot,
            fName: dataEntry.fName,
            lName: dataEntry.lName,
            refreshToken
          })
        }
      } else {
        res.status(404).json({ message: 'At least one field was invalid!' })
      }
    } else {
      res.status(500).json({ message: 'Invalid password!' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.register = async (req, res) => {
  const { email, password, fName, lName, gradDate, major, headshot, startDate } = req.body
  // Add database checks: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/controllers/auth.controller.js
  // TO-DO: Check if a user already exists in the database with that email
  const db = await fetchDB() // Retrieve the database
  // Encrypt password
  const encryptedPassword = bcrypt.hashSync(password, 8)
  try {
    if (validateRegistration(email, password, fName, lName, gradDate, startDate, major, headshot)) {
      let query = 'INSERT INTO Students (fName, lName, email, password, startDate, gradDate, headshot) VALUES (?, ?, ?, ?, ?, ?, ?)'
      const insertResult = await db.run(query, [fName, lName, email, encryptedPassword, startDate, gradDate, headshot])
      query = 'INSERT INTO StudentMajors (studentId, majorId) VALUES (?, ?)'
      await db.run(query, [insertResult.lastID, major])
      res.status(200).json({ message: 'Account creation successful!', valid: true })
    } else {
      res.status(404).json({ message: 'At least one field was invalid!', valid: false })
    }
  } catch (err) {
    res.status(500).json({ message: err.message, valid: false })
  }
}

exports.refreshToken = (req, res) => {
  // Adapted from: https://www.bezkoder.com/jwt-refresh-token-node-js/
  const { refreshToken: requestToken } = req.body
  if (requestToken == null) {
    return res.status(403).json({ message: 'Refresh Token is required' })
  }
}
