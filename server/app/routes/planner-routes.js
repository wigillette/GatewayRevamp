const { authJwt } = require("../middleware");
const controller = require("../controllers/planner");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Adapted from: https://github.com/bezkoder/node-js-jwt-auth/blob/master/app/routes/user.routes.js
  app.get("/removeCourse", [authJwt.verifyToken], controller.removeCourse);
  app.get("/addCourses", [authJwt.verifyToken], controller.addCourses);
};