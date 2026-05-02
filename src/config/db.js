const mongoose = require("mongoose");

async function connectDb(mongodbUri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongodbUri);
  return mongoose.connection;
}

module.exports = { connectDb };

