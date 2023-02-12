import { Injectable } from '@nestjs/common';
import { MerkleTreeService } from '../merkletree/merkletree.service';
import { ISaleConfigInput, IWhiteList } from 'src/@types/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SaleConfigService {
  constructor(
    private readonly merkletreeService: MerkleTreeService,
    private readonly prisma: PrismaService,
  ) {}

  getSaleConfigProofByProjectId = async (
    projectId: number,
    saleIdentifier: string,
  ) => {
    const configs = await this.prisma.saleConfig.findMany({
      where: { projectId },
      orderBy: { startTime: 'asc' },
      include: {
        Project: { include: { owner: true } },
        whitelist: { select: { address: true, limit: true } },
      },
    });
    const config = configs.find((c) => c.saleIdentifier === saleIdentifier);
    if (!config) throw new Error('config not found with identifier');
    const configInput: ISaleConfigInput = {
      enabled: config.enabled,
      endTime: config.endTime,
      maxMintInSale: config.maxMintInSale,
      maxMintPerWallet: config.maxMintPerWallet,
      mintCharge: config.mintCharge,
      saleType: config.saleType as 'private' | 'public',
      startTime: config.startTime,
      uuid: config.saleIdentifier,
      whitelistAddresses: config.whitelist,
      tokenGatedAddress: config.tokenGatedAddress,
    };
    const configInputs: ISaleConfigInput[] = configs.map((config) => ({
      enabled: config.enabled,
      endTime: config.endTime,
      maxMintInSale: config.maxMintInSale,
      maxMintPerWallet: config.maxMintPerWallet,
      mintCharge: config.mintCharge,
      saleType: config.saleType as 'private' | 'public',
      startTime: config.startTime,
      uuid: config.saleIdentifier,
      whitelistAddresses: config.whitelist,
      tokenGatedAddress: config.tokenGatedAddress,
    }));
    return this.merkletreeService.getSaleConfigProof(configInputs, configInput);
  };

  getWhitelistProof = (
    saleType: string,
    whitelist: IWhiteList[],
    userLimit: IWhiteList,
  ) => {
    if (saleType === 'public') return [];
    if (whitelist.length === 0)
      throw new Error('Empty whitelist in private sale');
    if (userLimit.limit === 0) throw new Error('User not whitelisted');
    return this.merkletreeService.getWhitelistProof(whitelist, userLimit);
  };
}
