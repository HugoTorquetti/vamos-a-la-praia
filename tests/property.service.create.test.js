jest.mock("../src/models/Property", () => ({
  Property: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
  VALID_UFS: ["SP", "RJ"],
}));

const { propertyService } = require("../src/services/property.service");
const { Property } = require("../src/models/Property");

describe("propertyService.createProperty", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates and returns the property with all provided fields", async () => {
    const input = {
      title: "Apto",
      description: "Vista pro mar",
      city: "Santos",
      uf: "SP",
      price: 350,
      ownerId: "user42",
    };
    const fakeProperty = { _id: "prop1", ...input };
    Property.create.mockResolvedValue(fakeProperty);

    const result = await propertyService.createProperty(input);

    expect(Property.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(fakeProperty);
  });

  it("persists ownerId on the created document", async () => {
    const ownerId = "owner-abc";
    Property.create.mockResolvedValue({ _id: "prop1", ownerId });

    await propertyService.createProperty({
      title: "Casa",
      description: "desc",
      city: "Santos",
      uf: "SP",
      price: 200,
      ownerId,
    });

    expect(Property.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId }));
  });

  it("propagates errors thrown by Property.create", async () => {
    const err = new Error("db error");
    Property.create.mockRejectedValue(err);

    await expect(
      propertyService.createProperty({ title: "x", description: "x", city: "x", uf: "SP", price: 1, ownerId: "u1" })
    ).rejects.toThrow("db error");
  });
});
