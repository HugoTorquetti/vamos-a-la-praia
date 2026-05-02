const express = require("express");
const { authController } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

function registerAuthRoutes(app) {
  const router = express.Router();

  router.post("/auth/register", authController.register);
  router.post("/auth/login", authController.login);
  router.get("/auth/me", requireAuth, authController.me);

  app.use("/", router);
}

module.exports = { registerAuthRoutes };

