import { z } from "zod";

export const createCorpSetting = z.object({
        corpData: z.number().optional(),
        dayMoment: z.string().optional(),
        maxSlots: z.number().optional(),
        corpId: z.string().optional(),
        confirmationChoice: z.boolean().optional(),
        numberDays: z.number().optional(),
        numberWeeks: z.number().optional(),

});