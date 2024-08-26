import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router, application } from "express";
import { client } from "@/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";
import { extname } from "path";

const router = Router();
const multer = require("multer");
const upload = multer();

router.post(
  "/personalize-admin-email",
  upload.array("files"), // Multer middleware to handle file uploads
  typed({
    schemas: {
      input: z.object({
        email: z.string().email(),
        objets: z.string(),
        message: z.string(),
      }),
    },
    async handler({ input, req }) {
      const { email, objets, message } = input;
      const files = req.files as Express.Multer.File[]; // Get uploaded files

      try {
        console.log("value1320:", email);
        console.log("Objets1230:", objets);
        console.log("Message13210:", message);

        const existingUser = await client.user.findUnique({
          where: {
            email,
          },
        });

        if (!existingUser) {
          throw new ApiError("Utilisateur non trouvé");
        }

        const smtpConfig = {
          host: "ssl0.ovh.net",
          port: 465,
          secure: true,
          auth: {
            user: "test@depanizy.com",
            pass: "test123456789",
          },
        };

        const transporter = nodemailer.createTransport(smtpConfig);

        const mailOptions: nodemailer.SendMailOptions = {
          from: "test@depanizy.com",
          to: email,
          subject: objets,
          text: message,
          html: `
            <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 50px;">
              <h1 style="color: #111;"></h1>
              <p>${message} </p>
              <strong>MyRendev</strong>. .
            </div>
          `,
        };

        if (files && files.length > 0) {
          mailOptions.attachments = files.map((file: Express.Multer.File) => ({
            filename: file.originalname,
            content: file.buffer,
          }));
        }

        const info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);

        return new ApiResponse({
          message: "Email envoyé avec succès",
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

export { router as emailAdminRouter };
