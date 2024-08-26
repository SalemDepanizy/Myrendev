import { Router } from "express";
import { client } from "@/prisma";
import { protect } from "@/lib/protect";
import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { z } from "zod";
import { createSatisfactionResponse } from "./schema";
import jwt from "jsonwebtoken";
import { sendEmails } from "@/lib/email";
import moment from "moment";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const router = Router();

// router.get(
//   "/all",
//   typed({
//     context: protect(),
//     async handler() {
//       const satisfactionResponse = await client.satisfactionReponse.findMany({
//         include: {
//           satisfaction: true, // Replace with the real relation if necessary
//           user: true, // Replace with the real relation if necessary
//         },
//       });
//       return new ApiResponse({ data: satisfactionResponse });
//     },
//   })
// );

// router.get(
//   "/all",
//   typed({
//     context: protect(),
//     async handler() {
//       const satisfactionResponse = await client.satisfactionReponse.findMany({
//         include: {
//           satisfaction: {
//             include: {
//               questions: true, // Assurez-vous que c'est la bonne relation
//             }
//           },
//           user: true, // Replace with the real relation if necessary
//           QuestionNotes: true,
//           rendezVous: true,

//         },
//       });
//       return new ApiResponse({ data: satisfactionResponse });
//     },
//   })
// );

router.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const satisfactionResponse = await client.satisfactionReponse.findMany({
        where: {
          satisfaction: {
            userId: props.ctx.id,
          },
        },
        include: {
          satisfaction: {
            include: {
              questions: true, // Assurez-vous que c'est la bonne relation
            },
          },
          user: true, // Replace with the real relation if necessary
          QuestionNotes: true,
          rendezVous: {
            include: {
              forfait: {
                select: {
                  name: true, // Sélectionne uniquement le nom du forfait
                },
              },
              monitor: true, // Inclut les informations du monitor associé au rendez-vous
            },
          },
        },
      });
      return new ApiResponse({ data: satisfactionResponse });
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
      const satisfactionResponse = await client.satisfactionReponse.findUnique({
        where: { id: params.id },
      });
      if (!satisfactionResponse) {
        throw new ApiError("Response not found", 404);
      }
      return new ApiResponse({ data: satisfactionResponse });
    },
  })
);

// router.post(
//   "/create",
//   typed({
//     schemas: { input: createSatisfactionResponse },
//     async handler({ input }) {
//       const token = input.token;

//       const decoded = jwt.verify(token, process.env.SECRET as string) as {
//         clientId: string;
//         rendezVousId: string;
//         iat: number;
//         exp: number;
//       };

//       const existingTokenUsage = await client.tokenUsage.findUnique({
//         where: { token },
//       });

//       if (!existingTokenUsage || existingTokenUsage.used) {
//         throw new ApiError("Invalid or already used token", 400);
//       }

//       const rendezVousId = decoded.rendezVousId;

//       const satisfactionReponse = await client.satisfactionReponse.create({
//         data: {
//           satisfactionId: input.satisfactionId,
//           comments: input.comments,
//           notegeneral: input.notegeneral,
//           userId: decoded.clientId,
//           QuestionNotes: {
//             createMany: {
//               data: input.questionNotes.map((qn) => ({
//                 questionId: qn.questionId,
//                 note: qn.note,
//               })),
//             },
//           },
//           rendezVousId,
//         },
//       });

//       await client.tokenUsage.update({
//         where: { id: existingTokenUsage.id },
//         data: { used: true, usedAt: new Date() },
//       });

//       return new ApiResponse({ data: satisfactionReponse });
//     },
//   })
// );

router.get(
  "/verify/:token",
  typed({
    schemas: {
      params: z.object({ token: z.string() }),
    },
    async handler({ params }) {
      const { token } = params;

      try {
        // Verify the JWT token to ensure it's valid and extract payload
        const decoded = jwt.verify(token, process.env.SECRET as string);

        // Check if the token exists in the database and has not been used
        const tokenUsage = await client.tokenUsage.findUnique({
          where: { token },
        });

        // if (!tokenUsage) {
        //   throw new ApiError("Token not found", 404);
        // }

        // if (tokenUsage.used) {
        //   throw new ApiError("Token already used", 400);
        // }
        return new ApiResponse({ tokenUsage });
        // If everything checks out, return a success response
        // return new ApiResponse({
        //   data: { message: "Token is valid and not used" },
        // });
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          throw new ApiError("Invalid token", 400);
        }
        // Re-throw any other unexpected errors
        throw error;
      }
    },
  })
);

router.delete(
  "/delete/:id",
  typed({
    schemas: {
      params: z.object({ id: z.string() }),
    },
    context: protect(),
    async handler({ params }) {
      const satisfactionReponse = await client.satisfactionReponse.delete({
        where: { id: params.id },
      });
      if (!satisfactionReponse) {
        throw new ApiError("Response not found or already deleted", 404);
      }
      return new ApiResponse({ data: satisfactionReponse });
    },
  })
);

