import TaskHistoryService from "../services/taskHistory.service";
import { prisma } from "../database";
import { HttpException } from "../exceptions/HttpException";

jest.mock("../database", () => ({
  prisma: {
    taskHistory: {
      create: jest.fn(),
    },
  },
}));

describe("TaskHistoryService", () => {
  let taskHistoryService: TaskHistoryService;

  beforeEach(() => {
    taskHistoryService = new TaskHistoryService();
  });

  describe("createTaskHistory", () => {
    it("should create a new task history", async () => {
      const createdTask = {
        id: 1,
        status: "InProgress",
        changedById: 1,
      };

      // Mocking Prisma's create method
      (prisma.taskHistory.create as jest.Mock).mockResolvedValue(createdTask);
      //@ts-ignore
      const result = await taskHistoryService.createTaskHistory(createdTask);

      expect(result).toEqual(createdTask);
    });

    it("should throw an error if unable to create task history", async () => {
      const createdTask = {
        id: 1,
        status: "InProgress",
        changedById: 1,
      };

      // Mocking Prisma's create method to simulate an error
      (prisma.taskHistory.create as jest.Mock).mockRejectedValue(
        new Error("Test Error")
      );

      try {
        //@ts-ignore

        await taskHistoryService.createTaskHistory(createdTask);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(500);
        expect(error.message).toBe("Unable to create task history");
      }
    });
  });
});
