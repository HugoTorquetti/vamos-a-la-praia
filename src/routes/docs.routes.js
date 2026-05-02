const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

function registerDocsRoutes(app) {
  const router = express.Router();
  const specPath = path.join(__dirname, "..", "docs", "openapi.yaml");
  const openapiSpec = YAML.load(specPath);

  router.use("/docs", swaggerUi.serve);
  router.get("/docs", swaggerUi.setup(openapiSpec, { explorer: true }));

  app.use("/", router);
}

module.exports = { registerDocsRoutes };

