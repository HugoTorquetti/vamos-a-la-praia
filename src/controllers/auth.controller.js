const { authService } = require("../services/auth.service");
const { userService } = require("../services/user.service");

const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password, name } = req.body || {};
      const user = await userService.createUser({ email, password, name });
      const token = authService.issueToken({ userId: user.id, email: user.email });
      return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      const user = await authService.verifyCredentials({ email, password });
      const token = authService.issueToken({ userId: user.id, email: user.email });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return next(err);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.userId);
      return res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { authController };

