import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './modules/project/project.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheManagerModule } from './providers/cache/cache-manager.module';
import { MintModule } from './modules/mint/mint.module';
import { MerkleTreeModule } from './modules/merkletree/merkletree.module';
import { SaleConfigModule } from './modules/sale-config/sale-config.module';

@Module({
  imports: [
    ...(process.env.NODE_ENV === 'production'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'client'),
          }),
        ]
      : []),
    CacheModule.register({
      store: redisStore.create({
        host: process.env.REDIS_HOST || 'localhost',
        port: +(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD,
      }),
      isGlobal: true,
      ttl: 10,
    }),
    PrismaModule,
    ProjectModule,
    CacheManagerModule,
    MintModule,
    MerkleTreeModule,
    SaleConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
