const jwt = require('jsonwebtoken')
const config = require('../config/auth-config')

const { TokenExpiredError } = jwt

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({ unauthorized: true })
  }

  return res.status(401).json({ unauthorized: true })
}

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(403).json({ unauthorized: true })
  } else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        console.log(err)
        return catchError(err, res)
      }
      req.userId = decoded.id
      next()
    })
  }
}

const authJwt = {
  verifyToken
}

module.exports = authJwt
