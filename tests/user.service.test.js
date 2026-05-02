jest.mock("../src/models/User", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn(),
}));

const { userService } = require("../src/services/user.service");
const { User } = require("../src/models/User");

describe("userService.createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 when email is missing", async () => {
    await expect(userService.createUser({ email: "", password: "12345678", name: "Ana" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when password is missing", async () => {
    await expect(userService.createUser({ email: "ana@email.com", password: "", name: "Ana" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when password is shorter than 8 characters", async () => {
    await expect(
      userService.createUser({ email: "ana@email.com", password: "1234", name: "Ana" })
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("8 characters") });
  });

  it("throws 409 when email is already in use", async () => {
    User.findOne.mockResolvedValue({ id: "existing", email: "ana@email.com" });

    await expect(
      userService.createUser({ email: "ana@email.com", password: "12345678", name: "Ana" })
    ).rejects.toMatchObject({ statusCode: 409, message: "email already in use" });
  });

  it("creates and returns user when data is valid", async () => {
    User.findOne.mockResolvedValue(null);
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana" };
    User.create.mockResolvedValue(fakeUser);

    const result = await userService.createUser({ email: "ana@email.com", password: "12345678", name: "Ana" });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@email.com", name: "Ana", passwordHash: "hashed_password" })
    );
    expect(result).toEqual(fakeUser);
  });
});

describe("userService.getUserById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 404 when user is not found", async () => {
    User.findById.mockResolvedValue(null);

    await expect(userService.getUserById("nonexistent")).rejects.toMatchObject({
      statusCode: 404,
      message: "user not found",
    });
  });

  it("returns user when found", async () => {
    const fakeUser = { id: "abc123", email: "ana@email.com", name: "Ana" };
    User.findById.mockResolvedValue(fakeUser);

    const result = await userService.getUserById("abc123");
    expect(result).toEqual(fakeUser);
  });
});
