import { z } from "zod";

export const createPAsminMail = z.object({

  email: z.string().email(),
  message: z.string(),
  objets: z.string(),

});
