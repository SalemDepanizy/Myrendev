import { z } from "zod";

export const codeConfirmationSchema = z.object({
  enterpriseId: z.string(),
  clientEmail: z.string(),
  secretCode: z.string(),

  enterpriseName: z.string(),
});

export const codeConfirmationMailSchema = z.object({
  clientEmail: z.string(),
  enterpriseName: z.string(),
})