jest.mock("../src/services/property.service", () => ({
  propertyService: {
    listProperties: jest.fn(),
    createProperty: jest.fn(),
  },
}));

jest.mock("../src/models/Property", () => ({
  Property: {},
  VALID_UFS: ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"],
}));

const { propertiesController, validateCreatePropertyBody } = require("../src/controllers/properties.controller");
const { propertyService } = require("../src/services/property.service");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const VALID_BODY = { title: "Apto", description: "Vista pro mar", city: "Santos", uf: "SP", price: 350 };

describe("validateCreatePropertyBody", () => {
  it("returns no errors for valid input", () => {
    expect(validateCreatePropertyBody(VALID_BODY)).toHaveLength(0);
  });

  it("requires title", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, title: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "title", message: "title is required" }]));
  });

  it("requires description", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, description: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "description", message: "description is required" }]));
  });

  it("requires city", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, city: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "city", message: "city is required" }]));
  });

  it("requires uf", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, uf: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "uf", message: "uf is required" }]));
  });

  it("rejects invalid uf", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, uf: "XX" });
    expect(errors[0].field).toBe("uf");
    expect(errors[0].message).toContain("must be one of");
  });

  it("accepts all valid Brazilian UFs", () => {
    const ufs = ["SP", "RJ", "MG", "BA", "DF", "AC"];
    ufs.forEach((uf) => {
      expect(validateCreatePropertyBody({ ...VALID_BODY, uf })).toHaveLength(0);
    });
  });

  it("requires price", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, price: undefined });
    expect(errors).toEqual(expect.arrayContaining([{ field: "price", message: "price is required" }]));
  });

  it("rejects price equal to 0", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, price: 0 });
    expect(errors).toEqual(
      expect.arrayContaining([{ field: "price", message: "price must be greater than 0" }])
    );
  });

  it("rejects negative price", () => {
    const errors = validateCreatePropertyBody({ ...VALID_BODY, price: -10 });
    expect(errors).toEqual(
      expect.arrayContaining([{ field: "price", message: "price must be greater than 0" }])
    );
  });

  it("returns multiple errors when multiple fields are invalid", () => {
    const errors = validateCreatePropertyBody({ title: "", description: "", city: "", uf: "", price: 0 });
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe("propertiesController.create", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 with errors when payload is invalid", async () => {
    const req = { body: { ...VALID_BODY, price: 0 }, user: { userId: "user1" } };
    const res = mockRes();

    await propertiesController.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Array) });
    expect(propertyService.createProperty).not.toHaveBeenCalled();
  });

  it("returns 201 with property on success", async () => {
    const fakeProperty = { _id: "prop1", ...VALID_BODY, ownerId: "user1" };
    propertyService.createProperty.mockResolvedValue(fakeProperty);

    const req = { body: { ...VALID_BODY }, user: { userId: "user1" } };
    const res = mockRes();

    await propertiesController.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ property: fakeProperty });
  });

  it("associates property to authenticated user (ownerId = req.user.userId)", async () => {
    const fakeProperty = { _id: "prop1", ...VALID_BODY, ownerId: "user42" };
    propertyService.createProperty.mockResolvedValue(fakeProperty);

    const req = { body: { ...VALID_BODY }, user: { userId: "user42" } };
    const res = mockRes();

    await propertiesController.create(req, res, next);

    expect(propertyService.createProperty).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "user42" })
    );
  });

  it("normalises UF to uppercase before persisting", async () => {
    const fakeProperty = { _id: "prop1", ...VALID_BODY, uf: "SP", ownerId: "user1" };
    propertyService.createProperty.mockResolvedValue(fakeProperty);

    const req = { body: { ...VALID_BODY, uf: "sp" }, user: { userId: "user1" } };
    const res = mockRes();

    await propertiesController.create(req, res, next);

    expect(propertyService.createProperty).toHaveBeenCalledWith(
      expect.objectContaining({ uf: "SP" })
    );
  });

  it("calls next with error when service throws", async () => {
    const err = new Error("db error");
    propertyService.createProperty.mockRejectedValue(err);

    const req = { body: { ...VALID_BODY }, user: { userId: "user1" } };
    const res = mockRes();

    await propertiesController.create(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
