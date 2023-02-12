import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/providers/cache/cache-manager.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  getAllProjects() {
    return this.prisma.project.findMany();
  }

  async getProjectByUid(uid: string) {
    return await this.cacheService.getIfCached(`project:uid:${uid}`, 300, () =>
      this.prisma.project.findUniqueOrThrow({
        where: { uid },
        select: {
          address: true,
          chainId: true,
          id: true,
          name: true,
          bannerUrl: true,
          description: true,
          imageUrl: true,
          collectionType: true,
          _count: { select: { nfts: true } },
          uid: true,
        },
      }),
    );
  }

  async getCurrentSale(uid: string) {
    const now = +(Date.now() / 1000).toFixed(0);
    return await this.cacheService.getIfCached(
      `current-sale:${uid}:${now}`,
      60,
      () =>
        this.prisma.saleConfig
          .findFirstOrThrow({
            where: {
              startTime: { lte: now },
              OR: [{ endTime: { equals: 0 } }, { endTime: { gte: now } }],
              enabled: true,
              Project: { uid },
            },
            orderBy: { startTime: 'asc' },
            select: { saleIdentifier: true, mintCharge: true, saleType: true },
          })
          .catch(() => null),
    );
  }

  async getCurrentSaleById(id: number) {
    const now = +(Date.now() / 1000).toFixed(0);
    return await this.cacheService.getIfCached(
      `current-sale:${id}:${now}`,
      60,
      () =>
        this.prisma.saleConfig
          .findFirstOrThrow({
            where: {
              startTime: { lte: now },
              OR: [{ endTime: { equals: 0 } }, { endTime: { gte: now } }],
              enabled: true,
              projectId: id,
            },
            orderBy: { startTime: 'asc' },
            include: { whitelist: true },
          })
          .catch(() => null),
    );
  }
}
