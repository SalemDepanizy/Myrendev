import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { createDalayedRendezvous } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { protect } from "@/lib/protect";
import nodemailer from "nodemailer";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post(
  "/create",

  typed({
    context: protect(),
    schemas: { input: createDalayedRendezvous },
    async handler({ input, ctx }) {
      try {
        const { images, ...rest } = input;

        console.log("input", input);
        const rendezvousWithoutImages = await client.delayedRendezVous.create({
          data: {
            title: rest.title,
            relationKey: input.relationKey,
            //   dateTime: rest.dateTime,

            description: rest.description,
            //   creneau: creneau,
            client: {
              connect: {
                id: rest.clientId,
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

        return new ApiResponse(rendezvousWithoutImages);
      } catch (error) {
        console.error("Error creating rendezvous:", error);
        throw new ApiError("An error occurred while creating the rendezvous");
      }
    },
  })
);
router.get(
  "/all",
  typed({
    context: protect("ENTREPRISE"),
    async handler({ ctx, params, input }) {
      const rendezvous = await client.delayedRendezVous.findMany({
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
          images: true, // Include images
        },
      });
      return new ApiResponse(rendezvous);
    },
  })
);

export { router as delayedRendezvousRouter };
