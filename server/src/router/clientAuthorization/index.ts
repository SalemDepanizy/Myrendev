import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { codeConfirmationSchema } from "./schema";
import { codeConfirmationMailSchema } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import { protect } from "@/lib/protect";

const prisma = new PrismaClient();

const router = Router();

router.post(
  "/create-authorization",
  typed({
    schemas: {
      input: codeConfirmationSchema,
    },
    async handler({ input }) {
      const { enterpriseId, clientEmail, secretCode, enterpriseName } = input;
      const secretCode1 = Math.floor(Math.random() * 90000) + 10000;
      const secredcodeString = secretCode1.toString();

      // Create a new confirmed slot
      const codeConfirmation = await prisma.codeConfirmation.create({
        data: {
          enterpriseId,
          clientEmail,
          secretCode: secredcodeString,
        },
      });
      try {
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
          to: clientEmail,
          subject: "Code",
          text: "message",
          html: `
            
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 150px;">
              <h1 style="color: #111;"></h1>
              <p>${"text"} </p>
              <strong>MyRendev</strong>. .
              <h1>${enterpriseName} Souhaite-vous ajouter à sa liste de clients</h1>
              <h2>voici votre code de confirmation</h2>
              <span>${secretCode1}</span>
              <p>donner ce code à l'entreprise pour finaliser la procédure</p>
            </div>
          
            `,
        };
        const info = await transporter.sendMail(mailOptions);
        return new ApiResponse({
          message: "Email envoyé avec succès",
          codeConfirmation,
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail:", error);
        throw new ApiError(
          "Une erreur s'est produite lors de l'envoi de l'e-mail"
        );
      }

      // return new ApiResponse(codeConfirmation);
    },
  })
);

router.get(
  "/:id",
  typed({
    schemas: {
      params: z.object({ id: z.string() }),
    },
    context: protect(),
    async handler({ params }) {
      const codeConfirmation = await client.codeConfirmation.findMany({
        where: { enterpriseId: params.id },
      });
      if (!codeConfirmation) {
        throw new ApiError("Response not found", 404);
      }
      return new ApiResponse(codeConfirmation);
    },
  })
);

export { router as clientAuthorizationRouter };
