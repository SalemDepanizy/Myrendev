import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { createRendezvous } from "./schema";
import { updateRendezvous } from "./schema";
import { updateSchedule } from "./schema";
import { majRendezVous } from "./schema";
import { updateDate } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { protect } from "@/lib/protect";
import nodemailer from "nodemailer";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { isValid } from "date-fns";

const router = Router();
const prisma = new PrismaClient();

const { v4: uuidv4 } = require("uuid");

router.post(
	"/send-mail-to-student",
	typed({
		context: protect(),
		schemas: {
			input: z.object({
				email: z.string().email(),
				available: z.any().optional(), // Call optional() method here
				days: z.string().optional(), // Call optional() method here
				date: z.string().optional(), // Include the date parameter
				key: z.string().optional(), // Call optional() method here
				relationKey: z.string(),
				tempsInter: z.number().optional(),
				options: z.array(z.string()).optional(),
				staffIds: z.array(z.string()).optional(),
			}),
		},
		async handler({ input, ctx }) {
			const token = uuidv4();
			const { email } = input;
			const smtpConfig = {
				host: "smtp.ionos.fr",
				port: 465,
				secure: true,
				auth: {
					user: "ne-pas-repondre@myrendev.com",
					pass: "Liamedia2608150155@",
				},
			};
			const expirationPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
			const transporter = nodemailer.createTransport(smtpConfig);
			await prisma.choiceClient.create({
				data: {
					available: input.available!,
					days: input.days!, // Using non-null assertion operator (!)
					date: input.date!,
					key: token,
					relationKey: input.relationKey,
					tempsInter: input.tempsInter!,
					options: input.options,
					staffIds: input.staffIds,
				},
			});

			// Save the token and email to the database
			await prisma.token.create({
				data: {
					token,
					email,
					isAccessed: false,
					expiresAt: new Date(Date.now() + expirationPeriod),
					// choiceClientId: choiceClient.id,
				},
			});

			const entreprisename = await prisma.user.findUnique({
				where: {
					id: ctx.id,
				},
				select: {
					name_entreprise: true,
				},
			});

			const mailOptions = {
				from: "ne-pas-repondre@myrendev.com",
				to: email,
				subject: "Invitation pour prendre un rendez-vous",
				html: `
          <div style="text-align: center;">
            <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
            <h1 style="color: #111;">Veuillez Cliquer sur le lien pour prendre un rendez-vous</h1>
            <p>L'entreprise ${entreprisename?.name_entreprise} vous à demandé de prendre un RDV sur <strong>MyRendev</strong>. Pour procéder, veuillez cliquer sur le lien ci-dessous.</p>
            <a href="${process.env.APP_URL}rendezvousclient?token=${token}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Prendre un Rendez-vous</a>
          </div>
        `,
			};
			try {
				await transporter.sendMail(mailOptions);
				console.log("Email sent successfully");

				return new ApiResponse({
					message: "Email envoyé avec succès",
				});
			} catch (error) {
				console.error("Error sending email:", error);
				throw new ApiError("Erreur lors de l'envoi de l'e-mail");
			}
		},
	})
);

router.post("/validatetoken/:token", async (req, res) => {
	const { token } = req.params;
	try {
		const foundToken = await prisma.token.findUnique({
			where: { token },
		});

		if (!foundToken) {
			return res.status(404).json({ message: "Token not found" });
		}

		if (new Date() > foundToken.expiresAt) {
			return res.status(400).json({ message: "Token has expired" });
		}

		res.json({
			message: "Token validated successfully",
			slotConfirmed: foundToken.slotConfirmed, // Return slotConfirmed status
			email: foundToken.email, // Include the email associated with the token
		});
	} catch (error) {
		console.error("Error validating token:", error);
		res.status(500).json({
			message: "An error occurred while validating the token",
		});
	}
});

router.patch("/confirmedToken/:token", async (req, res) => {
	const { token } = req.params;
	try {
		const updatedToken = await client.token.update({
			where: { token },
			data: { slotConfirmed: true }, // Example: deactivating by setting 'active' to false
		});

		return new ApiResponse(updatedToken);
	} catch (error) {
		console.error("Error validating token:", error);
		res.status(500).json({
			message: "An error occurred while validating the token",
		});
	}
});

