import { Router } from "express";
import TaskController from "../controllers/task.controller";
import { Routes } from "../interfaces/route.interface";
import authMiddleware from "../middlewares/auth.middleware";

class TaskRoute implements Routes {
  public path = "/projects/:id/tasks";
  public router = Router();
  public taskController = new TaskController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      this.taskController.createTask
    );
    this.router.get(
      `${this.path}/:taskId`,
      authMiddleware,
      this.taskController.getTaskById
    );
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.taskController.getAllTask
    );
    this.router.put(
      `${this.path}/:taskId`,
      authMiddleware,
      this.taskController.updateTask
    );
  }
}

export default TaskRoute;
