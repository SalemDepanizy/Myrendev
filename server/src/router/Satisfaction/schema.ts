import { z } from "zod";

export const createSatisfaction = z.object({
  title: z.string(),
  // rendezvous_id: z.string().optional(),
  questions: z.array(
    z.object({
      text: z.string(),
      rating: z.number().optional(), // Assurez-vous que cela est optionnel si nécessaire
    })
  ),
  comment: z.string().optional(),
  redirect_url: z.string().optional(),
  redirect_grade: z.number().optional(),
  userId: z.string().optional(), // Add this line
});

export const updateSatisfaction = z.object({
  title: z.string().optional(),
  questions: z
    .array(
      z.object({
        text: z.string().optional(),
        rating: z.number().optional(), // Assurez-vous que cela est optionnel si nécessaire
      })
    )
    .optional(),
  comment: z.string().optional(),
  redirect_url: z.string().optional(),
  redirect_grade: z.number().optional(),
  userId: z.string().optional(), // Add this line
});
