const bcrypt = require("bcryptjs");
const { User } = require("../models/User");

const MIN_PASSWORD_LENGTH = 8;

const userService = {
  createUser: async ({ email, password, name }) => {
    if (!email || !password) {
      const err = new Error("email and password are required");
      err.statusCode = 400;
      throw err;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      const err = new Error(`password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      err.statusCode = 400;
      throw err;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error("email already in use");
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });
    return user;
  },

  getUserById: async (id) => {
    const user = await User.findById(id);
    if (!user) {
      const err = new Error("user not found");
      err.statusCode = 404;
      throw err;
    }
    return user;
  },
};

module.exports = { userService };

