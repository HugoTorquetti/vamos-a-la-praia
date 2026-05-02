const { Router } = require("express");
const { usersController } = require("../controllers/users.controller");

function registerUsersRoutes(app) {
  const router = Router();

  router.post("/", usersController.register);

  app.use("/users", router);
}

module.exports = { registerUsersRoutes };
