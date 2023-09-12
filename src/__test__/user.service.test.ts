import UserService from "../services/user.service";
import { prisma } from "../database";

jest.mock("../database", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("getAllUsers", () => {
    it("should get all users", async () => {
      const page = 1;
      const limit = 10;

      const users = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];

      const count = users.length;

      (prisma?.user.findMany as jest.Mock)?.mockResolvedValue(users);
      (prisma?.user.count as jest.Mock)?.mockResolvedValue(count);

      const result = await userService.getAllUsers(page, limit);
      expect(result).toEqual({ users, total: count });
    });

    it("should handle errors and throw HttpException", async () => {
      const page = 1;
      const limit = 10;

      (prisma?.user.findMany as jest.Mock)?.mockRejectedValue(
        new Error("Test Error")
      );

      try {
        await userService.getAllUsers(page, limit);
      } catch (error) {
        expect(error.message).toBe("Unable to get Users");
        expect(error.status).toBe(500);
      }
    });
  });
});
