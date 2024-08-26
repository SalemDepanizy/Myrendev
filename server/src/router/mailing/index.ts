import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router, application } from "express";
import { client } from "@/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";
import path, { extname } from "path";
import { protect } from "@/lib/protect";
import { title } from "process";
const { v4: uuidv4 } = require("uuid");

const router = Router();
const multer = require("multer");
const upload = multer();

// // Configurer Multer pour accepter uniquement les fichiers PDF
// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, callback) => {
//     const ext = extname(file.originalname);
//     if (ext !== ".pdf") {
//       return callback(new Error("Seuls les fichiers PDF sont autorisés"));
//     }
//     callback(null, true);
//   },
// });

router.post(
	"/personalize-email",
	upload.array("files"), // Multer middleware to handle file uploads
	typed({
		schemas: {
			input: z.object({
				email: z.string().email().optional(),
				value: z.string().email().optional(),
				objets: z.string(),
				messages: z.string(),
				manualRecipient1: z.string().email().optional(),
				manualRecipient2: z.string().email().optional(),
				manualRecipient3: z.string().email().optional(),
				manualRecipient4: z.string().email().optional(),
				manualRecipient5: z.string().email().optional(),
			}),
		},
		async handler({ input, req }) {
			const {
				email,
				objets,
				messages,
				manualRecipient1,
				manualRecipient2,
				manualRecipient3,
				manualRecipient4,
				manualRecipient5,
				value,
			} = input;
			const files = req.files as Express.Multer.File[]; // Get uploaded files

			try {
				const existingUser = await client.user.findUnique({
					where: {
						email,
					},
				});

				if (!existingUser) {
					throw new ApiError("Utilisateur non trouvé");
				}

				const smtpConfig = {
					host: "smtp.ionos.fr",
					port: 465,
					secure: true,
					auth: {
						user: "ne-pas-repondre@myrendev.com",
						pass: "Liamedia2608150155@",
					},
				};
				const ccRecipients = [
					manualRecipient1,
					manualRecipient2,
					manualRecipient3,
					manualRecipient4,
					manualRecipient5,
				]
					.filter(Boolean)
					.join(",");

				const transporter = nodemailer.createTransport(smtpConfig);

				const mailOptions: nodemailer.SendMailOptions = {
					from: "ne-pas-repondre@myrendev.com",
					to: email,
					cc: ccRecipients,
					subject: objets,
					text: messages,
					html: `
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
              <h1 style="color: #111;"></h1>
              <p>${messages} </p>
              <strong>MyRendev</strong>. .
            </div>
          `,
				};

				if (files && files.length > 0) {
					mailOptions.attachments = files.map(
						(file: Express.Multer.File) => ({
							filename: file.originalname,
							content: file.buffer,
						})
					);
				}

				const info = await transporter.sendMail(mailOptions);

				console.log("Message sent: %s", info.messageId);

				return new ApiResponse({
					messages: "Email envoyé avec succès",
				});
			} catch (error) {
				console.error("Erreur lors de l'envoi de l'e-mail:", error);
				throw new ApiError(
					"Une erreur s'est produite lors de l'envoi de l'e-mail"
				);
			}
		},
	})
);

