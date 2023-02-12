import { Module } from '@nestjs/common';
import { MintService } from './mint.service';
import { MintController } from './mint.controller';
import { SaleConfigModule } from '../sale-config/sale-config.module';
import { ProjectModule } from '../project/project.module';

@Module({
  providers: [MintService],
  exports: [MintService],
  controllers: [MintController],
  imports: [SaleConfigModule, ProjectModule],
})
export class MintModule {}
