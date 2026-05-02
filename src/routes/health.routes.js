const express = require("express");
const { healthController } = require("../controllers/health.controller");

function registerHealthRoutes(app) {
  const router = express.Router();
  router.get("/health", healthController.get);
  app.use("/", router);
}

module.exports = { registerHealthRoutes };

