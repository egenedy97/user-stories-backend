import { NextFunction, Response } from "express";
import ProjectController from "../controllers/project.controller";
import ProjectService from "../services/project.service";
import { Project } from "@prisma/client";
import { RequestWithUser } from "interfaces/auth.interface";

jest.mock("../services/project.service");

describe("ProjectController", () => {
  let projectController: ProjectController;
  let mockRequest: Partial<RequestWithUser>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    projectController = new ProjectController();
    mockRequest = {
      //@ts-ignore
      user: { id: 1 }, // Simulating a logged-in user
      params: { id: "1" },
      body: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      mockRequest.body = {
        name: "Test Project",
        description: "Test Description",
      };
      //@ts-ignore
      const createdProject: Project = {
        id: 1,
        name: "Test Project",
        description: "Test Description",
        createdById: 1,
      } as Project;

      (ProjectService.prototype.createProject as jest.Mock).mockResolvedValue(
        createdProject
      );

      await projectController.createProject(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        project: createdProject,
        message: "created",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      (ProjectService.prototype.createProject as jest.Mock).mockRejectedValue(
        error
      );

      await projectController.createProject(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getProjectById", () => {
    it("should get a project by ID", async () => {
      const projectId = 1;
      //@ts-ignore

      const project: Project = {
        id: projectId,
        name: "Test Project",
        description: "Test Description",
        createdById: 1,
      } as Project;

      (ProjectService.prototype.getProjectById as jest.Mock).mockResolvedValue(
        project
      );

      mockRequest.params.id = projectId.toString();

      await projectController.getProjectById(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        project,
        message: "Project fetched successfully",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      (ProjectService.prototype.getProjectById as jest.Mock).mockRejectedValue(
        error
      );

      await projectController.getProjectById(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllProjects", () => {
    it("should get all projects", async () => {
      const page = 1;
      const limit = 10;

      const projects: Project[] = [
        {
          id: 1,
          name: "Test Project 1",
          //@ts-ignore
          description: "Test Description 1",
          createdById: 1,
        },
        {
          id: 2,
          name: "Test Project 2",
          description: "Test Description 2",
          createdById: 1,
        },
      ] as Project[];

      const total = projects.length;

      (ProjectService.prototype.getProjects as jest.Mock).mockResolvedValue({
        projects,
        total,
      });

      mockRequest.query = { page: page.toString(), limit: limit.toString() };

      await projectController.getAllProjects(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        projects,
        total,
        message: "Project fetched successfully",
      });
    });

    it("should handle errors and call next", async () => {
      const error = new Error("Test Error");

      (ProjectService.prototype.getProjects as jest.Mock).mockRejectedValue(
        error
      );

      await projectController.getAllProjects(
        mockRequest as RequestWithUser,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