router.get(
	"/all",
	typed({
		context: protect("ENTREPRISE"),
		async handler({ ctx, params, input }) {
			const rendezvous = await client.rendezVous.findMany({
				where: {
					owner: {
						owner: {
							id: ctx.id,
						},
					},
				},
				include: {
					client: true,
					forfait: true,
					monitor: true,
					// images: true, // Include images
				},
			});
			return new ApiResponse(rendezvous);
		},
	})
);

router.get(
	"/:enterpriseId/monitor/:monitorId",
	typed({
		schemas: {
			params: z.object({
				enterpriseId: z.string(),
				monitorId: z.string(),
			}),
		},
		async handler({ params }) {
			const rendezvous = await client.rendezVous.findMany({
				where: {
					enterpriseId: params.enterpriseId,

					monitor: {
						id: params.monitorId,
					},
				},
				select: {
					dateTime: true,
					creneau: true,
					duration: true,
				},
			});
			return new ApiResponse(rendezvous);
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
		context: protect(),
		async handler({ ctx, params, input }) {
			const rendezvous = await client.rendezVous.findUnique({
				where: {
					id: params.id,
				},
			});
			if (!rendezvous) {
				throw new ApiError("Ce rendezvous n'existe pas");
			}

			return new ApiResponse(rendezvous);
		},
	})
);

router.get(
	"/get/byClient/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		context: protect(),
		async handler({ params }) {
			const rendezvous = await client.rendezVous.findMany({
				where: {
					clientId: params.id,
				},
				include: {
					client: true,
					// images: true,
				},
				orderBy: {
					dateTime: "desc",
				},
			});
			if (!rendezvous) {
				throw new ApiError("Ce rendezvous n'existe pas");
			}

			return new ApiResponse(rendezvous);
		},
	})
);

router.get(
	"/get/byEmployee/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		context: protect(),
		async handler({ ctx, params, input }) {
			const rendezvous = await client.rendezVous.findMany({
				where: {
					monitorId: params.id,
				},
				include: {
					client: true,
				},
			});
			if (!rendezvous) {
				throw new ApiError("Ce rendezvous n'existe pas");
			}

			return new ApiResponse(rendezvous);
		},
	})
);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname); // Preserve the original filename with a unique suffix
	},
});

const upload = multer({ storage: storage });

