import { z } from "zod";

export const createVehicule = z.object({
	vehicleBrand: z.string(),
	vehiculeType: z.enum(["Voiture", "Moto"]),
	plate: z.string(),
	type: z.enum(["MANUEL", "AUTOMATIQUE"]),
	monitorId: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	entrepriseId: z.string().optional(),
	carteGris: z.string().optional(),
	assurance: z.string().optional(),
	permis: z.string().optional(),
	files: z.array(z.string()).optional(),
});

export const updateVehicule = z.object({
	vehicleBrand: z.string().optional(),
	vehiculeType: z.enum(["Voiture", "Moto"]).optional(),
	plate: z.string().optional(),
	type: z.enum(["MANUEL", "AUTOMATIQUE"]).optional(),
	monitorId: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	carteGris: z.string().optional(),
	assurance: z.string().optional(),
	permis: z.string().optional(),
	files: z.array(z.string()).optional(),
});
