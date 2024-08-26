import { z } from "zod";

export const createPMail = z.object({
  email: z.string().email(),
  manualRecipients: z.string().email().optional(),
  manualRecipient1: z.string().email().optional(),
  manualRecipient2: z.string().email().optional(),
  manualRecipient3: z.string().email().optional(),
  messages: z.string(),
  objets: z.string(),
});
