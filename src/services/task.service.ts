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
      throw new HttpException(404, `Project with id ${projectId} not found`);
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

  public updateTaskService = async (
    id: number,
    data: {
      status?: "ToDo" | "InProgress" | "InQA" | "Done" | "Deployed" | "Blocked";
      title?: string;
      description?: string;
      projectId: number;
      userId: number;
      assignedToId?: number;
    }
  ): Promise<Task> => {
    try {
      await this.validateProjectExistence(data.projectId);
      const task = await this.getTaskById(id);
      if (data.status) {
        const validateTaskStatus = await this.validateStateFunction(
          task.status,
          data.status
        );
        if (!validateTaskStatus) {
          throw new HttpException(
            403,
            `invalid nextStatus according to stateTransitions with id ${id} for task`
          );
        }
      }

      const updatedTask = await this.task.update({
        where: {
          id: task.id,
        },
        data: {
          status: data.status ? data?.status : undefined,
          updatedById: data.userId,
          title: data.title ? data?.title : undefined,
          description: data.description ? data?.description : undefined,
          assignedToId: data.assignedToId ? data?.assignedToId : undefined,
        },
      });
      if (data.status) {
        await this.taskHistoryService.createTaskHistory({
          id: +updatedTask.id,
          status: updatedTask.status,
          changedById: data?.userId,
          previousStatus: task.status,
        });
      }

      return updatedTask;
    } catch (e) {
      throw new HttpException(400, e);
    }
  };

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
