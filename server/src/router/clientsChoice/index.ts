import { ApiError, ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { confirmSlotSchema } from "./schema";
import { client } from "@/prisma";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

// Slot confirmation route
router.post(
  "/confirm-slot",
  typed({
    schemas: {
      input: confirmSlotSchema,
    },
    async handler({ input }) {
      const { token, userId, confirmedDate, confirmedTime, relationKey } = input;

      // Create a new confirmed slot
      const confirmedSlot = await prisma.confirmedSlot.create({
        data: {
          userId,
          confirmedDate,
          confirmedTime,
          relationKey,
        },
      });

      // Mark the slot as confirmed in the Token table
      await prisma.token.update({
        where: { token },
        data: { slotConfirmed: true },
      });

      return new ApiResponse(confirmedSlot);
    },
  })
);

router.get("/user/by-email", async (req, res) => {
  // Extract email query parameter and ensure it's a string
  const email =
    typeof req.query.email === "string" ? req.query.email : undefined;

  if (!email) {
    // If email is not a string or is missing, return an error response
    return res
      .status(400)
      .json({ message: "Invalid or missing email parameter" });
  }

  try {
    const user = await client.user.findUnique({
      where: { email },
      select: { id: true }, // Only return the user ID
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get(
  "/get/all",
  typed({
    async handler(props) {
      try {
        const choiceClient = await client.choiceClient.findMany();
        return new ApiResponse(choiceClient);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des superpositions :",
          error
        );
        return new ApiResponse(
          { error: "Erreur lors de la récupération des superpositions." },
          500
        );
      }
    },
  })
);
router.get(
  "/get/confirmed/all",
  typed({
    async handler(props) {
      try {
        const confirmedSlot = await client.confirmedSlot.findMany();
        return new ApiResponse(confirmedSlot);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des superpositions :",
          error
        );
        return new ApiResponse(
          { error: "Erreur lors de la récupération des superpositions." },
          500
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
      await client.rendezVous.delete({ where: { id: params.id } });
      return new ApiResponse({
        success: true,
      });
    },
  })
);

export { router as clientChoiceRouter };
