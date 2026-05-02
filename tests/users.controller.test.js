const { validateRegisterBody, usersController } = require("../src/controllers/users.controller");

jest.mock("../src/services/user.service", () => ({
  userService: {
    createUser: jest.fn(),
  },
}));

const { userService } = require("../src/services/user.service");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("validateRegisterBody", () => {
  it("returns no errors for valid input", () => {
    const errors = validateRegisterBody({ name: "Ana", email: "ana@email.com", password: "12345678" });
    expect(errors).toHaveLength(0);
  });

  it("requires name", () => {
    const errors = validateRegisterBody({ name: "", email: "ana@email.com", password: "12345678" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "name", message: "name is required" }]));
  });

  it("requires email", () => {
    const errors = validateRegisterBody({ name: "Ana", email: "", password: "12345678" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "email", message: "email is required" }]));
  });

  it("requires password", () => {
    const errors = validateRegisterBody({ name: "Ana", email: "ana@email.com", password: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "password", message: "password is required" }]));
  });

  it("rejects password shorter than 8 characters", () => {
    const errors = validateRegisterBody({ name: "Ana", email: "ana@email.com", password: "1234" });
    expect(errors).toEqual(
      expect.arrayContaining([{ field: "password", message: "password must be at least 8 characters" }])
    );
  });

  it("returns multiple errors for multiple invalid fields", () => {
    const errors = validateRegisterBody({ name: "", email: "", password: "" });
    expect(errors).toHaveLength(3);
  });
});

describe("usersController.register", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 with errors list when fields are invalid", async () => {
    const req = { body: { name: "", email: "", password: "" } };
    const res = mockRes();

    await usersController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Array) });
    expect(userService.createUser).not.toHaveBeenCalled();
  });

  it("returns 201 with user data (no password) on success", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana" };
    userService.createUser.mockResolvedValue(fakeUser);

    const req = { body: { name: "Ana", email: "ana@email.com", password: "12345678" } };
    const res = mockRes();

    await usersController.register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: { id: "abc123", email: "ana@email.com", name: "Ana" } });
    const body = res.json.mock.calls[0][0];
    expect(body.user).not.toHaveProperty("password");
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it("calls next with error when service throws 409 for duplicate email", async () => {
    const err = new Error("email already in use");
    err.statusCode = 409;
    userService.createUser.mockRejectedValue(err);

    const req = { body: { name: "Ana", email: "ana@email.com", password: "12345678" } };
    const res = mockRes();

    await usersController.register(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