router.post(
	"/create",
	upload.array("files", 10), // Handle multiple file uploads
	typed({
		context: protect(),
		schemas: { input: createRendezvous },
		async handler({ input, ctx, req }) {
			try {
				const { ...rest } = input;
				const creneau = rest.creneau;
				const dateTime = rest.dateTime;
				const isValidVerif = rest.isValid === undefined ? true : false;
				const forfait = await prisma.forfait.findUnique({
					where: { id: rest.forfaitId },
					select: { name: true, heure: true }, // Only select the name
				});

				const rendezvous = await prisma.rendezVous.create({
					data: {
						title: rest.title,
						dateTime: dateTime || "",
						description: rest.description,
						creneau: creneau,
						creator: ctx.name_manager ?? "",
						enterpriseName: ctx.name_entreprise ?? "",
						enterpriseId: ctx.id,
						enterpriseContact: [
							ctx.email ?? "",
							ctx.phone_entreprise ?? "",
						],
						relationKey: rest.relationKey ?? "",
						isValid: isValidVerif,
						price: rest.price,
						duration: Number(rest.duration || forfait?.heure) ?? 0,
						client: {
							connect: {
								id: rest.clientId ?? "",
							},
						},
						forfait: {
							connect: {
								id: rest.forfaitId,
							},
						},
						monitor: {
							connect: {
								id: rest.monitorId,
							},
						},
						user: {
							connect: {
								id: ctx.id,
							},
						},
						owner: {
							create: {
								owner: {
									connect: {
										id: ctx.id,
									},
								},
							},
						},
					},
				});

				const files = req.files as Express.Multer.File[];

				if (files && files.length > 0) {
					const fileCreatePromises = files.map((file) =>
						prisma.file.create({
							data: {
								filename: file.filename,
								originalFilename: file.originalname,
								user: { connect: { id: ctx.id } },
								RendezVous: { connect: { id: rendezvous.id } }, // <-- Use 'RendezVous' instead of 'rendezVous'
							},
						})
					);

					// Wait for all file records to be created
					await Promise.all(fileCreatePromises);
				}
				// Prepare data for bulk insert

				// Insert multiple records

				// Send confirmation email (existing code)...
				const student = await prisma.user.findUnique({
					where: {
						id: rest.clientId,
					},
					select: {
						name: true,
						lastname: true,
						email: true,
						resetPasswordToken: true,
					},
				});

				const configLink = `
        <a href="${process.env.APP_URL}reset-password/${student?.resetPasswordToken}" 
        style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">
        Configurer le Mot de Passe</a>`;

				const formattedDate = rest.dateTime
					? new Intl.DateTimeFormat("fr-FR", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
					  }).format(new Date(rest.dateTime))
					: "";

				const entreprisename = await prisma.user.findUnique({
					where: {
						id: ctx.id,
					},
					select: {
						name_entreprise: true,
					},
				});

				if (student && student.email) {
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@", // Your real password here
						},
					});

					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: student.email,
						subject: "Confirmation de votre Rendez-vous",
						html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirmé avec ${
					entreprisename?.name_entreprise
				}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${
					student.name
				} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>
                ${formattedDate}</strong>. Voici les détails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${
						forfait?.name
					}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${
						forfait?.heure
					} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
                ${student.resetPasswordToken !== null ? configLink : ""}
              </div>
            `,
					};
					const mailOptionsForOrder = {
						from: "ne-pas-repondre@myrendev.com",
						to: student.email,
						subject: "Confirmation de votre Rendez-vous",
						html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Commande Confirmé avec ${
					entreprisename?.name_entreprise
				}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${
					student.name
				} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre commande pour le <strong>
                ${formattedDate}</strong>. Voici les détails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${
						forfait?.name
					}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Prix:</strong> ${
						rest?.price
					}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Vous pourrez récuperer votre commande a ce créneau (ESTIMATION):</strong> ${creneau}</p>

               
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
                ${student.resetPasswordToken !== null ? configLink : ""}
              </div>
            `,
					};

					try {
						if (isValidVerif === true && forfait?.heure !== 0) {
							await transporter.sendMail(mailOptions);
						} else if (
							forfait?.heure === 0 &&
							isValidVerif === true
						) {
							await transporter.sendMail(mailOptionsForOrder);
						}
					} catch (error) {
						return new ApiResponse({
							message: "Error sending email",
						});
					}
					console.log("Confirmation email sent to:", student.email);
				}

				return new ApiResponse(rendezvous);
			} catch (error) {
				console.error("Error creating rendezvous:", error);
				throw new ApiError(
					"An error occurred while creating the rendezvous"
				);
			}
		},
	})
);

