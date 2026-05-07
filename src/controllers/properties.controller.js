const { propertyService } = require("../services/property.service");
const { VALID_UFS } = require("../models/Property");

function validateCreatePropertyBody({ title, description, city, uf, price }) {
  const errors = [];

  if (!title || !String(title).trim()) {
    errors.push({ field: "title", message: "title is required" });
  }

  if (!description || !String(description).trim()) {
    errors.push({ field: "description", message: "description is required" });
  }

  if (!city || !String(city).trim()) {
    errors.push({ field: "city", message: "city is required" });
  }

  if (!uf || !String(uf).trim()) {
    errors.push({ field: "uf", message: "uf is required" });
  } else if (!VALID_UFS.includes(String(uf).toUpperCase())) {
    errors.push({ field: "uf", message: `uf must be one of: ${VALID_UFS.join(", ")}` });
  }

  const parsedPrice = Number(price);
  if (price === undefined || price === null || price === "") {
    errors.push({ field: "price", message: "price is required" });
  } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.push({ field: "price", message: "price must be greater than 0" });
  }

  return errors;
}

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

  create: async (req, res, next) => {
    try {
      const { title, description, city, uf, price } = req.body || {};
      const ownerId = req.user.userId;

      const errors = validateCreatePropertyBody({ title, description, city, uf, price });
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const property = await propertyService.createProperty({
        title,
        description,
        city,
        uf: String(uf).toUpperCase(),
        price: Number(price),
        ownerId,
      });

      return res.status(201).json({ property });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { propertiesController, validateCreatePropertyBody };
