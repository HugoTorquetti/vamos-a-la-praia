const { Property } = require("../models/Property");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const propertyService = {
  listProperties: async ({ page, pageSize, city, uf } = {}) => {
    const currentPage = Math.max(1, parseInt(page) || DEFAULT_PAGE);
    const currentPageSize = Math.max(1, parseInt(pageSize) || DEFAULT_PAGE_SIZE);
    const skip = (currentPage - 1) * currentPageSize;

    const filter = {};
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, "i") };
    if (uf) filter.uf = { $regex: new RegExp(`^${uf}$`, "i") };

    const [data, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(currentPageSize).lean(),
      Property.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        total,
        totalPages: Math.ceil(total / currentPageSize),
      },
    };
  },
};

module.exports = { propertyService };
