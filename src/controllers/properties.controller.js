const { propertyService } = require("../services/property.service");

const propertiesController = {
  list: async (req, res, next) => {
    try {
      const { page, pageSize, city, uf } = req.query;
      const result = await propertyService.listProperties({ page, pageSize, city, uf });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { propertiesController };
