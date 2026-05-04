const { Router } = require("express");
const { propertiesController } = require("../controllers/properties.controller");

function registerPropertiesRoutes(app) {
  const router = Router();

  router.get("/", propertiesController.list);

  app.use("/properties", router);
}

module.exports = { registerPropertiesRoutes };
