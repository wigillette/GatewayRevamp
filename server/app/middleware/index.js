const authJwt = require('./auth-token')
const middleware = { authJwt }
module.exports = middleware