router.get("/api/files", async (req, res) => {
	const rendezVousId = req.query.rendezVousId;

	if (!rendezVousId || typeof rendezVousId !== "string") {
		return res
			.status(400)
			.json({ error: "RendezVous ID is required and must be a string" });
	}

	try {
		const files = await prisma.file.findMany({
			where: { rendezVousId: rendezVousId },
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

// Route pour l'upload des fichiers

router.post(
	"/update",

	typed({
		context: protect(),
		schemas: { input: updateRendezvous }, // Assuming `updateRendezvous` schema is defined
		async handler({ input, ctx }) {
			try {
				const rendezvousId = input.rendezvousId; // Assuming you receive the ID of the rendezvous to update

				// Update rendezvous details
				const updatedRendezvous = await client.rendezVous.update({
					where: { id: rendezvousId },
					data: {
						title: input.title,
						dateTime: input.dateTime,
						description: input.description,
						creneau: input.creneau,
						client: {
							connect: {
								id: input.clientId,
							},
						},
						forfait: {
							connect: {
								id: input.forfaitId,
							},
						},
						monitor: {
							connect: {
								id: input.monitorId,
							},
						},
					},
				});

				// Send confirmation email after updating rendezvous
				const student = await prisma.user.findUnique({
					where: { id: input.clientId },
					select: { name: true, lastname: true, email: true },
				});

				const rdv = await prisma.rendezVous.findUnique({
					where: { id: updatedRendezvous.id },
					include: {
						forfait: true,
						client: true,
						user: true,
					},
				});

				if (student && student.email) {
					// Construct and send email similar to your create logic
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@",
						},
					});

					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: student.email,
						subject: "Confirmation de votre Rendez-vous mis à jour",
						html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${rdv?.enterpriseName}</h1>
              <h2 style="color: #0056b3;">modifier par ${rdv?.enterpriseName}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${rdv?.client.name} ${rdv?.client.lastname}</strong>,</p>
              <p>Votre rendez-vous a été mis à jour avec succès.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les détails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et créneau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${rdv?.forfait?.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${rdv?.forfait?.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${input.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
            </div>
          `,
					};

					await transporter.sendMail(mailOptions);
					console.log("Confirmation email sent to:", student.email);
				}

				// Handle image updates (similar to create logic)

				let rendezVousWithImage; // Initialize to null or any default value

				if (input.images) {
					rendezVousWithImage = await Promise.all(
						input.images.map(async (image) => {
							if (image) {
								await client.image.update({
									where: { id: image.id }, // Assuming `image.id` is provided to identify the image
									data: {
										filename: image.filename,
									},
								});
							}
						})
					);
				} else {
					rendezVousWithImage = updatedRendezvous;
				}

				return new ApiResponse(rendezVousWithImage);
			} catch (error) {
				console.error("Error updating rendezvous:", error);
				throw new ApiError(
					"An error occurred while updating the rendezvous"
				);
			}
		},
	})
);

router.post(
	"/update-schedule",
	typed({
		context: protect(),
		schemas: { input: updateSchedule }, // Assuming `updateRendezvous` schema is defined
		async handler({ input, ctx }) {
			try {
				const rendezvousId = input.rendezvousId; // Assuming you receive the ID of the rendezvous to update

				// Update rendezvous date and creneau
				const updateSchedule = await client.rendezVous.update({
					where: { id: rendezvousId },
					data: {
						dateTime: input.dateTime,
						creneau: input.creneau,
					},
				});

				// Send confirmation email after updating rendezvous
				const clientInfo = await prisma.user.findUnique({
					where: { id: updateSchedule.clientId },
					select: { name: true, lastname: true, email: true },
				});

				const enterpriseInfo = await prisma.user.findUnique({
					where: { id: updateSchedule.enterpriseId },
					select: {
						name_entreprise: true,
						lastname: true,
						email: true,
					},
				});

				const forfaitInfo = await prisma.forfait.findUnique({
					where: {
						id: updateSchedule.forfaitId
							? updateSchedule.forfaitId
							: undefined,
					},
					select: { name: true, heure: true },
				});

				if (clientInfo && clientInfo.email) {
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@",
						},
					});
					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: clientInfo.email,
						subject: "Rendez-vous mis à jour ",
						html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${enterpriseInfo?.name_entreprise}</h1>
              <h2 style="color: #0056b3;">modifier par ${enterpriseInfo?.name_entreprise}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${clientInfo.name} ${clientInfo.lastname}</strong>,</p>
              <p>Votre rendez-vous a été mis à jour avec succès.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les détails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et créneau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${forfaitInfo?.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${forfaitInfo?.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${input.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
            </div>
          `,
					};

					await transporter.sendMail(mailOptions);
					console.log(
						"Confirmation email sent to:",
						clientInfo.email
					);
				}

				// Return the updated rendezvous
				return new ApiResponse(updateSchedule);
			} catch (error) {
				console.error("Error updating rendezvous:", error);
				throw new ApiError(
					"An error occurred while updating the rendezvous"
				);
			}
		},
	})
);

router.patch(
	"/update-date/:id",
	typed({
		// context: protect(),
		schemas: {
			input: updateDate,
			params: z.object({
				id: z.string(), // Assuming `id` is a string
			}),
		}, // Assumant que le schéma `updateSchedule` est défini
		async handler({ params, input, ctx }) {
			try {
				// const rendezvousId = input.rendezvousId;

				const updatedRendezvous = await client.rendezVous.update({
					where: { id: params.id },
					data: {
						dateTime: input.dateTime,
						// creneau: "10:00 - 11:00",
					},
				});

				// Envoi d'un e-mail de confirmation après la mise à jour du rendez-vous
				const clientInfo = await prisma.user.findUnique({
					where: { id: updatedRendezvous.clientId },
					select: { name: true, lastname: true, email: true },
				});

				const rdv = await prisma.rendezVous.findUnique({
					where: { id: updatedRendezvous.id },
					include: {
						forfait: true,
						client: true,
						user: true,
					},
				});

				if (clientInfo && clientInfo.email) {
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@", // Assurez-vous que ce mot de passe est correct
						},
					});

					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: clientInfo.email,
						subject: "Rendez-vous mis à jour",
						html: `
            <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #0056b3;">Rendez-vous avec ${rdv?.enterpriseName}</h1>
              <h2 style="color: #0056b3;">modifier par ${rdv?.enterpriseName}</h2>
              <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${clientInfo.name} ${clientInfo.lastname}</strong>,</p>
              <p>Votre rendez-vous a été mis à jour avec succès.</p>
              <p style="font-size: 16px; line-height: 1.5;">Voici les détails :</p>
              <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                <p>Nouvelle date et créneau : ${input.dateTime}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${rdv?.forfait?.name}</p>
                <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${rdv?.forfait?.heure} heures</p>
                <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${rdv?.creneau}</p>
              </div>
              <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
            </div>
          `,
					};

					await transporter.sendMail(mailOptions);
				}

				// Retourne le rendez-vous mis à jour
				return new ApiResponse(updatedRendezvous);
			} catch (error) {
				console.error(
					"Erreur lors de la mise à jour du rendez-vous :",
					error
				);
				throw new ApiError(
					"Une erreur s'est produite lors de la mise à jour du rendez-vous"
				);
			}
		},
	})
);

