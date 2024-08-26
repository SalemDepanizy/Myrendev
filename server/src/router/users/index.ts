import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { client } from "@/prisma";
import { Router } from "express";
import { z } from "zod";
import {
	createCommercial,
	createEntreprise,
	createMonitor,
	createUser,
	addOwner,
	daySchema,
	updateCommercial,
	updateEntreprise,
	updateMonitor,
	updateUser,
} from "./schema";
import * as bcrypt from "bcrypt";
import { createId } from "@paralleldrive/cuid2";
import { protect } from "@/lib/protect";
import { Prisma, PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const jwt = require("jsonwebtoken");

router.post(
	"/forget-password",
	typed({
		schemas: {
			input: z.object({
				email: z.string().email(),
			}),
		},
		async handler({ input }) {
			const { email } = input;

			try {
				// Vérifier si l'utilisateur existe avec l'e-mail fourni
				const existingUser = await client.user.findUnique({
					where: {
						email,
					},
				});

				if (!existingUser) {
					throw new ApiError("Utilisateur non trouvé");
				}

				// const resetToken = jwt.sign(
				//   { userId: existingUser.id },
				//   "m7WxZl#o9K!sE2%rYpT",
				//   { expiresIn: "1h" }
				// );

				// Générer un jeton de réinitialisation (vous pouvez utiliser une librairie comme crypto.randomBytes pour le rendre plus sécurisé)
				const resetToken = Math.random().toString(36).slice(2);

				// Mettez à jour le champ resetPasswordToken et resetPasswordExpiry dans la base de données
				await client.user.update({
					where: { id: existingUser.id },
					data: {
						resetPasswordToken: resetToken,
						resetPasswordExpiry: Date.now() + 3600000, // Exemple : expire dans 1 heure
						// resetPasswordUsed: false,
					},
				});

				// Envoyer un email avec le lien de réinitialisation
				const resetLink = `${process.env.APP_URL}reset-password/${resetToken}`;

				// Utilisez Nodemailer ou un autre service pour envoyer l'e-mail
				const smtpConfig = {
					host: "smtp.ionos.fr",
					port: 465,
					secure: true,

					auth: {
						user: "ne-pas-repondre@myrendev.com",
						pass: "Liamedia2608150155@",
					},
				};

				const transporter = nodemailer.createTransport(smtpConfig);

				// Use the transporter to send emails
				//   const mailOptions = {
				//     from: "test@depanizy.com",
				//     to: email,
				//     subject: "Réinitialisation de mot de passe",
				//     text: `http://localhost:5173/reset-password/${resetToken}`,
				//     html: `
				//         <div style="text-align: center;">
				//             <img src="https://www.example.com/images/logo.png" alt="Logo" style="max-width: 200px;">
				//             <h1 style="color: #111;">Réinitialisation de Mot de Passe</h1>
				//             <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>MyRendev</strong>. Pour procéder, veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe.</p>
				//             <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Réinitialiser le Mot de Passe</a>
				//         </div>
				//     `,
				// };

				const mailOptions = {
					from: "ne-pas-repondre@myrendev.com",
					to: email,
					subject: "Réinitialisation de Votre Mot de Passe",
					text: `${process.env.APP_URL}reset-password/${resetToken}`,
					html: `
            <div style="text-align: center;">
            <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
                <h1 style="color: #111;">Réinitialisation de Votre Mot de Passe</h1>
                <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>MyRendev</strong>. Pour procéder, veuillez cliquer sur le lien ci-dessous.</p>
    
                <!-- Bouton qui agit comme un lien -->
                <a href="${resetLink}" style="text-decoration: none;">
                    <button style="background-color: #4daac4;
                                   color: white;
                                   padding: 14px 25px;
                                   text-align: center;
                                   border: none;
                                   display: inline-block;
                                   border-radius: 5px;
                                   cursor: pointer;">
                        Réinitialiser le mot de passe
                    </button>
                </a>
            </div>
        `,
				};

				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						console.error("Error sending email:", error);
						throw new ApiError(
							"Erreur lors de l'envoi de l'e-mail de réinitialisation"
						);
					} else {
					}
				});

				return new ApiResponse({
					message: "Email envoyé avec le lien de réinitialisation",
				});
			} catch (error) {
				console.error(
					"Erreur lors de la réinitialisation du mot de passe:",
					error
				);
				throw new ApiError(
					"Une erreur s'est produite lors de la réinitialisation du mot de passe"
				);
			}
		},
	})
);

