import { HttpException } from "../exceptions/HttpException";
import { prisma } from "../database";
import { Project } from "@prisma/client";

class ProjectService {
  public project = prisma.project;

  public async createProject(
    userId: number,
    projectData: {
      name: string;
    }
  ): Promise<Project> {
    const findProject: Project = await this.project.findUnique({
      where: {
        name: projectData.name,
      },
    });
    if (findProject) {
      throw new HttpException(409, `Project name is already exist`);
    }

    const createdProject: Project = await this.project.create({
      data: {
        name: projectData.name,
        userId,
      },
    });

    return createdProject;
  }
  public async getProjectById(projectId: number): Promise<Project> {
    const project = await this.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new HttpException(404, `Project with id ${projectId} not found`);
    }

    return project;
  }

  public async getProjects(
    page: number,
    limit: number
  ): Promise<{ projects: Project[]; total: number }> {
    try {
      const skip = page ? (page - 1) * limit : 0;
      const projects = await this.project.findMany({
        skip,
        take: limit,
      });
      const total = await this.project.count();
      return { projects, total };
    } catch (e) {
      console.log(e);
      throw new HttpException(500, "Unable to get Projects");
    }
  }
}

export default ProjectService;
