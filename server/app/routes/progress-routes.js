const { authJwt } = require("../middleware");
const controller = require("../controllers/progress");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/assignCore", [authJwt.verifyToken], controller.assignCore);
  app.get("/fetchAssignments", [authJwt.verifyToken], controller.fetchAssignments);
};