router.get(
	"/isTokenValid/:token",
	typed({
		schemas: {
			params: z.object({
				token: z.string(),
			}),
		},
		async handler({ params }) {
			const { token } = params;

			try {
				// Trouver l'utilisateur par le jeton de réinitialisation
				const existingUser = await client.user.findFirst({
					where: {
						resetPasswordToken: token,
						resetPasswordExpiry: { gte: Date.now() },
					},
				});

				if (!existingUser) {
					throw new ApiError(
						"Token de réinitialisation invalide ou expiré"
					);
				}
				return new ApiResponse({
					valid: true,
				});
			} catch (e) {
				throw new ApiError(
					"Token de réinitialisation invalide ou expiré"
				);
			}
		},
	})
);

router.post(
	"/reset-password",
	typed({
		schemas: {
			input: z.object({
				token: z.string(),
				newPassword: z.string().min(8),
			}),
		},
		async handler({ input }) {
			const { token, newPassword } = input;

			try {
				// Trouver l'utilisateur par le jeton de réinitialisation
				const existingUser = await client.user.findFirst({
					where: {
						resetPasswordToken: token,
						resetPasswordExpiry: { gte: Date.now() },
					},
				});

				if (!existingUser) {
					throw new ApiError(
						"Token de réinitialisation invalide ou expiré"
					);
				}

				// Convertir le type pour inclure les propriétés manuelles
				const userData: Prisma.userUpdateInput = {
					password: await bcrypt.hash(newPassword, 10),
					resetPasswordToken: null,
					resetPasswordExpiry: Date.now() + 3600000,
					// ... (autres champs de mise à jour générés par Prisma, si nécessaire)
				};

				// Mettre à jour le mot de passe dans la base de données
				await client.user.update({
					where: { id: existingUser.id },
					data: userData,
				});

				return new ApiResponse({
					message: "Mot de passe réinitialisé avec succès",
				});
			} catch (error) {
				console.error(
					"Erreur lors de la réinitialisation du mot de passe:",
					error
				);
				throw new ApiError(
					"Une erreur s'est produite lors de la réinitialisation du mot de passe"
				);
			}
		},
	})
);

// ... (autres routes existantes)

// ... (autres routes existantes)

router.get(
	"/all",
	typed({
		async handler(props) {
			const users = (await client.user.findMany()).map((user) => ({
				...user,
				password: undefined,
			}));
			return new ApiResponse(users);
		},
	})
);

router.get(
	"/get/student",
	typed({
		context: protect("ENTREPRISE"),
		async handler({ ctx }) {
			const users = (
				await client.ownership.findMany({
					where: {
						owner: {
							id: ctx.id,
						},
						user: {
							type: "STUDENTS",
						},
					},
					include: {
						user: {
							include: { creator: true },
						},
					},
				})
			).map((owner) => ({
				...owner.user,
				password: undefined,
			}));
			return new ApiResponse(users);
		},
	})
);

router.get(
	"/get/monitor",
	typed({
		context: protect("ENTREPRISE"),
		async handler({ ctx }) {
			const users = (
				await client.ownership.findMany({
					where: {
						owner: {
							id: ctx.id,
						},
						user: {
							type: "MONITOR",
						},
					},
					include: {
						user: {
							include: { availabilities: true },
						},
					},
				})
			).map((ownership) => ({
				...ownership.user,
				password: undefined,
			}));
			return new ApiResponse(users);
		},
	})
);

router.get(
	"/get/monitorAvail",
	typed({
		context: protect("ENTREPRISE"), // Ensure only authenticated entreprise can access this route
		async handler({ ctx }) {
			// Assuming ctx.id contains the entreprise ID after successful authentication
			const users = (
				await client.ownership.findMany({
					where: {
						owner: {
							id: ctx.id, // Use the entreprise ID from the context to filter monitors
						},
						user: {
							type: "MONITOR",
							availabilities: {
								some: {},
							},
						},
					},
					include: { user: true },
				})
			).map((ownership) => ({
				...ownership.user,
				password: undefined, // Exclude password from the response for security
			}));
			return new ApiResponse(users);
		},
	})
);

