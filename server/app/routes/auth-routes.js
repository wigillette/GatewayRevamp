const controller = require("../controllers/user-auth");

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/login", controller.login);

  app.post("/register", controller.register);
};