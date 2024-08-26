import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { createForfait, updateForfait } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { protect } from "@/lib/protect";

const router = Router();

// router.get(
//   "/all",
//   typed({
//     context: protect(),
//     async handler(props) {
//       const forfait = (
   
//         await client.ownership.findMany({
//           where: {
//             owner: {
//               id: props.ctx.id,
//             },
//           },
//           include: {
//             forfait: true,
//           },
//         })

//       )
//         .map((o) => o.forfait)
//         .filter(Boolean);
//       return new ApiResponse(forfait);
//     },
//   })
// );

router.get(
  "/all",
  typed({
    context: protect(),
    async handler(props) {
      const forfaits = await client.ownership.findMany({
        where: {
          owner: {
            id: props.ctx.id,
          },
        },
        include: {
          forfait: {
            include: {
              monitor: true, // Include monitor
            },
          },
        },
      });

      const forfaitsList = forfaits
        .map((o) => o.forfait)
        .filter(Boolean);

      return new ApiResponse(forfaitsList);
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
    async handler({ params, ctx }) {
      const forfait = await client.forfait.findUnique({
        where: {
          id: params.id,
        },
      });

      // const forfait = await client.ownership.findFirst({
      //   where: {
      //     owner: {
      //       id: ctx.id,
      //     },
      //     forfait: {
      //       id: params.id,
      //     },
      //   },
      //   include: {
      //     forfait: true,
      //   },
      // });
      if (!forfait) {
        throw new ApiError("Ce forfait n'existe pas");
      }

      return new ApiResponse(forfait);
    },
  })
);

router.post(
  "/create",
  typed({
    schemas: { input: createForfait },
    context: protect(),
    async handler({ input, ctx }) {
      try {
        // const forfait = await client.forfait.create({
        //   data: input,
        // });
        const forfait = await client.ownership.create({
          data: {
            owner: {
              connect: {
                id: ctx.id,
              },
            },
            forfait: {
              create: input,
            },
          },
          include: {
            forfait: true,
          },
        });
        return new ApiResponse(forfait);
      } catch (error) {
        console.error("Error during forfait creation:", error);
        return new ApiError(
          "Une erreur s'est produite lors de la création du forfait"
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
      input: updateForfait, // Schéma pour la validation du corps de la requête
    },
    async handler({ params, input }) {
      try {
        // Cherche le forfait par ID
        const existingForfait = await client.forfait.findUnique({
          where: {
            id: params.id,
          },
        });

        if (!existingForfait) {
          throw new ApiError("Ce forfait n'existe pas");
        }

        // Met à jour les informations du forfait avec les données validées
        await client.forfait.update({
          where: {
            id: params.id,
          },
          data: {
            ...input,
            // monitorId: "", // Ajoutez une vérification si c'est nécessaire
          },
        });

        return new ApiResponse({
          success: true,
        });
      } catch (error) {
        // Gère les erreurs, ex: erreurs de validation ou erreurs de base de données
        console.error(error); // Affiche l'erreur pour le débogage
        return new ApiError(
          "Une erreur s'est produite lors de la mise à jour du forfait"
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
      await client.forfait.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true,
      });
    },
  })
);

export { router as forfaitRouter };
