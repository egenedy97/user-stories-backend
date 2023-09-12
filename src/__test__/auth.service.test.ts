import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthService from "../services/auth.service";
import { HttpException } from "../exceptions/HttpException";
import { prisma } from "../database";
import { User } from "@prisma/client";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../database", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));
describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe("signup", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        password: "password123",
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

      // Mocking Prisma's create method
      (prisma.user.create as jest.Mock).mockResolvedValue(userData as User);

      const result = await authService.signup(userData);

      expect(result).toEqual(userData as User);
    });

    it("should throw an error if user or username already exists", async () => {
      const userData = {
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        password: "password123",
      };

      // Mocking Prisma's findFirst method to simulate user already exists
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({} as User);

      try {
        await authService.signup(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(409);
      }
    });
  });

  describe("login", () => {
    it("should log in a user and return a token", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const findUser = {
        id: 1,
        email: userData.email,
        name: "Test User",
        username: "testuser",
        password: "hashedPassword",
      } as User;

      // Mocking Prisma's findFirst method
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(findUser);

      // Mocking bcrypt.compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mocking jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      const result = await authService.login(userData);

      expect(result).toEqual({ token: "mockToken", findUser });
    });

    it("should throw an error if user is not found", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      // Mocking Prisma's findFirst method to simulate user not found
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      try {
        await authService.login(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(409);
      }
    });

    it("should throw an error if password is not matching", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const findUser = {
        id: 1,
        email: userData.email,
        name: "Test User",
        username: "testuser",
        password: "hashedPassword",
      } as User;

      // Mocking Prisma's findFirst method
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(findUser);

      // Mocking bcrypt.compare to simulate password not matching
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await authService.login(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(409);
      }
    });
  });

  describe("createToken", () => {
    it("should create a token", () => {
      const user = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        password: "hashedPassword",
      } as User;

      // Mocking jwt.sign
      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      const result = authService.createToken(user);

      expect(result).toEqual({
        expiresIn: 14400000, // 4 hours in milliseconds
        token: "mockToken",
      });
    });
  });
});