router.get(
	"/get/commercial",
	typed({
		async handler(props) {
			const users = (
				await client.user.findMany({
					where: { type: "COMMERCIAL" },
					include: {
						creator: true,
					},
				})
			).map((user) => ({
				...user,
				password: undefined,
			}));
			return new ApiResponse(users);
		},
	})
);

router.get(
	"/get/entreprise",
	typed({
		async handler(props) {
			const users = (
				await client.user.findMany({
					where: { type: "ENTREPRISE" },
					include: {
						forfait: true,
						creator: true,
					},
				})
			).map((user) => ({
				...user,
				password: undefined,
			}));
			return new ApiResponse(users);
		},
	})
);

// router.get(
//   "/get/student/info/email",
//   typed({
//     schemas: {
//        input: z.object({ email: z.string() }),
//     },
//     context: protect("ENTREPRISE"),
//     async handler(input) {
//       const users = await client.user.findUnique({
//         where: {
//           email: "empir47@gmail.com",
//         },
//       });
//       if (users) {
//         return new ApiResponse(users);
//       } else {
//         return new ApiResponse({ status: "error", message: "User not found" });
//       }
//     },
//   })
// );

router.post(
	"/student/info/email",
	typed({
		schemas: {
			input: z.object({ email: z.string() }),
		},
		context: protect("ENTREPRISE"),
		async handler({ input }) {
			const { email } = input;
			const users = await client.user.findUnique({
				where: {
					email: email,
				},
			});
			if (users) {
				return new ApiResponse(users);
			} else {
				return new ApiResponse({
					status: "error",
					message: "User not found",
				});
			}
		},
	})
);

router.get(
	"/get/ownership",
	typed({
		context: protect(), // Use authentication context
		async handler({ ctx }) {
			const disponibilites = await client.ownership.findMany({
				where: {
					ownerId: ctx.id,
				},
			});
			return new ApiResponse(disponibilites);
		},
	})
);
router.get(
	"/get/ownership/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		context: protect(), // Use authentication context
		async handler({ params, ctx }) {
			const disponibilites = await client.ownership.findMany({
				where: {
					userId: params.id,
				},
				include: { owner: true },
			});
			return new ApiResponse(disponibilites);
		},
	})
);

router.get(
	"/get/ownership/owner/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		context: protect(), // Use authentication context
		async handler({ params, ctx }) {
			const disponibilites = await client.ownership.findMany({
				where: {
					ownerId: params.id,
				},
				include: { owner: true, user: true },
			});
			return new ApiResponse(disponibilites);
		},
	})
);
// Route to update user's active status
router.patch(
	"/update-status/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
			input: z.object({
				active: z.boolean(),
			}),
		},
		async handler({ params, input }) {
			const { id } = params;
			const { active } = input;

			try {
				const updatedUser = await client.user.update({
					where: { id },
					data: { active },
				});

				return new ApiResponse({
					success: true,
					message: `User ${
						active ? "activated" : "deactivated"
					} successfully.`,
					data: { userId: id, active: updatedUser.active },
				});
			} catch (error) {
				console.error("Error updating user status:", error);
				throw new ApiError("Failed to update user status");
			}
		},
	})
);

router.get(
	"/get/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			const user = await client.user.findUnique({
				where: {
					id: params.id,
				},
				include: { forfait: true },
			});
			if (!user) throw new ApiError("Cet utilisateur n'existe pas");
			return new ApiResponse(user);
		},
	})
);

router.post(
	"/create",
	typed({
		schemas: {
			input: createUser,
		},
		context: protect(),
		async handler({ input, ctx }) {
			const { email, ...data } = input;
			const id = createId();

			const normalizedEmail = email.toLowerCase();
			const hashedPassword = await bcrypt.hash(input.password, 10);
			const passwordResetToken = Math.random().toString(36).slice(2);
			const resetPasswordExpiry = Date.now() + 48 * 3600 * 1000; // 48 hours expiry

			const user = await client.user.create({
				data: {
					...data,
					email: normalizedEmail,
					id,
					password: hashedPassword,
					resetPasswordToken: passwordResetToken,
					resetPasswordExpiry: resetPasswordExpiry,
					userType: input.userType,
					companyName: input.companyName,
					etage: input.etage,
					code_acces: input.code_acces,
					code_acces_supplementaire: input.code_acces_supplementaire,
					interphone: input.interphone,
					creatorId: ctx?.id,
				},
			});

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
				to: user.email,
				subject: "Bienvenue sur Notre Plateforme!",
				text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
				html: `
        <div style="text-align: center;">
          <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
          <p>Votre compte a été créé avec succès.</p>
          <p>Veuillez noter vos informations de connexion :</p>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Mot de passe:</strong> ${input.password}</p>
          <p>Veuillez compléter votre inscription en configurant votre mot de passe :</p>
          <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
          <p>Ce lien expirera dans 48 heures.</p>
        </div>
      `,
			};

			// transporter.sendMail(mailOptions, (error, info) => {
			//   if (error) {
			//     console.log(`Error sending email: ${error}`);
			//   } else {
			//     console.log(`Email sent: ${info.response}`);
			//   }
			// });

			// Create ownership relationship between the current user (owner) and the new user
			const ownership = await client.ownership.create({
				data: {
					ownerName: ctx.name_entreprise ?? "",
					user: {
						connect: {
							id,
						},
					},
					owner: {
						connect: {
							id: ctx.id,
						},
					},
				},
			});

			return new ApiResponse(user);
		},
	})
);

