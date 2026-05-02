const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) return res.status(401).json({ message: "Missing bearer token" });

  try {
    const env = getEnv();
    const payload = jwt.verify(token, env.jwt.secret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { requireAuth };

