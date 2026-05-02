const { userService } = require("../services/user.service");

const MIN_PASSWORD_LENGTH = 8;

function validateRegisterBody({ name, email, password }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push({ field: "name", message: "name is required" });
  }

  if (!email || !email.trim()) {
    errors.push({ field: "email", message: "email is required" });
  }

  if (!password) {
    errors.push({ field: "password", message: "password is required" });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ field: "password", message: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  return errors;
}

const usersController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body || {};

      const errors = validateRegisterBody({ name, email, password });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const user = await userService.createUser({ email, password, name });
      return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { usersController, validateRegisterBody };
