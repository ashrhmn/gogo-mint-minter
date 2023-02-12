import { Body, Controller, Post } from '@nestjs/common';
import { MintService } from './mint.service';
import { z } from 'zod';
import { isAddress } from 'ethers/lib/utils';

@Controller('mints')
export class MintController {
  /**
   *
   */
  constructor(private readonly mintService: MintService) {}

  @Post('prepare')
  prepareMint(@Body() body: unknown) {
    const { address, mintCount, projectId } = z
      .object({
        projectId: z.number(),
        address: z.string().refine((v) => isAddress(v), 'Invalid address'),
        mintCount: z.number().min(1),
      })
      .parse(body);

    return this.mintService.prepareMint(projectId, address, mintCount);
  }
}
