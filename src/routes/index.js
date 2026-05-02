const { registerHealthRoutes } = require("./health.routes");
const { registerAuthRoutes } = require("./auth.routes");
const { registerDocsRoutes } = require("./docs.routes");

function registerRoutes(app) {
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerDocsRoutes(app);
}

module.exports = { registerRoutes };

