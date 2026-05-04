jest.mock("../src/models/Property", () => ({
  Property: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const { propertyService } = require("../src/services/property.service");
const { Property } = require("../src/models/Property");

function mockFind(docs) {
  const chain = {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(docs),
  };
  Property.find.mockReturnValue(chain);
  return chain;
}

describe("propertyService.listProperties", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with data array and pagination metadata", async () => {
    const docs = [{ _id: "1", title: "Apto", city: "Santos", uf: "SP", price: 100 }];
    mockFind(docs);
    Property.countDocuments.mockResolvedValue(1);

    const result = await propertyService.listProperties({});

    expect(result.data).toEqual(docs);
    expect(result.pagination).toMatchObject({ page: 1, pageSize: 10, total: 1, totalPages: 1 });
  });

  it("returns empty array when no properties exist", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    const result = await propertyService.listProperties({});

    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it("applies city filter case-insensitively", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    await propertyService.listProperties({ city: "santos" });

    const filterArg = Property.find.mock.calls[0][0];
    expect(filterArg.city).toEqual({ $regex: expect.any(RegExp) });
    expect(filterArg.city.$regex.flags).toContain("i");
  });

  it("applies uf filter", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    await propertyService.listProperties({ uf: "sp" });

    const filterArg = Property.find.mock.calls[0][0];
    expect(filterArg.uf).toEqual({ $regex: expect.any(RegExp) });
  });

  it("applies both city and uf filters simultaneously", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    await propertyService.listProperties({ city: "Santos", uf: "SP" });

    const filterArg = Property.find.mock.calls[0][0];
    expect(filterArg).toHaveProperty("city");
    expect(filterArg).toHaveProperty("uf");
  });

  it("uses default page=1 and pageSize=10 when not provided", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    const result = await propertyService.listProperties({});

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(10);
  });

  it("respects custom page and pageSize", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(25);

    const result = await propertyService.listProperties({ page: 2, pageSize: 5 });

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.pageSize).toBe(5);
    expect(result.pagination.totalPages).toBe(5);
  });

  it("calculates correct totalPages", async () => {
    mockFind([]);
    Property.countDocuments.mockResolvedValue(23);

    const result = await propertyService.listProperties({ pageSize: 10 });

    expect(result.pagination.totalPages).toBe(3);
  });

  it("sorts by createdAt descending", async () => {
    const chain = mockFind([]);
    Property.countDocuments.mockResolvedValue(0);

    await propertyService.listProperties({});

    expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
