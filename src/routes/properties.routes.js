const { Router } = require("express");
const { propertiesController } = require("../controllers/properties.controller");
const { requireAuth } = require("../middleware/auth");

function registerPropertiesRoutes(app) {
  const router = Router();

  router.get("/", propertiesController.list);
  router.post("/", requireAuth, propertiesController.create);

  app.use("/properties", router);
}

module.exports = { registerPropertiesRoutes };
