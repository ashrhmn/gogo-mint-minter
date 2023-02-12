import { Module } from '@nestjs/common';
import { MerkleTreeService } from './merkletree.service';

@Module({
  providers: [MerkleTreeService],
  exports: [MerkleTreeService],
})
export class MerkleTreeModule {}