// router.post('/emails-to-entreprise', async (req, res) => {
//   try {
//     const satisfactionReponse = await client.satisfactionReponse.findUnique({
//       where: { id: 'club5bcw5000kjr91bfeumzx3' },
//       include: {
//         rendezVous: {
//           include: {
//             client: true,
//             forfait: true,
//             user: true,
//           },
//         },
//       },
//     });

//     // Check if rendezVous is not null before proceeding
//     if (!satisfactionReponse) {
//       return res.status(404).json({ message: "Rendez-vous not found." });
//     }

//     const nameEntreprise = satisfactionReponse.rendezVous.user?.name_entreprise;

//     sendEmails({
//       email: satisfactionReponse.rendezVous.user?.email,
//       subject: "INFOS CLIENTS !",
//       content: `
//         <div style="text-align: center;">
//           <img src="https://myrendev.com/assets/logo-7522835c.png" alt="Logo" style="max-width: 200px;">
//           <h1>Bonjour ${nameEntreprise}, </h1>
//           <p> Nous vous informons que nous avons reçu le retour de votre Client(e) <strong> ${satisfactionReponse.rendezVous.client.name} </strong>, concernant l'intervention <strong> ${satisfactionReponse.rendezVous.forfait?.name} </strong>,  Nous tenions à vous dire que ce retour est disponible sur la plateforme <strong> MyRendev </strong>.</p>
//         </div>
//       `,
//     });

//     res.status(200).json({ message: "Les e-mails ont été envoyés avec succès." });
//   } catch (error) {
//     console.error("Une erreur est survenue :", error);
//     res.status(500).json({ error: "Une erreur est survenue lors de l'envoi des e-mails." });
//   }
// });

router.post(
  "/create",
  typed({
    schemas: { input: createSatisfactionResponse },
    async handler({ input }) {
      const token = input.token;
      const decoded = jwt.verify(token, process.env.SECRET as string) as {
        clientId: string;
        rendezVousId: string;
        iat: number;
        exp: number;
      };

      const existingTokenUsage = await client.tokenUsage.findUnique({
        where: { token },
      });

      if (!existingTokenUsage || existingTokenUsage.used) {
        throw new ApiError("Invalid or already used token", 400);
      }

      const satisfactionResponse = await client.satisfactionReponse.create({
        data: {
          satisfactionId: input.satisfactionId,
          comments: input.comments,
          notegeneral: input.notegeneral,
          userId: decoded.clientId,
          QuestionNotes: {
            createMany: {
              data: input.questionNotes.map((qn) => ({
                questionId: qn.questionId,
                note: qn.note,
              })),
            },
          },
          rendezVousId: decoded.rendezVousId,
        },
      });

      // Mettre à jour l'utilisation du token
      await client.tokenUsage.update({
        where: { id: existingTokenUsage.id },
        data: { used: true, usedAt: new Date() },
      });

      // Envoyer un e-mail après la création
      await sendEmailsAfterCreation(satisfactionResponse.id);

      return new ApiResponse({ data: satisfactionResponse });
    },
  })
);

async function sendEmailsAfterCreation(satisfactionResponseId: string) {
  const satisfactionResponse = await client.satisfactionReponse.findUnique({
    where: { id: satisfactionResponseId },
    include: {
      rendezVous: {
        include: {
          client: true,
          forfait: true,
          user: true,
          monitor: true,
        },
      },
    },
  });

  if (!satisfactionResponse) {
    console.error("SatisfactionResponse not found.");
    return;
  }

  const nameEntreprise = satisfactionResponse.rendezVous.user?.name_entreprise;
  const nameClient = satisfactionResponse.rendezVous.client.name;
  const nameIntervention = satisfactionResponse.rendezVous.forfait?.name;
  const NameEmploye = satisfactionResponse.rendezVous.monitor?.name;
  const dateTime = satisfactionResponse.rendezVous.dateTime;
  const formattedDate = dateTime
    ? format(
        typeof dateTime === "string" ? parseISO(dateTime) : dateTime,
        "dd MMM yyyy",
        { locale: fr }
      )
    : "Default Value or Operation";

  sendEmails({
    email: satisfactionResponse.rendezVous.user?.email,
    subject: "INFOS CLIENTS !",
    content: `
          <div style="text-align: center;">
              <img src="https://myrendev.com/Images/logo.png" alt="Logo" style="max-width: 200px;">
              <h1>Bonjour ${nameEntreprise},</h1>
              <p>Nous vous informons que nous avez reçu le retour de votre Client(e) <strong>  ${nameClient}</strong>, concernant l'intervention <strong>${nameIntervention} </strong>, du  <storng> ${formattedDate} </storng> . réalisée par  <strong> Mr. ${NameEmploye} </strong>. </p>
              <p>Nous tenions à vous dire que votre client(e) <strong> Mr ${nameClient} </strong > , a attribué une note moyenne de  <strong> ${satisfactionResponse.notegeneral.toFixed(1)}/5 </strong> sur l'intervention . Si vous souhaitez en savoir plus, n'hésitez pas à consulter la plateforme. <strong>MyRendev</strong>.</p>
          </div>  
      `,
  });
}

export { router as satisfactionReponseRouter };
