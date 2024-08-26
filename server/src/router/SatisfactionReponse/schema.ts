import { z } from "zod";

export const createSatisfactionResponse = z.object({
  satisfactionId: z.string(),
  comments: z.string(),
  notegeneral: z.number(),
  questionNotes: z.array(z.object({
    questionId: z.string(),
    note: z.number(),
  })),
  token: z.string(),
});
