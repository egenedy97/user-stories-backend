import { Router } from "express";
import ProjectController from "../controllers/project.controller";
import { Routes } from "../interfaces/route.interface";
import authMiddleware from "../middlewares/auth.middleware";

class ProjectRoute implements Routes {
  public path = "/projects";
  public router = Router();
  public projectController = new ProjectController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      this.projectController.createProject
    );
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.projectController.getAllProjects
    );
    this.router.get(
      `${this.path}/:id`,
      authMiddleware,
      this.projectController.getProjectById
    );
  }
}

export default ProjectRoute;
