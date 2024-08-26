import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import {
	createDisponibilite,
	updateDisponibilite,
	createSuperposition,
} from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { protect } from "@/lib/protect";

const router = Router();

// Adjusted to reflect your schema and explanation
router.get(
	"/all",
	typed({
		context: protect(), // Ensure user context is set correctly
		async handler({ ctx }) {
			const userId = ctx.id; // Assuming ctx.id contains the logged-in user's ID
			const vehicules = await client.vehicule.findMany({
				where: {
					userId: userId, // Use the correct field as per your schema if different
				},
				include: {
					monitor: true, // Includes monitor details; adjust as needed
				},
			});
			return new ApiResponse(vehicules);
		},
	})
);

router.get(
	"/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},

		async handler({ params }) {
			const disponibilite = await client.disponibilite.findUnique({
				where: {
					id: params.id,
				},
			});
			if (!disponibilite) {
				throw new ApiError("Ce forfait n'existe pas");
			}

			return new ApiResponse(disponibilite);
		},
	})
);

router.post(
	"/create",
	typed({
		schemas: {
			input: createDisponibilite,
		},
		context: protect(), // Ensure the user is authenticated
		async handler({ input, ctx }) {
			const { day, from, to, extra } = input;
			const disponibilite = await client.disponibilite.create({
				data: {
					...input,
					userId: ctx.id, // Associate the new disponibilite with the authenticated user's ID
				},
			});
			return new ApiResponse(disponibilite);
		},
	})
);

router.delete(
	"/delete/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			await client.disponibilite.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);

router.post(
	"/create/superposition",
	typed({
		schemas: {
			input: createSuperposition,
		},
		context: protect(),
		async handler({ input, ctx }) {
			const savedSuperposition = await client.superposition.create({
				data: {
					...input,
					enterpriseId: ctx.id,
					myTriState: "TRUE",
					reqToken: input.reqToken || "",
				},
			});
			return new ApiResponse(savedSuperposition);
		},
	})
);

router.get(
	"/get/superposition",
	typed({
		context: protect(), // Use authentication context
		async handler({ ctx }) {
			const superpositions = await client.superposition.findMany({
				where: {
					enterpriseId: ctx.id, // Filter by the authenticated user's ID
				},
				include: {
					user: true,
				},
			});
			return new ApiResponse(superpositions);
		},
	})
);

router.patch(
	"/update/superposition/:id",
	typed({
		context: protect(),
		schemas: {
			input: z.object({
				newDates: z.array(z.string()),
				titre: z.string(),
				userId: z.string(),
				comment: z.string(),
				file: z.string().optional(),
			}),
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params, input }) {
			try {
				const datesToUpdate = await client.superposition.update({
					where: { id: params.id },
					data: {
						disabledDates: input.newDates,
						titre: input?.titre,
						userId: input?.userId,
						comment: input?.comment,
						file: input?.file,
					},
				});
				return new ApiResponse(datesToUpdate);
			} catch (error) {
				console.error(error);
				return new ApiResponse(
					{ error: "Failed to update superposition" },
					500
				);
			}
		},
	})
);

router.get(
	"/get/superposition/all",
	typed({
		context: protect(), // Use authentication context
		async handler({ ctx }) {
			const superpositions = await client.superposition.findMany();
			return new ApiResponse(superpositions);
		},
	})
);

router.get(
	"/get/superposition/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		context: protect(), // Use authentication context
		async handler({ params, ctx }) {
			const superpositions = await client.superposition.findUnique({
				where: {
					id: params.id,
				},
				include: {
					user: true,
				},
			});

			if (!superpositions) {
				return new ApiResponse({ error: "Superposition not found" });
			}

			return new ApiResponse(superpositions);
		},
	})
);

router.get(
	"/get/superposition/entreprise/:entrepriseId/monitor/:monitorId",
	typed({
		schemas: {
			params: z.object({
				entrepriseId: z.string(),
				monitorId: z.string(),
			}),
		},

		async handler({ params }) {
			const superpositions = await client.superposition.findMany({
				where: {
					enterpriseId: params.entrepriseId, // Filter by the authenticated user's ID
					userId: params.monitorId,
				},
				select: {
					disabledDates: true,
				},
			});
			return new ApiResponse(superpositions);
		},
	})
);

router.get(
	"/get/disponibilite",
	typed({
		context: protect(), // Use authentication context
		async handler({ ctx }) {
			const disponibilites = await client.disponibilite.findMany({
				where: {
					userId: ctx.id, // Filter by the authenticated user's ID
				},
			});
			return new ApiResponse(disponibilites);
		},
	})
);

router.delete(
	"/deletes/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			await client.superposition.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);
router.delete(
	"/deleteDisponibilite/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			await client.disponibilite.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);

export { router as disponibiliteRouter };
