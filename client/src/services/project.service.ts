import { isAddress } from "ethers/lib/utils";
import { z } from "zod";
import { service } from "./api.service";
import { ZodUtils } from "../utils/zod.utils";

export const getProjectByUid = async (uid: string) =>
  service(
    { url: `/projects/${uid}` },
    {
      responseSchema: z.object({
        address: z.string().refine((v) => isAddress(v), "Invalid address"),
        uid: z.string(),
        chainId: z.number(),
        id: z.number(),
        name: z.string().nullable(),
        description: z.string().nullable(),
        bannerUrl: z.string().nullable(),
        imageUrl: z.string().nullable(),
        collectionType: z.string(),
        _count: z.object({
          nfts: z.number(),
        }),
      }),
    }
  );

export const getCurrentSaleByUid = async (uid: string) => {
  const res = await service({ url: `projects/current-sale/${uid}` }).catch(
    () => null
  );
  if (
    ZodUtils.followsSchema(
      res,
      z.object({
        saleIdentifier: z.string(),
        saleType: z.string(),
        mintCharge: z.number(),
      })
    )
  )
    return res;
  return null;
};
