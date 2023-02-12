import { BadRequestException, Injectable } from '@nestjs/common';
import { arrayify, parseEther, solidityKeccak256 } from 'ethers/lib/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/providers/cache/cache-manager.service';
import { multiply } from 'src/utils/Number.utils';
import { getSolVersionConfig } from 'src/utils/Sol.utils';
import { SaleConfigService } from '../sale-config/sale-config.service';
import { ProjectService } from '../project/project.service';
import { Wallet } from 'ethers';
import { PLATFORM_SIGNER_PRIVATE_KEY } from 'src/configs/app.config';
import { v4 } from 'uuid';

@Injectable()
export class MintService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
    private readonly saleConfigService: SaleConfigService,
    private readonly projectService: ProjectService,
  ) {}

  private async _getMintSignature(account: string, mintCount: number) {
    const privateKey = PLATFORM_SIGNER_PRIVATE_KEY;
    const wallet = new Wallet(privateKey);
    const message = v4();

    const mintSignature = await wallet.signMessage(
      arrayify(
        solidityKeccak256(
          ['address', 'string', 'uint256'],
          [account, message, mintCount],
        ),
      ),
    );
    return { message, signature: mintSignature };
  }

  async prepareMint(projectId: number, address: string, mintCount: number) {
    try {
      const currentSale = await this.projectService
        .getCurrentSaleById(projectId)
        .catch(() => null);
      if (!currentSale) throw new Error('No sale running');

      const [userLimit, { message, signature }, saleConfigProof] =
        await Promise.all([
          this.cacheService.getIfCached(
            `user-limit-${projectId}-${currentSale.saleIdentifier}-${address}`,
            120,
            () =>
              this.prisma.whitelistLimits
                .findFirstOrThrow({
                  where: {
                    address: { equals: address, mode: 'insensitive' },
                    saleConfigId: currentSale.id,
                  },
                  select: { address: true, limit: true },
                })
                .catch(() => ({ address: address, limit: 0 })),
          ),
          this._getMintSignature(address, mintCount),
          this.cacheService.getIfCached(
            `config-proof-${projectId}-${currentSale.saleIdentifier}`,
            30,
            () =>
              this.saleConfigService.getSaleConfigProofByProjectId(
                projectId,
                currentSale.saleIdentifier,
              ),
          ),
        ]);

      const whitelistProof = await this.cacheService.getIfCached(
        `whitelist-proof-${projectId}-${currentSale.saleIdentifier}-${address}`,
        30,
        async () =>
          this.saleConfigService.getWhitelistProof(
            currentSale.saleType,
            currentSale.whitelist,
            userLimit,
          ),
      );

      const config = getSolVersionConfig({
        enabled: currentSale.enabled,
        endTime: currentSale.endTime,
        maxMintInSale: currentSale.maxMintInSale,
        maxMintPerWallet: currentSale.maxMintPerWallet,
        mintCharge: currentSale.mintCharge,
        saleType: currentSale.saleType as 'public' | 'private',
        startTime: currentSale.startTime,
        uuid: currentSale.saleIdentifier,
        whitelistAddresses: currentSale.whitelist,
        tokenGatedAddress: currentSale.tokenGatedAddress,
      });

      const mintChargeInWei = parseEther(
        (+multiply(currentSale.mintCharge, mintCount).toFixed(18)).toString(),
      ).toString();

      return {
        config,
        message,
        signature,
        whitelistProof,
        mintChargeInWei,
        whitelistMintLimit: userLimit.limit,
        saleConfigProof,
      };
    } catch (error) {
      console.log('Error preparing mint : ', error);
      throw new BadRequestException(error?.message);
    }
  }
}
