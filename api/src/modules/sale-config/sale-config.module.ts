import { Module } from '@nestjs/common';
import { SaleConfigService } from './sale-config.service';
import { MerkleTreeModule } from '../merkletree/merkletree.module';

@Module({
  providers: [SaleConfigService],
  exports: [SaleConfigService],
  imports: [MerkleTreeModule],
})
export class SaleConfigModule {}
