function notFoundHandler(req, res) {
  res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
}

module.exports = { notFoundHandler, errorHandler };