router.patch(
	"/update-by-client",
	typed({
		schemas: { input: majRendezVous },
		async handler({ input }) {
			try {
				const relationKey = input.relationKey;

				const currentRdv = await client.rendezVous.findFirst({
					where: { relationKey: relationKey },
					include: {
						client: true,
						forfait: true,
						user: true,
						monitor: true,
					},
				});

				if (!currentRdv) {
					console.error(
						"No rendezvous found for relationKey:",
						relationKey
					);
					throw new ApiError("Rendezvous not found");
				}

				// Update rendezvous details
				const updatedRendezvous = await client.rendezVous.updateMany({
					where: { relationKey: relationKey },
					data: {
						dateTime: input.dateTime,
						creneau: input.creneau,
						isValid: input.isValid,
						creator:
							currentRdv?.client.name +
							" " +
							currentRdv?.client.lastname,
					},
				});

				const updatedRdv = await client.rendezVous.findFirst({
					where: { relationKey: relationKey },
					include: {
						client: true,
						forfait: true,
						user: true,
						monitor: true,
					},
				});

				const formattedDate = updatedRdv?.dateTime
					? new Intl.DateTimeFormat("fr-FR", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
					  }).format(new Date(updatedRdv?.dateTime))
					: "";

				const mailData = await client.rendezVous.findMany({
					where: { relationKey: relationKey },
					include: { client: true },
				});

				const emails = mailData.map((item) => item.client.email);

				const student = await prisma.user.findUnique({
					where: { email: emails[0] },
					select: {
						name: true,
						lastname: true,
						email: true,
						id: true,
					},
				});

				if (student && student.email) {
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@",
						},
					});

					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: emails,
						subject: "Confirmation de votre Rendez-vous",
						html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirmé avec ${updatedRdv?.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>${formattedDate}</strong>. Voici les détails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${updatedRdv?.forfait?.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${updatedRdv?.forfait?.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${updatedRdv?.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
              </div>
            `,
					};
					const mailOptionsFalse = {
						from: "ne-pas-repondre@myrendev.com",
						to: emails,
						subject: "Rendez-vous en attente de confirmation",
						html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous en attente de confirmation avec ${updatedRdv?.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Votre demande de rendez-vous pour le <strong>${formattedDate}</strong> a été reçue et est en attente de réponse de la part de l'entreprise. Voici les détails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${updatedRdv?.forfait?.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${updatedRdv?.forfait?.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${updatedRdv?.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre patience. Nous vous informerons dès que l'entreprise aura confirmé le rendez-vous.</p>
              </div>
            `,
					};

					if (input.isValid === true) {
						await transporter.sendMail(mailOptions);
					} else {
						await transporter.sendMail(mailOptionsFalse);
					}

					const notificationMessage = `Rendez vous confirmé pour le client ${student.name} ${student.lastname} pour le ${formattedDate} à ${updatedRdv?.creneau}.`;

					const findOwnership = await prisma.ownership.findFirst({
						where: {
							userId: student.id,
							ownerId: updatedRdv?.enterpriseId,
						},
					});

					await prisma.notification.create({
						data: {
							message: notificationMessage,
							userId: student.id,
							ownershipId: findOwnership ? findOwnership.id : "", // Replace with actual ownershipId value
						},
					});

					console.log("Notification created successfully.");
				}

				return new ApiResponse(updatedRendezvous);
			} catch (error) {
				console.error("Error updating rendezvous:", error);
				throw new ApiError(
					"An error occurred while updating the rendezvous"
				);
			}
		},
	})
);

