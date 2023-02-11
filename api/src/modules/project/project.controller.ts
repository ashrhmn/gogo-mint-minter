import { Controller, Get, Param } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getAllProjects() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return this.projectService.getAllProjects();
  }

  @Get(':uid')
  async getProjectByUid(@Param("uid") uid: string) {
    return this.projectService.getProjectByUid(uid);
  }
}
