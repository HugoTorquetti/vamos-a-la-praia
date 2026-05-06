jest.mock("../src/services/auth.service", () => ({
  authService: {
    verifyCredentials: jest.fn(),
    issueToken: jest.fn(),
  },
}));

jest.mock("../src/services/user.service", () => ({
  userService: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
  },
}));

const { authController, validateLoginBody } = require("../src/controllers/auth.controller");
const { authService } = require("../src/services/auth.service");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("validateLoginBody", () => {
  it("returns no errors for valid input", () => {
    const errors = validateLoginBody({ email: "ana@email.com", password: "SenhaForte123" });
    expect(errors).toHaveLength(0);
  });

  it("requires email", () => {
    const errors = validateLoginBody({ email: "", password: "SenhaForte123" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "email", message: "email is required" }]));
  });

  it("requires password", () => {
    const errors = validateLoginBody({ email: "ana@email.com", password: "" });
    expect(errors).toEqual(expect.arrayContaining([{ field: "password", message: "password is required" }]));
  });

  it("returns both errors when email and password are missing", () => {
    const errors = validateLoginBody({ email: "", password: "" });
    expect(errors).toHaveLength(2);
  });
});

describe("authController.login", () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 with errors list when email is missing", async () => {
    const req = { body: { email: "", password: "SenhaForte123" } };
    const res = mockRes();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Array) });
    expect(authService.verifyCredentials).not.toHaveBeenCalled();
  });

  it("returns 400 with errors list when password is missing", async () => {
    const req = { body: { email: "ana@email.com", password: "" } };
    const res = mockRes();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: expect.any(Array) });
  });

  it("returns 200 with token and user data on valid credentials", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana" };
    authService.verifyCredentials.mockResolvedValue(fakeUser);
    authService.issueToken.mockReturnValue("jwt.token.here");

    const req = { body: { email: "ana@email.com", password: "SenhaForte123" } };
    const res = mockRes();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "jwt.token.here",
      user: { id: "abc123", email: "ana@email.com", name: "Ana" },
    });
  });

  it("response body does not contain password", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana", passwordHash: "hash" };
    authService.verifyCredentials.mockResolvedValue(fakeUser);
    authService.issueToken.mockReturnValue("jwt.token.here");

    const req = { body: { email: "ana@email.com", password: "SenhaForte123" } };
    const res = mockRes();

    await authController.login(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.user).not.toHaveProperty("password");
    expect(body.user).not.toHaveProperty("passwordHash");
  });

  it("calls next with 401 error when service rejects credentials", async () => {
    const err = new Error("invalid credentials");
    err.statusCode = 401;
    authService.verifyCredentials.mockRejectedValue(err);

    const req = { body: { email: "ana@email.com", password: "errada" } };
    const res = mockRes();

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it("calls issueToken with userId and email", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana" };
    authService.verifyCredentials.mockResolvedValue(fakeUser);
    authService.issueToken.mockReturnValue("jwt.token.here");

    const req = { body: { email: "ana@email.com", password: "SenhaForte123" } };
    const res = mockRes();

    await authController.login(req, res, next);

    expect(authService.issueToken).toHaveBeenCalledWith({ userId: "abc123", email: "ana@email.com" });
  });
});
