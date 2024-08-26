import { z } from "zod";

export const confirmSlotSchema = z.object({
  userId: z.string().min(1, {
    message: "userId is required",
  }),
  confirmedDate: z.string(),
  confirmedTime: z.string(),
  token: z.string(),
  relationKey: z.string(),
});
