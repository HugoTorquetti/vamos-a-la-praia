require("dotenv").config();

const { createApp } = require("../src/app");
const { getEnv } = require("../src/config/env");
const { connectDb } = require("../src/config/db");

const app = createApp();

let dbPromise;
async function ensureDb() {
  if (!dbPromise) {
    const env = getEnv();
    dbPromise = connectDb(env.mongodbUri);
  }
  await dbPromise;
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};

