import { NextFunction, Response } from "express";
import { RequestWithUser } from "interfaces/auth.interface";
import TaskService from "../services/task.service";
import TaskController from "../controllers/task.controller";
import { Task } from "@prisma/client";

jest.mock("../services/task.service");

describe("TaskController", () => {
  let taskController: TaskController;
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    taskController = new TaskController();
    mockRequest = {
      //@ts-ignore
      user: { id: 1 }, // Simulating a logged-in user
      params: { id: "1", taskId: "1" },
      body: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      mockRequest.body = {
        title: "Test Task",
        description: "Test Description",
      };

      const createdTask: Task = {
        id: 1,
        title: "Test Task",
        description: "Test Description",
        status: "ToDo",
        createdById: 1,
        projectId: 1,
      } as Task;

      (TaskService.prototype.createTask as jest.Mock).mockResolvedValue(
        createdTask
      );

      await taskController.createTask(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        task: createdTask,
        message: "created",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      (TaskService.prototype.createTask as jest.Mock).mockRejectedValue(error);

      await taskController.createTask(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // Add similar tests for getTaskById, getAllTask, and updateTask methods
});
