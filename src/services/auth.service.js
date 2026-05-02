const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getEnv } = require("../config/env");
const { User } = require("../models/User");

const authService = {
  issueToken: ({ userId, email }) => {
    const env = getEnv();
    return jwt.sign({ userId, email }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
  },

  verifyCredentials: async ({ email, password }) => {
    if (!email || !password) {
      const err = new Error("email and password are required");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err = new Error("invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    return user;
  },
};

module.exports = { authService };

