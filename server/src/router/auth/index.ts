import { client } from "@/prisma";
import { Router } from "express";
import { createUser } from "../users/schema";
import { ApiError, ApiResponse, typed } from "@/lib/typed";
import * as bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { protect } from "@/lib/protect";
const router = Router();

router.get("/all", async (req, res) => {});
// router.get("/:id", (req, res) => {});
router.post(
	"/login",
	typed({
		schemas: {
			input: z.object({
				email: z.string().email(),
				password: z.string().min(8),
			}),
		},
		async handler({ input }) {
			// Normalize email to lowercase
			const normalizedEmail = input.email.toLowerCase();

			const user = await client.user.findFirst({
				where: {
					email: normalizedEmail, // Use the normalized email
				},
			});

			if (!user) {
				throw new ApiError("Cet utilisateur n'existe pas", 404);
			}

			// Check if the user is active
			if (!user.active) {
				// User is inactive, throw an error
				throw new ApiError("Ce compte utilisateur est désactivé", 403); // 403 Forbidden or another appropriate status code
			}

			if (!(await bcrypt.compare(input.password, user.password ?? ""))) {
				throw new ApiError("Mot de passe incorrect", 404); // It's often a good practice to use the same error message for both incorrect email and password for security reasons
			}

			const token = jwt.sign(
				{
					user: {
						...user,
						image: undefined,
						password: undefined,
					},
				},
				process.env.SECRET ?? "",
				{ expiresIn: "1d" }
			);

			return new ApiResponse({ token });
		},
	})
);

router.post(
	"/verify",
	typed({
		schemas: {
			input: z.object({
				token: z.string(),
			}),
		},
		async handler({ input }) {
			try {
				const payload = await jwt.verify(
					input.token,
					process.env.SECRET ?? ""
				);
				if (typeof payload != "string") {
					return new ApiResponse({ success: true, data: payload });
				} else {
					throw new ApiError("not valid", 401);
				}
			} catch (error) {
				throw new ApiError("not valid", 401);
			}
		},
	})
);

router.get(
	"/me",
	typed({
		context: protect(),
		async handler({ ctx }) {
			return new ApiResponse(
				{
					...ctx,
					password: undefined,
				}
				// {}
			);
		},
	})
);

router.patch("/update/:id", (req, res) => {});
router.delete("/delete", (req, res) => {});

router.patch(
	"/updatePassword",
	typed({
		schemas: {
			input: z.object({
				newPassword: z.string().min(8),
			}),
		},
		context: protect(),
		async handler({ input, ctx }) {
			const user = await client.user.findUnique({
				where: {
					id: ctx.id,
				},
			});
			if (!user) {
				throw new ApiError("Cet utilisateur n'existe pas", 404);
			}
			const password = await bcrypt.hash(input.newPassword, 10);
			const updatedUser = await client.user.update({
				where: {
					id: ctx.id,
				},
				data: {
					password,
				},
			});
			return new ApiResponse(updatedUser);
		},
	})
);

async function verifyPassword(inputPassword: string, userPassword: string) {
	if (!(await bcrypt.compare(inputPassword, userPassword))) {
		throw new ApiError("Mot de passe incorrect", 404); // Utilisez une erreur générique pour la sécurité
	}
}

router.post(
	"/verify-password",
	typed({
		schemas: {
			input: z.object({
				password: z.string(),
			}),
		},
		context: protect(),
		async handler({ input, ctx }) {
			try {
				console.log("ctx.id", ctx.id);
				const user = await client.user.findUnique({
					where: {
						id: ctx.id,
					},
				});
				if (!user) {
					throw new ApiError("Cet utilisateur n'existe pas", 404);
				}

				await verifyPassword(input.password, user.password ?? "");

				// res.status(200).json(new ApiResponse({ message: "Mot de passe vérifié avec succès" }));
				return new ApiResponse(
					{ message: "Mot de passe vérifié avec succès" },
					200
				);
			} catch (error) {
				// res.status(500).json({ error: "Une erreur est survenue lors de la vérification du mot de passe." });
				return new ApiResponse(
					{
						error: "Une erreur est survenue lors de la vérification du mot de passe.",
					},
					500
				);
			}
		},
	})
);

export { router as authRouter };
