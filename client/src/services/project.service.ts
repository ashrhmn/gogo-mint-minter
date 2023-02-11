import { isAddress } from "ethers/lib/utils";
import { z } from "zod";
import { service } from "./api.service";

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
        _count: z.object({
          nfts: z.number(),
        }),
      }),
    }
  );
