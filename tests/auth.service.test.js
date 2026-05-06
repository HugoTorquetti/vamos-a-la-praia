jest.mock("../src/models/User", () => ({
  User: {
    findOne: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../src/config/env", () => ({
  getEnv: () => ({
    jwt: { secret: "test-secret", expiresIn: "1h" },
  }),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked.jwt.token"),
}));

const { authService } = require("../src/services/auth.service");
const { User } = require("../src/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("authService.verifyCredentials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 when email is missing", async () => {
    await expect(authService.verifyCredentials({ email: "", password: "123" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when password is missing", async () => {
    await expect(authService.verifyCredentials({ email: "ana@email.com", password: "" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 401 with generic message when user is not found", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      authService.verifyCredentials({ email: "naocadastrado@email.com", password: "qualquer" })
    ).rejects.toMatchObject({ statusCode: 401, message: "invalid credentials" });
  });

  it("throws 401 with generic message when password is wrong", async () => {
    User.findOne.mockResolvedValue({ id: "123", email: "ana@email.com", passwordHash: "hash" });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.verifyCredentials({ email: "ana@email.com", password: "errada" })
    ).rejects.toMatchObject({ statusCode: 401, message: "invalid credentials" });
  });

  it("returns user when credentials are valid", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", passwordHash: "hash" };
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.verifyCredentials({ email: "ana@email.com", password: "SenhaForte123" });

    expect(result).toEqual(fakeUser);
  });

  it("does not distinguish between 'user not found' and 'wrong password' in error message", async () => {
    // user not found
    User.findOne.mockResolvedValue(null);
    const errNotFound = await authService.verifyCredentials({ email: "x@x.com", password: "abc" }).catch((e) => e);

    // wrong password
    User.findOne.mockResolvedValue({ id: "1", email: "x@x.com", passwordHash: "hash" });
    bcrypt.compare.mockResolvedValue(false);
    const errWrongPass = await authService.verifyCredentials({ email: "x@x.com", password: "abc" }).catch((e) => e);

    expect(errNotFound.message).toBe(errWrongPass.message);
    expect(errNotFound.statusCode).toBe(errWrongPass.statusCode);
  });
});

describe("authService.issueToken", () => {
  it("returns a signed JWT with userId and email", () => {
    const token = authService.issueToken({ userId: "abc123", email: "ana@email.com" });

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "abc123", email: "ana@email.com" },
      "test-secret",
      expect.objectContaining({ expiresIn: "1h" })
    );
    expect(token).toBe("mocked.jwt.token");
  });
});
