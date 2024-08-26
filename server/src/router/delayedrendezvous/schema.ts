import { z } from "zod";

export const createDalayedRendezvous = z.object({
  title: z.string(),
  //   dateTime: z.string(),
  description: z.string().optional(),
  clientId: z.string(),
  forfaitId: z.string(),
  monitorId: z.string(),
  relationKey: z.string(),
  images: z.array(
    z.object({
      filename: z.string(),
      rendezVousId: z.string(),
    })
  ),
});