router.post(
	"/assign-client",
	typed({
		schemas: {
			input: addOwner,
		},
		context: protect(),
		async handler({ input, ctx }): Promise<ApiResponse> {
			try {
				const { clientId } = input;
				const ownerId = ctx.id; // Supposons que ctx contient l'ID du propriétaire

				const ownership = await client.ownership.create({
					data: {
						ownerName: ctx.name_entreprise ?? "",
						user: {
							connect: {
								id: clientId,
							},
						},
						owner: {
							connect: {
								id: ownerId,
							},
						},
					},
				});
				const responseData = {
					ownership,
					message: "Client attribué avec succès",
				};
				// Répondre avec succès
				return new ApiResponse(responseData, 200); // Ou vous pouvez construire ApiResponse avec les données appropriées
			} catch (error) {
				// Gérer les erreurs
				console.error(
					"Erreur lors de l'attribution du client :",
					error
				);
				throw new Error("Impossible d'attribuer le client");
			}
		},
	})
);

const prisma = new PrismaClient();

// Set up multer for file handling
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + "between" + file.originalname); // Preserve the original filename with a unique suffix
	},
});

const upload = multer({ storage: storage });

router.post(
	"/create/monitor",
	typed({
		schemas: {
			input: createMonitor,
		},
		context: protect("ENTREPRISE"),
		async handler({ input, ctx }) {
			const { email, ...userData } = input;
			const normalizedEmail = email.toLowerCase();
			const hashedPassword = await bcrypt.hash(userData.password, 10);
			const passwordResetToken = Math.random().toString(36).slice(2);
			const resetPasswordExpiry = Date.now() + 48 * 3600 * 1000;
			const user = await prisma.user.create({
				data: {
					...userData,
					email: normalizedEmail,
					password: hashedPassword,
					type: "MONITOR",
					resetPasswordToken: passwordResetToken,
					resetPasswordExpiry: resetPasswordExpiry,
					creatorId: ctx?.id,
					startDate: input?.startDate
						? new Date(input.startDate)
						: undefined,
				},
			});

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
				to: user.email,
				subject: "Bienvenue sur Notre Plateforme!",
				text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
				html: `
          <div style="text-align: center;">
            <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
            <p>Votre compte a été créé avec succès.</p>
            <p>Veuillez noter vos informations de connexion :</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            <p><strong>Mot de passe:</strong> ${userData.password}</p>
            <p>Veuillez compléter votre inscription en configurant votre mot de passe :</p>
            <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
            <p>Ce lien expirera dans 48 heures.</p>
          </div>
        `,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(`Error sending email: ${error}`);
				} else {
					console.log(`Email sent: ${info.response}`);
				}
			});

			await prisma.ownership.create({
				data: {
					ownerName: ctx.name_entreprise ?? "",
					user: {
						connect: {
							id: user.id,
						},
					},
					owner: {
						connect: {
							id: ctx.id,
						},
					},
				},
			});

			return new ApiResponse(user);
		},
	})
);

