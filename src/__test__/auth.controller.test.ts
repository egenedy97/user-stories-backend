import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import AuthController from "../controllers/auth.controller";
import { User } from "@prisma/client";

jest.mock("../services/auth.service"); // Mock the AuthService

describe("AuthController", () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authController = new AuthController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("signUp", () => {
    it("should sign up a user and return 201 status", async () => {
      const mockUserData: {
        email: string;
        name: string;
        username: string;
        password: string;
      } = {
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        password: "password123",
      };

      const mockSignUpUserData: User = {
        id: 1,
        email: mockUserData.email,
        name: mockUserData.name,
        username: mockUserData.username,
        password: "hashedpassword",
      };

      // Mocking the signup function of the AuthService
      (AuthService.prototype.signup as jest.Mock).mockResolvedValue(
        mockSignUpUserData
      );

      (mockRequest as Request).body = mockUserData;

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockSignUpUserData,
        message: "signup",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      // Mocking the signup function of the AuthService to throw an error
      (AuthService.prototype.signup as jest.Mock).mockRejectedValue(error);

      (mockRequest as Request).body = {};

      await authController.signUp(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("logIn", () => {
    it("should log in a user and return 200 status", async () => {
      const mockUserData: {
        email: string;
        password: string;
      } = {
        email: "test@example.com",
        password: "password123",
      };

      const mockToken = "mockToken";
      const mockFindUser: User = {
        id: 1,
        email: mockUserData.email,
        name: "Test User",
        username: "testuser",
        password: "hashedpassword",
      };

      // Mocking the login function of the AuthService
      (AuthService.prototype.login as jest.Mock).mockResolvedValue({
        token: mockToken,
        findUser: mockFindUser,
      });

      (mockRequest as Request).body = mockUserData;

      await authController.logIn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        data: mockFindUser,
        token: mockToken,
        message: "login",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      // Mocking the login function of the AuthService to throw an error
      (AuthService.prototype.login as jest.Mock).mockRejectedValue(error);

      (mockRequest as Request).body = {};

      await authController.logIn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
