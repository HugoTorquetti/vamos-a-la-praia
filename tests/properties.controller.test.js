jest.mock("../src/services/property.service", () => ({
  propertyService: {
    listProperties: jest.fn(),
  },
}));

const { propertiesController } = require("../src/controllers/properties.controller");
const { propertyService } = require("../src/services/property.service");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("propertiesController.list", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with data and pagination when properties exist", async () => {
    const serviceResult = {
      data: [{ _id: "1", title: "Apto", city: "Santos", uf: "SP", price: 100 }],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    };
    propertyService.listProperties.mockResolvedValue(serviceResult);

    const req = { query: {} };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(serviceResult);
  });

  it("returns 200 with empty array when no properties exist", async () => {
    const serviceResult = {
      data: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    };
    propertyService.listProperties.mockResolvedValue(serviceResult);

    const req = { query: {} };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data).toEqual([]);
  });

  it("passes city filter from query string to service", async () => {
    propertyService.listProperties.mockResolvedValue({ data: [], pagination: {} });

    const req = { query: { city: "Santos" } };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(propertyService.listProperties).toHaveBeenCalledWith(
      expect.objectContaining({ city: "Santos" })
    );
  });

  it("passes uf filter from query string to service", async () => {
    propertyService.listProperties.mockResolvedValue({ data: [], pagination: {} });

    const req = { query: { uf: "SP" } };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(propertyService.listProperties).toHaveBeenCalledWith(
      expect.objectContaining({ uf: "SP" })
    );
  });

  it("passes pagination params from query string to service", async () => {
    propertyService.listProperties.mockResolvedValue({ data: [], pagination: {} });

    const req = { query: { page: "2", pageSize: "5" } };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(propertyService.listProperties).toHaveBeenCalledWith(
      expect.objectContaining({ page: "2", pageSize: "5" })
    );
  });

  it("calls next with error when service throws", async () => {
    const err = new Error("db error");
    propertyService.listProperties.mockRejectedValue(err);

    const req = { query: {} };
    const res = mockRes();

    await propertiesController.list(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