router.get("/api/files", async (req, res) => {
	const monitorId = req.query.monitorId;

	if (!monitorId || typeof monitorId !== "string") {
		return res
			.status(400)
			.json({ error: "Monitor ID is required and must be a string" });
	}

	try {
		const files = await prisma.file.findMany({
			where: { userId: monitorId },
			select: {
				filename: true,
				originalFilename: true, // Include this field if it exists in your schema
			},
		});

		res.json(files);
	} catch (error) {
		console.error("Error fetching files:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

//creat commmercial
router.post(
	"/create/commercial",
	typed({
		schemas: {
			input: createCommercial,
		},
		context: protect(),
		async handler({ input, ctx }) {
			const { email, ...userData } = input;
			const normalizedEmail = email.toLowerCase();

			const hashedPassword = await bcrypt.hash(userData.password, 10);

			const user = await client.user.create({
				data: {
					...userData,
					email: normalizedEmail,
					password: hashedPassword,
					type: "COMMERCIAL",
					creatorId: ctx?.id,
				},
			});

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
				to: user.email,
				subject: "Bienvenue sur Notre Plateforme!",
				html: `
          <div style="text-align: center;">
            <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
            <p>Votre compte commercial a été créé avec succès.</p>
            <p>Veuillez noter vos informations de connexion :</p>
            <p><strong>Email:</strong> ${normalizedEmail}</p>
            <p><strong>Mot de passe:</strong> ${userData.password}</p>
            <p>Vous pouvez désormais vous connecter à votre compte.</p>
          </div>
        `,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(`Error sending email: ${error}`);
				} else {
					console.log(`Email sent: ${info.response}`);
				}
			});

			return new ApiResponse(user);
		},
	})
);

// router.post(
//   "/create/entreprise",
//   typed({
//     schemas: {
//       input: createEntreprise,
//     },
//     async handler({ input }) {
//       const user = await client.user.create({
//         data: {
//           ...input,
//           password: await bcrypt.hash(input.password, 10),
//           type: "ENTREPRISE",
//         },
//       });

//       return new ApiResponse(user);
//     },
//   })
// );

router.post(
	"/create/entreprise",
	typed({
		schemas: {
			input: createEntreprise,
		},
		context: protect(),
		async handler({ input, ctx }) {
			const { email, ...userData } = input;
			const normalizedEmail = email.toLowerCase();
			const hashedPassword = await bcrypt.hash(userData.password, 10);

			const passwordResetToken = Math.random().toString(36).slice(2);
			const user = await client.user.create({
				data: {
					...userData,
					email: normalizedEmail,
					password: hashedPassword,
					type: "ENTREPRISE",
					resetPasswordToken: passwordResetToken,
					resetPasswordExpiry: Date.now() + 48 * 3600 * 1000,
					creatorId: ctx?.id,
				},
			});

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
				to: user.email,
				subject: "Complétez Votre Inscription",
				text: `${process.env.APP_URL}reset-password/${passwordResetToken}`,
				html: `
        <div style="text-align: center;">
          <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
          <h1 style="color: #111;">Bienvenue sur Notre Plateforme!</h1>
          <p>Votre compte a été créé. Veuillez noter votre mot de passe pour la connexion :</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Mot de passe:</strong> ${userData.password}</p>
          <p>Veuillez compléter votre inscription en configurant votre mot de passe :</p>
          <a href="${process.env.APP_URL}reset-password/${passwordResetToken}" style="display: inline-block; background-color: #111; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; text-decoration: none;">Configurer le Mot de Passe</a>
          <p>Ce lien expirera dans 48 heures.</p>
        </div>
        `,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(`Error sending email: ${error}`);
				} else {
					console.log(`Email sent: ${info.response}`);
				}
			});

			return new ApiResponse(user);
		},
	})
);

router.patch(
	"/update/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
			input: updateUser,
		},
		async handler({ params, input }) {
			try {
				const existingUser = await client.user.findUnique({
					where: {
						id: params.id,
					},
				});

				if (!existingUser) {
					throw new ApiError("Cet utilisateur n'existe pas");
				}

				const updatedUser = await client.user.update({
					where: {
						id: params.id,
					},
					data: input,
				});

				return new ApiResponse({
					success: true,
				});
			} catch (error) {
				console.error("Error:", error);
				return new ApiError(
					"Une erreur s'est produite lors de la mise à jour de l'utilisateur"
				);
			}
		},
	})
);
router.patch(
	"/update/monitor/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
			input: updateMonitor, // Use the updateUser schema for request body validation
		},
		async handler({ params, input }) {
			try {
				// Find the user by ID
				const existingUser = await client.user.findUnique({
					where: {
						id: params.id,
					},
				});

				if (!existingUser) {
					throw new ApiError("Cet utilisateur n'existe pas");
				}

				// Update user information with the validated input
				const updatedUser = await client.user.update({
					where: {
						id: params.id,
					},
					data: {
						...input,
						startDate: input?.startDate
							? new Date(input.startDate)
							: undefined,
					},
				});

				return new ApiResponse({
					success: true,
				});
			} catch (error) {
				// Handle errors, e.g., validation errors or database errors
				return new ApiError(
					"Une erreur s'est produite lors de la mise à jour de l'utilisateur"
				);
			}
		},
	})
);

