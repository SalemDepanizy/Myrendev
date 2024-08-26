import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { createVehicule, updateVehicule } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { protect } from "@/lib/protect";
import { PrismaClient } from "@prisma/client";

const router = Router();

router.get(
	"/all",
	typed({
		context: protect(),
		async handler({ ctx }) {
			const vehicules = await client.vehicule.findMany({
				include: {
					entreprise: true,
					monitor: true,
					files: true,
				},
				where: {
					entrepriseId: ctx.id,
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
			const vehicule = await client.vehicule.findUnique({
				where: {
					id: params.id,
				},
			});
			if (!vehicule) {
				throw new ApiError("Ce forfait n'existe pas");
			}

			return new ApiResponse(vehicule);
		},
	})
);
const prisma = new PrismaClient();

router.post(
	"/create",
	typed({
		context: protect(),
		schemas: { input: createVehicule },
		async handler({ input, ctx, req }) {
			try {
				if (!ctx || !ctx.id) {
					throw new Error("Context or Context ID is null");
				}
				const { entrepriseId, monitorId, ...rest } = input;
				const vehiculeData: any = {
					plate: rest.plate,
					type: rest.type,
					vehicleBrand: rest.vehicleBrand,
					vehiculeType: rest.vehiculeType,
					startDate: rest.startDate,
					endDate: rest.endDate,
					entreprise: {
						connect: {
							id: ctx.id,
						},
					},
					carteGris: rest?.carteGris,
					assurance: rest?.assurance,
					permis: rest?.permis,
				};

				if (monitorId) {
					vehiculeData.monitor = {
						connect: {
							id: monitorId,
						},
					};
				}

				const vehicule = await client.vehicule.create({
					data: vehiculeData,
				});

				const files: string[] = input?.files ? input?.files : [];
				if (files && files.length > 0) {
					console.log(files);
					const fileCreatePromises = files.map((file) =>
						prisma.file.create({
							data: {
								filename: file,
								originalFilename: "",
								userId: ctx?.id,
								vehiculeId: vehicule?.id,
							},
						})
					);
					await Promise.all(fileCreatePromises);
				}

				return new ApiResponse(vehicule);
			} catch (error) {
				console.error("Error creating vehicule:", error);
				throw error;
			}
		},
	})
);

router.get("/api/files", async (req, res) => {
	const vehicleId = req.query.vehicleId;
	if (!vehicleId || typeof vehicleId !== "string") {
		return res
			.status(400)
			.json({ error: "Vehicle ID is required and must be a string" });
	}

	try {
		const files = await prisma.file.findMany({
			where: { vehiculeId: vehicleId },
			select: {
				filename: true,
				originalFilename: true,
			},
		});
		res.json(files);
	} catch (error) {
		console.error("Error fetching files:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.patch(
	"/update/:id",
	typed({
		context: protect(),
		schemas: {
			params: z.object({
				id: z.string(),
			}),
			input: updateVehicule,
		},
		async handler({ params, input, ctx }) {
			try {
				const existingVehicule = await client.vehicule.findUnique({
					where: {
						id: params.id,
					},
				});
				if (!existingVehicule) {
					throw new ApiError("Ce Vehicule n'existe pas");
				}

				const { monitorId, ...rest } = input;
				const vehiculeData: any = {
					plate: rest.plate,
					type: rest.type,
					vehicleBrand: rest.vehicleBrand,
					vehiculeType: rest.vehiculeType,
					startDate: rest.startDate,
					endDate: rest.endDate,
					carteGris: rest?.carteGris,
					assurance: rest?.assurance,
					permis: rest?.permis,
				};

				if (monitorId) {
					vehiculeData.monitor = {
						connect: {
							id: monitorId,
						},
					};
				}

				const updateVehicule = await client.vehicule.update({
					where: {
						id: params.id,
					},
					data: vehiculeData,
				});

				const files: string[] = input?.files ? input?.files : [];
				if (files && files.length > 0) {
					console.log(files);
					const fileCreatePromises = files.map((file) =>
						prisma.file.create({
							data: {
								filename: file,
								originalFilename: "",
								userId: ctx?.id,
								vehiculeId: updateVehicule?.id,
							},
						})
					);
					await Promise.all(fileCreatePromises);
				}

				return new ApiResponse({
					success: true,
				});
			} catch (error) {
				return new ApiError(
					"Une erreur s'est produite lors de la mise à jour de l'utilisateur"
				);
			}
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
			await client.vehicule.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);

export { router as vehiculeRouter };
