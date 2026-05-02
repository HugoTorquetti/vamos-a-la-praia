const { registerHealthRoutes } = require("./health.routes");
const { registerAuthRoutes } = require("./auth.routes");
const { registerUsersRoutes } = require("./users.routes");
const { registerDocsRoutes } = require("./docs.routes");

function registerRoutes(app) {
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  registerUsersRoutes(app);
  registerDocsRoutes(app);
}

module.exports = { registerRoutes };