router.patch(
	"/update/entreprise/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
			input: updateEntreprise, // Use the updateUser schema for request body validation
		},
		async handler({ params, input }) {
			try {
				// Find the user by ID
				const existingUser = await client.user.findUnique({
					where: {
						id: params.id,
					},
				});

				if (!existingUser) {
					throw new ApiError("Cet utilisateur n'existe pas");
				}

				// Update user information with the validated input
				const updatedUser = await client.user.update({
					where: {
						id: params.id,
					},
					data: input,
				});

				return new ApiResponse({
					success: true,
				});
			} catch (error) {
				// Handle errors, e.g., validation errors or database errors
				return new ApiError(
					"Une erreur s'est produite lors de la mise à jour de l'utilisateur"
				);
			}
		},
	})
);

// router.post(
//   "/availability",
//   typed({
//     context: protect(),
//     schemas: {
//       input: z.object({
//         days: z.object({
//           Lundi: daySchema,
//           Mardi: daySchema,
//           Mercredi: daySchema,
//           Jeudi: daySchema,
//           Vendredi: daySchema,
//           Samedi: daySchema,
//           Dimanche: daySchema,
//         }),
//         monitorId: z.string(),
//       }),
//     },
//     async handler({ ctx, input }) {
//       const days = input.days;
//       const daysArray = Object.entries(days).map(([day, value]) => ({
//         day,
//         ...value,
//         monitorId: input.monitorId,
//       }));
//       const promises = await Promise.all(
//         daysArray.map(async (day) => {
//           const availabilityMatch = await client.availability.findFirst({
//             where: {
//               day: day.day,
//               monitor: {
//                 id: day.monitorId,
//               },
//             },
//           });

//           if (!availabilityMatch) {
//             return await client.availability.create({
//               data: {
//                 ...day,
//               },
//             });
//           }
//           const availability = await client.availability.upsert({
//             where: {
//               id: availabilityMatch.id,
//               day: day.day,
//               monitor: {
//                 id: day.monitorId,
//               },
//             },
//             update: {
//               ...day,
//             },
//             create: {
//               ...day,
//             },
//           });

//         })
//       );

//       return new ApiResponse({
//         success: true,
//       });
//     },
//   })
// );

router.post(
	"/availability",
	typed({
		context: protect(),
		schemas: {
			input: z.object({
				days: z.record(daySchema), // Utilisation de z.record pour un objet avec des clés de type string
				monitorId: z.string(),
			}),
		},
		async handler({ ctx, input }) {
			try {
				const { days, monitorId } = input;

				// Convertir les jours en tableau pour le traitement
				const promises = Object.entries(days).map(
					async ([day, value]) => {
						const intervals = value?.interval || []; // Récupérer les intervalles du jour

						const availabilityMatch =
							await client.availability.findFirst({
								where: {
									day,
									monitor: {
										id: monitorId,
									},
								},
							});

						if (!availabilityMatch) {
							// Créer une nouvelle disponibilité si aucune correspondance n'est trouvée
							return client.availability.create({
								data: {
									day,
									intervals,
									monitor: {
										connect: {
											id: monitorId,
										},
									},
								},
							});
						} else {
							// Mettre à jour la disponibilité existante
							return client.availability.update({
								where: {
									id: availabilityMatch.id,
								},
								data: {
									intervals,
								},
							});
						}
					}
				);

				// Attendre que toutes les opérations se terminent
				await Promise.all(promises);

				// Retourner une réponse de succès
				return new ApiResponse({ success: true });
			} catch (error) {
				// console.error("Error handling availability:", error);
				throw new Error("Failed to handle availability");
			}
		},
	})
);

