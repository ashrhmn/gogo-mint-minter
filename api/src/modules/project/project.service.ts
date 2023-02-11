import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  getAllProjects() {
    return this.prisma.project.findMany();
  }

  async getProjectByUid(uid: string) {
    
    return await this.prisma.project.findUniqueOrThrow({
      where: { uid },
      select: {
        address: true,
        chainId: true,
        id: true,
        name: true,
        bannerUrl: true,
        description: true,
        imageUrl: true,
        _count: { select: { nfts: true } },
        uid: true,
      },
    });
  }
}
