import { NextFunction, Response } from "express";
import { RequestWithUser } from "interfaces/auth.interface";
import { Task, TaskHistory } from "@prisma/client";
import TaskService from "../services/task.service";

class TaskController {
  private taskService = new TaskService();

  public createTask = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: number = req.user.id;
      const projectId: number = +req.params.id;
      const { title, description } = req.body;
      const createdTask: Task = await this.taskService.createTask({
        title,
        description,
        status: "ToDo",
        projectId: projectId,
        createdById: userId,
      });
      res.status(201).json({ task: createdTask, message: "created" });
    } catch (e) {
      next(e);
    }
  };
  public getTaskById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const taskId = +req.params.taskId;
      const task: Task = await this.taskService.getTaskById(taskId);
      res.status(201).json({ task, message: "task fetched successfully" });
    } catch (e) {
      next(e);
    }
  };

  public getAllTask = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const projectId = +req.params.id;

      const { tasks, total } = await this.taskService.getAllTasks(
        +page,
        +limit,
        +projectId
      );
      res
        .status(201)
        .json({ tasks, total, message: "Tasks fetched successfully" });
    } catch (e) {
      next(e);
    }
  };

  public updateTask = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const taskId = +req.params.taskId;
      const projectId = +req.params.id;
      const userId = +req.user.id;
      const {
        status,
        title,
        description,
        assignedToId,
      }: {
        status?:
          | "ToDo"
          | "InProgress"
          | "InQA"
          | "Done"
          | "Deployed"
          | "Blocked";
        title?: string;
        description?: string;
        assignedToId?: number;
      } = req.body;
      const updatedTask: Task = await this.taskService.updateTaskService(
        taskId,
        {
          status,
          title,
          description,
          assignedToId,
          projectId,
          userId,
        }
      );
      res
        .status(201)
        .json({ task: updatedTask, message: "Tasks fetched successfully" });
    } catch (e) {
      next(e);
    }
  };
}

export default TaskController;