// router.get(
//   "/availability/:monitorId",
//   typed({
//     schemas: {
//       params: z.object({
//         monitorId: z.string(),
//       }),
//     },
//     async handler({ params }) {
//       const availability = await client.availability.findMany({
//         where: {
//           monitor: {
//             id: params.monitorId,
//           },
//         },
//       });
//       return new ApiResponse({
//         success: true,
//         data: availability,
//       });
//     },
//   })
// );

router.get(
	"/availability/:monitorId",
	typed({
		schemas: {
			params: z.object({
				monitorId: z.string(),
			}),
		},
		async handler({ params }) {
			try {
				const { monitorId } = params;

				// Récupérer l'availability en fonction de monitorId
				const availability = await client.availability.findMany({
					where: {
						monitor: {
							id: monitorId,
						},
					},
				});

				// Retourner la réponse avec les données d'availability
				return new ApiResponse({
					success: true,
					data: availability,
				});
			} catch (error) {
				console.error("Error fetching availability:", error);
				throw new Error("Failed to fetch availability");
			}
		},
	})
);

// router.get(
//   "/availability/all",
//   typed({
//     context: protect("ENTREPRISE"),
//     async handler() {
//       const availabilities = await client.availability.findMany(); // Supposons que vous ayez une méthode findMany pour récupérer toutes les disponibilités
//       return new ApiResponse(availabilities);
//     },
//   })
// );

router.get(
	"/get/availability/all",
	typed({
		context: protect("ENTREPRISE"),
		async handler({ ctx }) {
			try {
				const availability = await client.availability.findMany({
					where: {
						monitor: {
							clients: {
								some: {
									owner: {
										id: ctx.id,
									},
								},
							},
						},
					},
					include: {
						monitor: true,
					},
				});
				return new ApiResponse(availability);
			} catch (error) {
				// Gérez les erreurs ici
				console.error("Une erreur est survenue :", error);
				return new ApiResponse({ success: false });
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
			const user = await client.user.findUnique({
				where: { id: params.id },
			});

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
				to: user?.email,
				subject: "Confirmation de la suppression de votre compte",
				text: "Compte supprimé",
				html: `
        <div style="text-align: center;">
          <h1 style="color: #111;">Confirmation de la suppression de votre compte</h1>
          <p class="message">
              Bonjour,<br><br>
              Nous vous confirmons que votre compte a été supprimé avec succès. Nous sommes désolés de vous voir partir.<br><br>
              Si vous avez des questions ou des préoccupations, n'hésitez pas à nous contacter.<br><br>
              Merci de nous avoir donné l'opportunité de vous servir.<br><br>
              Cordialement,<br>
              L'équipe Support
            </p>
             <p class="signature">
              ---
              <br>
              Vous recevez cet email car votre compte a été supprimé.
            </p>
        </div>
      `,
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(`Error sending email: ${error}`);
				} else {
					console.log(`Email sent: ${info.response}`);
				}
			});

			await client.user.delete({ where: { id: params.id } });

			return new ApiResponse({
				success: true,
			});
		},
	})
);

router.delete(
	"/ownership/delete/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			await client.ownership.delete({ where: { id: params.id } });
			return new ApiResponse({
				success: true,
			});
		},
	})
);

// router.post('/unsubscribe', async (req, res) => {
//   const { userId } = req.body; // Assurez-vous que cette opération est sécurisée
//   try {
//     await prisma.user.update({
//       where: { id: userId },
//       data: { isSubscribed: false },
//     });
//     res.json({ success: true, message: "Vous avez été désabonné avec succès." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Erreur lors de la tentative de désabonnement." });
//   }
// });

router.get(
	"/unsubscribe/:id",
	typed({
		schemas: {
			params: z.object({
				id: z.string(),
			}),
		},
		async handler({ params }) {
			const { id } = params;
			try {
				await client.user.update({
					where: { id },
					data: { isSubscribed: false },
				});
				return new ApiResponse({
					message: "Utilisateur désabonné avec succès.",
				});
			} catch (error) {
				throw new ApiError("Erreur lors de la désinscription.");
			}
		},
	})
);

router.get(
	"/:email",
	typed({
		schemas: {
			params: z.object({ email: z.string() }),
		},
		context: protect(),
		async handler({ params }) {
			const user = await client.user.findUnique({
				where: {
					email: params.email,
				},
			});
			if (!user) {
				throw new ApiError("Response not found", 404);
			}
			return new ApiResponse(user);
		},
	})
);

export { router as usersRouter };
