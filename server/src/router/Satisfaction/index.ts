import { protect } from "@/lib/protect";
import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { client } from "@/prisma";
import { Router } from "express";
import { z } from "zod";
import { createSatisfaction, updateSatisfaction } from "./schema";
import jwt from "jsonwebtoken";
const router = Router();

// router.get(
//   "/all",
//   typed({
//     context: protect(),
//     async handler(props) {
//       const satisfactions = await client.satisfaction.findMany({
//         include: {
//           questions: true,

//           // RendezVous: true,
//         },
//       });

//       console.log("Satisfactions:", satisfactions);
//       return new ApiResponse({ data: satisfactions, test: "test" });
//     },
//   })
// );

router.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const satisfactions = await client.user.findUnique({
        where: {
          id: props.ctx.id,
        },
        select: {
          Satisfaction: {
            include: {
              questions: true,
              satisfactionReponse: true, // Inclure les questions liées
            },
          },
        },
      });
      return new ApiResponse({ data: satisfactions });
    },
  })
);

router.get(
  "/clientSatifaction",
  typed({
    async handler(props) {
      const token = props.req.query.token as string;

      if (!token) {
        throw new ApiError("Token manquant", 400);
      }

      // decode token using jsonwebtoken
      const decoded = jwt.verify(token, process.env.SECRET!) as {
        clientId: string;
        rendezVousId: string;
        iat: number;
        exp: number;
      };

      if (!decoded?.clientId || !decoded?.rendezVousId) {
        throw new ApiError("Token invalide", 400);
      }

      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZW5kZXpWb3VzSWQiOiJjbHRsYWN1eGowMDE0ODJ5ZDI3YnJscnN4IiwiY2xpZW50SWQiOiJjbHRsOWx6d3QwMDBnODJ5ZGFoNWl6ajFxIiwiaWF0IjoxNzEwMDYxNzYxLCJleHAiOjE3MTAxNDgxNjF9.YeLKMn-PjXrEJEVY_GNK3_-xRPfrCBGAeES7Q9klNDM

      const ownership = await client.ownership.findFirst({
        where: {
          userId: decoded.clientId,
        },
      });

      const satisfactions = await client.user.findUnique({
        where: {
          id: ownership?.ownerId,
        },
        select: {
          Satisfaction: {
            include: {
              questions: true,
              satisfactionReponse: true, // Inclure les questions liées
            },
          },
        },
      });
      return new ApiResponse({ data: satisfactions });
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
    async handler({ params }) {
      try {
        const satisfaction = await client.satisfaction.findUnique({
          where: {
            id: params.id,
          },
          include: {
            questions: true, // Inclure les questions liées
            // RendezVous: true,
          },
        });
        if (!satisfaction) {
          throw new ApiError("Ce formulaire de satisfaction n'existe pas");
        }
        return new ApiResponse(satisfaction);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du formulaire de satisfaction:",
          error
        );
        throw new ApiError("Erreur interne du serveur", 500);
      }
    },
  })
);

router.post(
  "/create",
  typed({
    schemas: { input: createSatisfaction },
    context: protect(),
    async handler({ input, ctx }) {
      try {
        console.log("Received data for satisfaction creation:", input);

        // Créer une satisfaction sans les questions
        const satisfaction = await client.satisfaction.create({
          data: {
            title: input.title,
            redirect_url: input.redirect_url,
            redirect_grade: input.redirect_grade,
            comment: input.comment,
            // RendezVous: {
            //   connect: {
            //     id: input.rendezvous_id,
            //   },
            // },
            user: {
              connect: {
                id: ctx.id,
              },
            },
          },
        });

        // Créer chaque question associée à la satisfaction
        await Promise.all(
          input.questions.map(async (question) => {
            await client.question.create({
              data: {
                text: question.text,
                rating: question.rating,
                satisfaction: {
                  connect: {
                    id: satisfaction.id,
                  },
                },
              },
            });
          })
        );

        console.log("Satisfaction created with questions:", satisfaction);
        return new ApiResponse({ data: satisfaction });
      } catch (error) {
        console.error("Error during satisfaction creation:", error);
        return new ApiError(
          "Une erreur s'est produite lors de la création du formulaire de satisfaction"
        );
      }
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
      input: updateSatisfaction, // Utilisez le schéma updateSatisfaction pour la validation de la requête
    },
    context: protect(),
    async handler({ params, input, ctx }) {
      console.log("ID pour mise à jour:", params.id);
      console.log("Données reçues pour mise à jour:", input);
      try {
        const existingSatisfaction = await client.satisfaction.findUnique({
          where: {
            id: params.id,
            userId: ctx.id,
          },
        });

        if (!existingSatisfaction) {
          throw new ApiError("Ce formulaire de satisfaction n'existe pas");
        }

        const questionsUpdate = input.questions
          ? input.questions.map((question) => ({
              text: question.text!, // Consider adding checks or fallbacks for `question.text` and `question.rating` if they can be undefined
              rating: question.rating!,
            }))
          : [];

        const updatedSatisfaction = await client.satisfaction.update({
          where: {
            id: params.id,
          },
          data: {
            title: input.title,
            redirect_url: input.redirect_url,
            redirect_grade: input.redirect_grade,
            comment: input.comment,
            userId: input.userId,
            questions: {
              deleteMany: {},
              create: questionsUpdate,
            },
          },
        });

        return new ApiResponse({
          data: updatedSatisfaction,
          message: "La satisfaction a été mise à jour avec succès",
        });
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la satisfaction:",
          error
        );
        return new ApiError(
          "Une erreur s'est produite lors de la mise à jour du formulaire de satisfaction"
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

    async handler({ params, ctx }) {
      try {
        await client.question.deleteMany({
          where: {
            satisfactionId: params.id,
          },
        });

        await client.satisfaction.delete({
          where: {
            id: params.id,
          },
        });

        return new ApiResponse({
          message: "Le formulaire de satisfaction a été supprimé avec succès",
        });
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du formulaire de satisfaction:",
          error
        );
        return new ApiResponse({ message: "Erreur interne du serveur" }, 500);
      }
    },
  })
);

export { router as satisfactiontRouter };
