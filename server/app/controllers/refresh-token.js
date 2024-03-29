const authConfig = require('../config/auth-config')
const { v4: uuidv4 } = require('uuid')
// const jwt = require('jsonwebtoken')

exports.createToken = (user) => {
  const expiredAt = new Date()
  expiredAt.setSeconds(expiredAt.getSeconds() + authConfig.jwtRefreshExpiration)

  const _token = uuidv4()
  // TO-DO: Store the refresh token in the database

  return _token
}
// exports.verifyExpiration = (token) => token.expiryDate.getTime() < new Date().getTime();
