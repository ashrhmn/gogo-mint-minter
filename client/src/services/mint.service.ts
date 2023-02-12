import { z } from "zod";
import { service } from "./api.service";
import { isAddress } from "ethers/lib/utils";

const prepareMintBodySchema = z.object({
  projectId: z.number(),
  address: z.string().refine((v) => isAddress(v), "Invalid address"),
  mintCount: z.number().min(1),
});

export const prepareMint = async (
  data: z.infer<typeof prepareMintBodySchema>
) =>
  service(
    { method: "post", url: "/mints/prepare", data },
    {
      bodySchema: prepareMintBodySchema,
      responseSchema: z.object({
        config: z.object({
          saleIdentifier: z.string(),
          enabled: z.boolean(),
          startTime: z.number(),
          endTime: z.number(),
          mintCharge: z.string(),
          whitelistRoot: z.string(),
          maxMintPerWallet: z.number(),
          maxMintInSale: z.number(),
          tokenGatedAddress: z.string(),
        }),
        message: z.string(),
        signature: z.string(),
        whitelistProof: z.array(z.string()),
        mintChargeInWei: z.string(),
        whitelistMintLimit: z.number(),
        saleConfigProof: z.array(z.string()),
      }),
    }
  );
