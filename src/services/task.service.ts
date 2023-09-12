import { HttpException } from "../exceptions/HttpException";
import { prisma } from "../database";
import { Task } from "@prisma/client";
import ProjectService from "./project.service";
import TaskHistoryService from "./taskHistory.service";

class TaskService {
  public task = prisma.task;
  private ProjectService = new ProjectService();
  private taskHistoryService = new TaskHistoryService();

  private stateTransitions = {
    ToDo: ["InProgress"],
    InProgress: ["Blocked", "InQA"],
    Blocked: ["ToDo"],
    InQA: ["ToDo", "Done"],
    Done: ["Deployed"],
  };

  private async validateProjectExistence(projectId: number): Promise<void> {
    const project = await this.ProjectService.getProjectById(projectId);
    if (!project) {
      throw new HttpException(404, `Project with id not found`);
    }
  }

  public async createTask(taskData: {
    title: string;
    description: string;
    status: "ToDo";
    createdById: number;
    projectId: number;
  }): Promise<Task> {
    const project = await this.ProjectService.getProjectById(
      taskData.projectId
    );
    if (!project) {
      throw new HttpException(
        404,
        `Project with id ${taskData.projectId} not found`
      );
    }
    const createdTask: Task = await this.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        createdById: taskData.createdById,
        projectId: taskData.projectId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedto: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    await this.taskHistoryService.createTaskHistory({
      id: +createdTask.id,
      status: createdTask.status,
      changedById: createdTask.createdById,
    });
    return createdTask;
  }

  public async getAllTasks(
    page: number,
    limit: number,
    projectId: number
  ): Promise<{ tasks: Task[]; total: number }> {
    try {
      const skip = page ? (page - 1) * limit : 0;
      const tasks = await this.task.findMany({
        skip,
        take: limit,
        where: {
          projectId: {
            equals: projectId,
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedto: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      const total = await this.task.count();
      return { tasks, total };
    } catch (e) {
      throw new HttpException(500, "Unable to get Projects");
    }
  }

  public async getTaskById(id: number): Promise<Task> {
    try {
      const task = await this.task.findUnique({
        where: {
          id,
        },
        include: {
          history: {
            select: {
              id: true,
              previousStatus: true,
              currentStatus: true,
              changeDateTime: true,
              changedBy: {
                select: {
                  username: true,
                },
              },
            },
          },
          assignedto: {
            select: {
              username: true,
            },
          },
        },
      });
      if (!task) {
        throw new HttpException(400, `not found task with id ${id}`);
      }
      return task;
    } catch (e) {
      throw new HttpException(404, `Task with id ${id} not found`);
    }
  }
  public async updateTaskService(
    id: number,
    taskData: {
      status?: "ToDo" | "InProgress" | "InQA" | "Done" | "Deployed" | "Blocked";
      title?: string;
      description?: string;
      projectId: number;
      userId: number;
      assignedToId?: number;
    }
  ): Promise<Task> {
    try {
      await this.validateTaskData(taskData);
      await this.validateProjectExistence(taskData.projectId);

      const updatedTask = await prisma.$transaction(
        async (trx) => {
          const task = await trx.task.findUnique({
            where: { id },
            include: {
              createdBy: true,
              updatedBy: true,
              assignedto: true,
            },
          });

          if (!task) {
            throw new HttpException(404, `Task with id ${id} not found`);
          }

          if (taskData.status) {
            const validateTaskStatus = this.validateStateFunction(
              task.status,
              taskData.status
            );

            if (!validateTaskStatus) {
              throw new HttpException(
                403,
                `Invalid nextStatus for task with id ${id}`
              );
            }
          }

          const updatedTask = await trx.task.update({
            where: { id: task.id },
            data: {
              status: taskData.status ?? undefined,
              updatedById: taskData.userId,
              title: taskData.title ?? undefined,
              description: taskData.description ?? undefined,
              assignedToId: taskData.assignedToId ?? undefined,
            },
          });

          if (taskData.status && task.status !== taskData.status) {
            await trx.taskHistory.create({
              data: {
                taskId: +updatedTask.id,
                currentStatus: taskData.status,
                changedById: taskData.userId,
                previousStatus: task.status,
              },
            });
          }

          return updatedTask;
        },
        { maxWait: 9000, timeout: 10000 }
      );

      return updatedTask;
    } catch (e) {
      throw new HttpException(500, `Failed to update task with id ${id}`);
    }
  }

  private validateTaskData(taskData) {
    if (!taskData) {
      throw new HttpException(400, "taskData is not provided");
    }

    const requiredFields = ["projectId", "userId"];

    for (const field of requiredFields) {
      if (!taskData[field]) {
        throw new HttpException(400, `${field} is not provided in taskData`);
      }
    }
  }

  private validateStateFunction = (prevStatus, currentStatus): boolean => {
    if (this.stateTransitions.hasOwnProperty(prevStatus)) {
      return this.stateTransitions[prevStatus].includes(currentStatus);
    } else if (prevStatus == null && currentStatus == "ToDo") {
      return true;
    }
    return false;
  };
}

export default TaskService;