router.get(
	"/get/notifications",
	typed({
		context: protect("ENTREPRISE"), // Ensure only authenticated entreprise can access this route
		async handler({ ctx }) {
			// Assuming ctx.id contains the entreprise ID after successful authentication
			const users = await client.notification.findMany({
				where: {
					ownership: {
						ownerId: ctx.id, // Use the entreprise ID from the context to filter monitors
					},
				},
				include: { user: true },
			});

			return new ApiResponse(users);
		},
	})
);

router.post("/notifications/:id/mark-as-read", async (req, res, next) => {
	const { id } = req.params;

	try {
		// Find the notification by id and update its read status
		const updatedNotification = await prisma.notification.update({
			where: { id },
			data: { read: true },
		});

		res.status(200).json(updatedNotification);
	} catch (error) {
		console.error("Error marking notification as read:", error);
		res.status(500).json({
			error: "An error occurred while marking notification as read",
		});
	}
});

router.patch(
	"/update-status",
	typed({
		context: protect(),
		schemas: { input: updateRendezvous }, // Assuming `updateRendezvous` schema is defined
		async handler({ input, ctx }) {
			try {
				// Update rendezvous details
				const updatedRendezvous = await client.rendezVous.update({
					where: { id: input.rendezvousId },
					data: {
						isValid: true,
					},
				});

				const currentRdv = await client.rendezVous.findUnique({
					where: { id: input.rendezvousId },
					include: { client: true, forfait: true },
				});

				const mailData = await client.rendezVous.findMany({
					where: { clientId: input.clientId },
					include: { client: true },
				});

				const formattedDate = currentRdv?.dateTime
					? new Intl.DateTimeFormat("fr-FR", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
					  }).format(new Date(currentRdv?.dateTime))
					: "";

				const emails = mailData.map((item) => item.client.email);

				const student = await prisma.user.findUnique({
					where: { email: emails[0] },
					select: { name: true, lastname: true, email: true },
				});

				if (student && student.email) {
					// Construct and send email similar to your create logic
					const transporter = nodemailer.createTransport({
						host: "smtp.ionos.fr",
						port: 465,
						secure: true,
						auth: {
							user: "ne-pas-repondre@myrendev.com",
							pass: "Liamedia2608150155@",
						},
					});

					const mailOptions = {
						from: "ne-pas-repondre@myrendev.com",
						to: emails,
						subject: "Confirmation de votre Rendez-vous",
						html: `
              <div style="font-family: Arial, sans-serif; color: #333; text-align: center; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
                <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
                <h1 style="color: #0056b3;">Rendez-vous Confirmé avec ${currentRdv?.enterpriseName}</h1>
                <p style="font-size: 16px; line-height: 1.5;">Bonjour <strong>${student.name} ${student.lastname}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.5;">Nous sommes heureux de confirmer votre rendez-vous pour le <strong>
                ${formattedDate}</strong>. Voici les détails :</p>
                <div style="background-color: #f2f2f2; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <p style="margin: 0; font-size: 16px;"><strong>Intervention:</strong> ${currentRdv?.forfait?.name}</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Temps d'intervention:</strong> ${currentRdv?.forfait?.heure} heures</p>
                  <p style="margin: 0; font-size: 16px;"><strong>Horaire (ESTIMATION):</strong> ${currentRdv?.creneau}</p>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Nous vous remercions pour votre confiance et nous réjouissons de vous voir.</p>
              </div>
            `,
					};

					await transporter.sendMail(mailOptions);
				}
				// Handle image updates (similar to create logic)
				return new ApiResponse(updatedRendezvous);
			} catch (error) {
				console.error("Error updating rendezvous:", error);
				throw new ApiError(
					"An error occurred while updating the rendezvous"
				);
			}
		},
	})
);

router.patch(
	"/desactivate/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(), // Define id as a string parameter
			}),
		},
		async handler({ params }) {
			try {
				// Update the rendezVous with the provided id
				await client.rendezVous.update({
					where: { id: params.id },
					data: { isActivated: false }, // Example: deactivating by setting 'active' to false
				});

				// Return a success response
				return new ApiResponse({
					success: true,
				});
			} catch (error) {
				// Handle errors appropriately
				console.error("Error deactivating rendezVous:", error);
				return new ApiResponse({
					success: false,
					error: "Failed to deactivate rendezVous",
				});
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
			await client.rendezVous.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);

export { router as rendezvousRouter };