router.post(
	"/users-mail",
	upload.array("files"),
	typed({
		schemas: {
			input: z.object({
				title: z.string(),
				email: z.string().email(),
				messages: z.array(z.string()),
				token: z.string().optional(),
			}),
		},
		context: protect(),
		async handler({ input, ctx, req }) {
			const { title, email, messages, token } = input;
			const files = req.files as Express.Multer.File[]; // Explicitly assert the type
			const tokenToken = token || "";

			const convertToFrenchDate = (isoDate: string) => {
				const date = new Date(isoDate);
				return date.toLocaleDateString("fr-FR", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
			};

			const existingEntry = await client.superposition.findMany({
				where: {
					reqToken: token,
				},
			});

			const frenchDates = messages.map(convertToFrenchDate);

			try {
				const existingUser = await client.user.findUnique({
					where: {
						email,
					},
				});
				if (!existingUser) {
					throw new ApiError("Utilisateur non trouvé");
				}

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

				function encrypt(text: string) {
					return btoa(text);
				}

				const dates = messages.join(",");
				const encryptedDates = encrypt(dates);
				const id = ctx.id;
				const encryptedId = encrypt(id);
				const encryptedToken = encrypt(tokenToken);
				const encryptedTitle = encrypt(title);
				const baseUrl = `${process.env.APP_URL}disponibilite`;

				const expireTime = new Date();
				expireTime.setMinutes(expireTime.getMinutes() + 1); // Expiry set to 5 minutes from now
				const timestamp = Math.floor(expireTime.getTime() / 1000); // Convert to UNIX timestamp

				const url = `${baseUrl}?dates=${encryptedDates}&id=${encryptedId}&title=${encryptedTitle}&timestamp=${timestamp}&token=${encryptedToken}`;

				const mailOptions: nodemailer.SendMailOptions = {
					from: "ne-pas-repondre@myrendev.com",
					to: existingUser.email, // Use the user's email dynamically
					subject: "Jour de congés",
					html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #111;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 100px; margin-bottom: 20px;">
              <h1 style="color: #333;">Notification de Congé</h1>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Voici les dates de congés demandées :
              </p>              
              <ul style="list-style-type: none; padding: 0;">
                ${frenchDates
					.map(
						(message) =>
							`<li style="margin: 10px 0; font-size: 16px; color: #333;">${message}</li>`
					)
					.join("")}
              </ul>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Merci de vérifier et confirmer ces dates.
              </p>
              <a href="${url}">Cliquez ici pour accéder à votre formulaire</a>
              <p style="font-size: 16px; line-height: 1.5; color: #555;">
                Cordialement,<br>
                <strong>MyRendev</strong>
              </p>
              <div style="margin-top: 20px; font-size: 12px; color: #aaa;">
                <p>
                  Ceci est un email automatique, merci de ne pas y répondre.
                </p>
              </div>
            </div>
          `,
				};

				if (files && files.length > 0) {
					mailOptions.attachments = files.map(
						(file: Express.Multer.File) => ({
							filename: file.originalname,
							content: file.buffer,
						})
					);
				}

				const info = await transporter.sendMail(mailOptions);

				return new ApiResponse({
					messages: "Email envoyé avec succès",
				});
			} catch (error) {
				console.error("Erreur lors de l'envoi de l'e-mail:", error);
				throw new ApiError(
					"Une erreur s'est produite lors de l'envoi de l'e-mail"
				);
			}
		},
	})
);

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

// router.get('/disponibilite', async (req, res) => {
//   const { id } = req.query;

//   if (typeof id !== 'string') {
//     return res.status(400).send('Paramètre id invalide');
//   }

//   try {
//     const link = await client.link.findUnique({
//       where: { id },
//     });

//     if (!link) {
//       return res.status(404).send('Lien invalide');
//     }

//     if (link.isUsed) {
//       return res.status(400).send('Lien déjà utilisé');
//     }

//     // Marquer le lien comme utilisé
//     await client.link.update({
//       where: { id },
//       data: { isUsed: true },
//     });

//     // Renvoyer les informations nécessaires pour l'utilisateur
//     res.send('Lien validé, merci de votre confirmation.');
//   } catch (error) {
//     console.error('Erreur lors de la validation du lien:', error);
//     res.status(500).send("Une erreur s'est produite lors de la validation du lien");
//   }
// });

router.post(
	"/contacteznous",
	typed({
		schemas: {
			input: z.object({
				subject: z.string().nonempty(),
				name: z.string().nonempty(),
				email: z.string().email(),
				phoneNumber: z.string().nonempty(),
				message: z.string().nonempty(),
			}),
		},
		async handler({ input }) {
			const { subject, name, email, phoneNumber, message } = input;

			try {
				// Your SMTP configuration
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

				const mailOptions = {
					from: "ne-pas-repondre@myrendev.com",
					to: "contact@myrendev.com", // Your email address here
					subject: `Message from ${name}: ${subject} (${phoneNumber})`,
					text: `Nom Complet: ${name}\nNuméro de téléphone: ${phoneNumber}\nEmail: ${email}\n\nMessage:\n${message}`,
				};

				const info = await transporter.sendMail(mailOptions);

				return new ApiResponse({
					messages: "Email envoyé avec succès",
				});
			} catch (error) {
				console.error("Erreur lors de l'envoi de l'e-mail:", error);
				throw new ApiError(
					"Une erreur s'est produite lors de l'envoi de l'e-mail"
				);
			}
		},
	})
);

// // Route to create a notification
// router.post(
//   "/notifications",
//   typed({
//     schemas: {
//       input: z.object({
//         message: z.string().nonempty(),
//         userId: z.string().nonempty(),
//       }),
//     },
//     async handler({ input }) {
//       const { message, userId } = input;

//       try {
//         const notification = await client.notification.create({
//           data: {
//             message,
//             userId,
//           },
//         });

//         return new ApiResponse({
//           message: "Notification created successfully",
//           notification,
//         });
//       } catch (error) {
//         console.error("Error creating notification:", error);
//         throw new ApiError("An error occurred while creating the notification");
//       }
//     },
//   })
// );

// // Route to mark a notification as read
// router.patch(
//   "/notifications/:id/read",
//   typed({
//     schemas: {
//       input: z.object({}),
//       params: z.object({
//         id: z.string().nonempty(),
//       }),
//     },
//     async handler({ params }) {
//       const { id } = params;

//       try {
//         const notification = await client.notification.update({
//           where: { id },
//           data: { read: true },
//         });

//         return new ApiResponse({
//           message: "Notification marked as read",
//           notification,
//         });
//       } catch (error) {
//         console.error("Error marking notification as read:", error);
//         throw new ApiError(
//           "An error occurred while marking the notification as read"
//         );
//       }
//     },
//   })
// );

// // Route to get notifications for a user
// router.get(
//   "/users/:userId/notifications",
//   typed({
//     schemas: {
//       params: z.object({
//         userId: z.string().nonempty(),
//       }),
//     },
//     async handler({ params }) {
//       const { userId } = params;

//       try {
//         const notifications = await client.notification.findMany({
//           where: { userId },
//           orderBy: { createdAt: "desc" },
//         });

//         return new ApiResponse({
//           message: "Notifications retrieved successfully",
//           notifications,
//         });
//       } catch (error) {
//         console.error("Error retrieving notifications:", error);
//         throw new ApiError("An error occurred while retrieving notifications");
//       }
//     },
//   })
// );

export { router as emailRouter };
