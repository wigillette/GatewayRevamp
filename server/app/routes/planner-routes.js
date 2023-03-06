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
  app.post("/removeCourse", [authJwt.verifyToken], controller.removeCourse);
  app.post("/addCourses", [authJwt.verifyToken], controller.addCourses);
  app.get("/fetchPlan", [authJwt.verifyToken], controller.fetchPlan);
};