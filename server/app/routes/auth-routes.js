const controller = require('../controllers/user-auth')

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  // Here are our API endpoints:
  app.post('/login', controller.login)
  app.post('/register', controller.register)
  app.post('/refresh', controller.refreshToken)
}
