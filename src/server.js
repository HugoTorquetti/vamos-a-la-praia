require("dotenv").config();

const { createApp } = require("./app");
const { getEnv } = require("./config/env");
const { connectDb } = require("./config/db");

async function start() {
  const env = getEnv();
  await connectDb(env.mongodbUri);

  const app = createApp();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on ${env.baseUrl}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

