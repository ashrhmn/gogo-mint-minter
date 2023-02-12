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

  @Get('current-sale/:uid')
  async getCurrentSale(@Param('uid') uid: string) {
    return this.projectService.getCurrentSale(uid);
  }

  @Get(':uid')
  async getProjectByUid(@Param('uid') uid: string) {
    return this.projectService.getProjectByUid(uid);
  }
}
