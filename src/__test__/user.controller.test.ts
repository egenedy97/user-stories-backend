import { NextFunction, Request, Response } from "express";
import UserController from "../controllers/user.controller";
import UserService from "../services/user.service";

jest.mock("../services/user.service");

describe("UserController", () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    userController = new UserController();
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("getAllUsers", () => {
    it("should get all users", async () => {
      const page = 1;
      const limit = 10;

      const users = [
        {
          id: 1,
          name: "User 1",
          email: "user1@example.com",
        },
        {
          id: 2,
          name: "User 2",
          email: "user2@example.com",
        },
      ];

      const total = users.length;

      (UserService.prototype.getAllUsers as jest.Mock).mockResolvedValue({
        users,
        total,
      });

      mockRequest.query = { page: page.toString(), limit: limit.toString() };

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        users,
        total,
        message: "Tasks fetched successfully",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      (UserService.prototype.getAllUsers as jest.Mock).mockRejectedValue(error);

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
