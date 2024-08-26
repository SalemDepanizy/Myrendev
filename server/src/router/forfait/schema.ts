import { z } from "zod";

export const createForfait = z.object({
  name: z.string(),
  heure: z.number(),
  selectMorePeople: z.boolean(),
  numberOfPeople: z.number(),
  monitorId: z.string().optional(), // Add this line
});

export const updateForfait = z.object({
  name: z.string().optional(),
  heure: z.number().optional(),
  selectMorePeople: z.boolean().optional(),
  numberOfPeople: z.number().optional(),
  monitorId: z.any().optional(), // Add this line
});
