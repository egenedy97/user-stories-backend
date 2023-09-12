import { HttpException } from "../exceptions/HttpException";
import { prisma } from "../database";
import { TaskHistory } from "@prisma/client";

class TaskHistoryService {
  public taskHistory = prisma.taskHistory;

  public async createTaskHistory(createdTask: {
    id: number;
    status: "ToDo" | "InProgress" | "InQA" | "Done" | "Deployed" | "Blocked";
    previousStatus?:
      | "ToDo"
      | "InProgress"
      | "InQA"
      | "Done"
      | "Deployed"
      | "Blocked";
    changedById: number;
  }): Promise<TaskHistory> {
    try {
      const createdTaskHistory: TaskHistory = await this.taskHistory.create({
        data: {
          taskId: +createdTask.id,
          currentStatus: createdTask.status,
          changedById: createdTask.changedById,
          previousStatus: createdTask.previousStatus,
        },
      });
      return createdTaskHistory;
    } catch (error) {
      throw new HttpException(500, "Unable to create task history");
    }
  }
}

export default TaskHistoryService;
