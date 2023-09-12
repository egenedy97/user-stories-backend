import { HttpException } from "../exceptions/HttpException";
import TaskService from "../services/task.service";
import ProjectService from "../services/project.service";
import TaskHistoryService from "../services/taskHistory.service";
import { prisma } from "../database";
import { Task } from "@prisma/client";

jest.mock("../database", () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user: {
      create: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    taskHistory: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("../services/project.service");
jest.mock("../services/taskHistory.service");

describe("TaskService", () => {
  let taskService: TaskService;
  let projectService: ProjectService;
  let taskHistoryService: TaskHistoryService;

  beforeEach(() => {
    taskService = new TaskService();
    projectService = new ProjectService();
    taskHistoryService = new TaskHistoryService();
  });

  describe("createTask", () => {
    it("should throw an error if project does not exist", async () => {
      const taskData = {
        title: "Sample Task",
        description: "Sample Description",
        status: "ToDo",
        createdById: 1,
        projectId: 1,
      };

      try {
        //@ts-ignore

        await taskService.createTask(taskData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(404);
        expect(error.message).toBe(
          `Project with id ${taskData.projectId} not found`
        );
      }
    });
  });

  describe("getAllTasks", () => {
    it("should get all tasks for a project", async () => {
      const page = 1;
      const limit = 10;
      const projectId = 1;

      const tasks: any = [
        {
          id: 1,
          title: "Task 1",
          description: "Description for Task 1",
          status: "ToDo",
        },
        {
          id: 2,
          title: "Task 2",
          description: "Description for Task 2",
          status: "InProgress",
        },
        {
          id: 3,
          title: "Task 3",
          description: "Description for Task 3",
          status: "Done",
        },
      ];

      const total = tasks.length;

      (prisma.task.findMany as jest.Mock).mockResolvedValue(tasks);
      (prisma.task.count as jest.Mock).mockResolvedValue(total);

      const result = await taskService.getAllTasks(page, limit, projectId);

      expect(result).toEqual({ tasks, total });
    });

    it("should throw an error if unable to get tasks", async () => {
      const page = 1;
      const limit = 10;
      const projectId = 1;

      (prisma.task.findMany as jest.Mock).mockRejectedValue(
        new Error("Test Error")
      );

      try {
        await taskService.getAllTasks(page, limit, projectId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(500);
        expect(error.message).toBe("Unable to get Projects");
      }
    });
  });
  describe("getTaskById", () => {
    it("should get a task by its ID", async () => {
      const taskId = 1;

      const task = {
        id: taskId,
        title: "Sample Task",
        description: "Sample Description",
        status: "ToDo",
        createdById: 1,
        projectId: 1,
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(task);

      const result = await taskService.getTaskById(taskId);

      expect(result).toEqual(task);
    });

    it("should throw an error if task is not found", async () => {
      const taskId = 1;

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      try {
        await taskService.getTaskById(taskId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(404);
        expect(error.message).toBe(`Task with id ${taskId} not found`);
      }
    });
  });

  it("should handle task not found error", async () => {
    const taskId = 1;
    const taskData = {
      status: "InProgress",
      title: "Updated Title",
      description: "Updated Description",
      projectId: 1,
      userId: 1,
      assignedToId: 2,
    };

    // Mocking Prisma functions
    prisma.task.findUnique = jest.fn().mockResolvedValue(null); // Simulating task not found

    try {
      //@ts-ignore
      await taskService.updateTaskService(taskId, taskData);
    } catch (error) {
      expect(error.constructor.name).toBe("HttpException");
      expect(error.message).toBe(`Failed to update task with id ${taskId}`);
    }
  });

  it("should handle invalid task status error", async () => {
    const taskId = 1;
    const taskData = {
      status: "Done", // Invalid status
      title: "Updated Title",
      description: "Updated Description",
      projectId: 1,
      userId: 1,
      assignedToId: 2,
    };

    // Define the initial task data
    const initialTask = {
      id: taskId,
      status: "ToDo",
      title: "Original Title",
      description: "Original Description",
      projectId: 1,
      userId: 1,
      assignedToId: 2,
    };
    try {
      //@ts-ignore
      await taskService.updateTaskService(taskId, taskData);
    } catch (error) {
      // Check if the error is of type HttpException
      expect(error.constructor.name).toBe("HttpException");
      expect(error.message).toBe(`Failed to update task with id ${taskId}`);
    }
  });
  it("should handle project not found error", async () => {
    const taskData = {
      title: "New Task Title",
      description: "New Task Description",
      projectId: 999,
      userId: 1,
      assignedToId: 2,
    };

    prisma.project.findUnique = jest.fn().mockResolvedValue(null);

    try {
      //@ts-ignore
      await taskService.createTask(taskData);
    } catch (error) {
      expect(error.constructor.name).toBe("HttpException");

      expect(error.message).toBe(
        `Project with id ${taskData.projectId} not found`
      );
    }
  });
  it("should handle general update error", async () => {
    const taskId = 1;
    //@ts-ignore
    const taskData = {
      status: "InProgress",
      title: "Updated Title",
      description: "Updated Description",
      projectId: 1,
      userId: 1,
      assignedToId: 2,
    };

    prisma.$transaction = jest.fn().mockRejectedValue(new Error("Some error")); // Simulating a general update error

    try {
      //@ts-ignore

      await taskService.updateTaskService(taskId, taskData);
    } catch (error) {
      expect(error.constructor.name).toBe("HttpException");
      expect(error.message).toBe(`Failed to update task with id ${taskId}`);
    }
  });

  it("should handle missing project ID error", async () => {
    const taskData = {
      title: "New Task Title",
      description: "New Task Description",
      userId: 1,
      assignedToId: 2,
    };

    try {
      //@ts-ignore
      await taskService.createTask(taskData);
    } catch (error) {
      expect(error.constructor.name).toBe("HttpException");
      expect(error.message).toBe("Project with id undefined not found");
    }
  });
  it("should handle missing ID error", async () => {
    //@ts-ignore
    const taskData = {
      status: "InProgress",
      title: "Updated Title",
      description: "Updated Description",
      projectId: 1,
      userId: 1,
      assignedToId: 2,
    };

    try {
      //@ts-ignore

      await taskService.updateTaskService(undefined, taskData);
    } catch (error) {
      expect(error.constructor.name).toBe("HttpException");

      expect(error.message).toBe("Failed to update task with id undefined");
    }
  });
});
