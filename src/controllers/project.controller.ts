import { NextFunction, Response } from "express";
import ProjectService from "../services/project.service";
import { Project } from "@prisma/client";
import { RequestWithUser } from "interfaces/auth.interface";

class ProjectController {
  private projectService = new ProjectService();

  public createProject = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId: number = req.user.id;
      const projectData = req.body;

      const createdProject: Project = await this.projectService.createProject(
        userId,
        projectData
      );

      res.status(201).json({ project: createdProject, message: "created" });
    } catch (error) {
      next(error);
    }
  };

  public getProjectById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectId: number = parseInt(req.params.id);
      const project: Project = await this.projectService.getProjectById(
        projectId
      );

      res.json({ project, message: "Project fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAllProjects = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const { projects, total } = await this.projectService.getProjects(
        +page,
        +limit
      );
      res.json({ projects, total, message: "Project fetched successfully" });
    } catch (e) {
      next(e);
    }
  };
}

export default ProjectController;
