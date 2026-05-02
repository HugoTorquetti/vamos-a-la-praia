const healthController = {
  get: (req, res) => res.json({ status: "ok" }),
};

module.exports = { healthController };

