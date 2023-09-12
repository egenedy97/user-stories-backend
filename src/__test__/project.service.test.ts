import ProjectService from "../services/project.service";
import { prisma } from "../database";
import { HttpException } from "../exceptions/HttpException";

jest.mock("../database", () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("ProjectService", () => {
  let projectService: ProjectService;

  beforeEach(() => {
    projectService = new ProjectService();
  });

  describe("createProject", () => {
    it("should create a new project", async () => {
      const userId = 1;
      const projectData = { name: "New Project" };

      // Mocking Prisma's findUnique method to simulate project does not exist
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      // Mocking Prisma's create method
      (prisma.project.create as jest.Mock).mockResolvedValue(projectData);

      const result = await projectService.createProject(userId, projectData);

      expect(result).toEqual(projectData);
    });

    it("should throw an error if project name already exists", async () => {
      const userId = 1;
      const projectData = { name: "Existing Project" };

      // Mocking Prisma's findUnique method to simulate project already exists
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Existing Project",
        userId: 1,
      });

      try {
        await projectService.createProject(userId, projectData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(409);
        expect(error.message).toBe("Project name is already exist");
      }
    });
  });

  describe("getProjectById", () => {
    it("should get a project by ID", async () => {
      const projectId = 1;
      const projectData = { id: projectId, name: "Project 1", userId: 1 };

      // Mocking Prisma's findUnique method to return project data
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(projectData);

      const result = await projectService.getProjectById(projectId);

      expect(result).toEqual(projectData);
    });

    it("should throw an error if project is not found", async () => {
      const projectId = 2;

      // Mocking Prisma's findUnique method to simulate project not found
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      try {
        await projectService.getProjectById(projectId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(404);
        expect(error.message).toBe(`Project with id ${projectId} not found`);
      }
    });
  });

  describe("getProjects", () => {
    it("should get a list of projects with pagination", async () => {
      const page = 1;
      const limit = 10;
      const projects = [
        { id: 1, name: "Project 1", userId: 1 },
        { id: 2, name: "Project 2", userId: 1 },
      ];

      // Mocking Prisma's findMany method to return projects data
      (prisma.project.findMany as jest.Mock).mockResolvedValue(projects);

      // Mocking Prisma's count method to return total count of projects
      (prisma.project.count as jest.Mock).mockResolvedValue(projects.length);

      const result = await projectService.getProjects(page, limit);

      expect(result).toEqual({ projects, total: projects.length });
    });

    it("should throw an error if unable to get projects", async () => {
      const page = 1;
      const limit = 10;

      // Mocking Prisma's findMany method to simulate an error
      (prisma.project.findMany as jest.Mock).mockRejectedValue(
        new Error("Test Error")
      );

      try {
        await projectService.getProjects(page, limit);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(500);
        expect(error.message).toBe("Unable to get Projects");
      }
    });
  });
});
