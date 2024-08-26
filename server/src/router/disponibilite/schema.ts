import { z } from "zod";
const MyTriStateEnum = z.enum(["TRUE", "FALSE", "PENDING"]);

export const createDisponibilite = z.object({
	day: z.array(z.string()),
	from: z.string(),
	to: z.string(),
	extra: z.string().optional(),
});

export const updateDisponibilite = z.object({
	day: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
});
export const createSuperposition = z.object({
	disabledDates: z.array(z.string()),
	selectedOption: z.string(),
	titre: z.string(),
	userId: z.string(),
	myTriState: MyTriStateEnum.optional(),
	reqToken: z.string().optional(),
	comment: z.string(),
	file: z.string().optional(),
});
