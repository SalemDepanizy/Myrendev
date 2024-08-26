import { vi } from "date-fns/locale";
import { title } from "process";
import { z } from "zod";

export const createUser = z.object({
	name: z.string(),
	lastname: z.string(),
	phone: z.string(),
	phone2: z.string(),
	phone3: z.string(),
	email: z.string().email(),
	password: z.string().min(8),
	address: z.string(),
	heure: z.number().optional(),
	ville: z.string(),
	codePostal: z.string(),
	etage: z.string().optional(), // Add etage field
	code_acces: z.string().optional(), // Add code_acces field
	code_acces_supplementaire: z.string().optional(), // Add code_acces_supplementaire field
	// heuresup: z.number(),
	interphone: z.string().optional(), // Add interphone field
	image: z.string(),
	type: z.enum(["STUDENTS", "MONITOR", "ADMIN", "COMMERCIAL", "ENTREPRISE"]),
	resetPasswordToken: z.string().optional(),
	resetPasswordExpiry: z.number().optional(),
	color: z.string().optional(),
	// resetPasswordUsed: z.boolean().optional(),
	userType: z.enum(["Professionnel", "Particulier"]), // Add this line
	companyName: z.string().optional(), // Add companyName field
});

export const createMonitor = z.object({
	name: z.string().optional(),
	lastname: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email(),
	password: z.string().min(8),
	address: z.string().optional(),
	image: z.string().optional(),
	ville: z.string().optional(),
	codePostal: z.string().optional(),
	color: z.string().optional(),
	title: z.string().optional(),
	userType: z.enum(["Professionnel", "Particulier"]),
	companyName: z.string().optional(),
	startDate: z.string().optional(),
	contratType: z.string().optional(),
});

export const updateUser = z.object({
	name: z.string().optional(),
	lastname: z.string().optional(),
	phone: z.string().optional(),
	phone2: z.string().optional(),
	phone3: z.string().optional(),
	name_entreprise: z.string().optional(),
	name_manager: z.string().optional(),
	email: z.string().email().optional(),
	address: z.string().optional(),
	heure: z.number().optional(),
	image: z.string().optional(),
	ville: z.string().optional(),
	codePostal: z.string().optional(),
	active: z.boolean().optional(), // Added active field
	// heuresup: z.number().optional(),
	resetPasswordToken: z.string().optional(),
	resetPasswordExpiry: z.number().optional(),
	// resetPasswordUsed: z.boolean().optional(),
	color: z.string().optional(),
});

export const updateMonitor = z.object({
	title: z.string().optional(),
	name: z.string().optional(),
	lastname: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	address: z.string().optional(),
	ville: z.string().optional(),
	codePostal: z.string().optional(),
	active: z.boolean().optional(),
	color: z.string().optional(),
	image: z.string().optional(),
	startDate: z.string().optional(),
	contratType: z.string().optional(),
});

export const createCommercial = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string().min(8),
	color: z.string().optional(),
});

export const updateCommercial = z.object({
	name: z.string().optional(),
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	active: z.boolean().optional(), // Added active field
	color: z.string().optional(),
});

export const createEntreprise = z.object({
	name_entreprise: z.string().optional(),
	name_manager: z.string().optional(),
	phone_entreprise: z.string().optional(),
	phone_manager: z.string().optional(),
	email: z.string().email(),
	password: z.string().min(8),
	address: z.string(),
	ville: z.string().optional(),
	codePostal: z.string().optional(),
	active: z.boolean(),
	color: z.string().optional(),
});

export const updateEntreprise = z.object({
	name_entreprise: z.string().optional(),
	name_manager: z.string().optional(),
	phone_entreprise: z.string().optional(),
	phone_manager: z.string().optional(),
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	address: z.string().optional(),
	ville: z.string().optional(),
	codePostal: z.string().optional(),
	active: z.boolean().optional(), // Added active field
	color: z.string().optional(),
});

export const daySchema = z
	.object({
		// start: z.string(),
		// end: z.string(),
		interval: z.array(z.string()),
	})

	.optional();

export const addOwner = z.object({
	clientId: z.string(),
	ownerName: z.string().optional(),
});
