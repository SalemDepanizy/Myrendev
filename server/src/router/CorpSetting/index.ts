import { ApiResponse, typed } from "@/lib/typed";
import { Router } from "express";
import { createCorpSetting } from "./schema";
import { client } from "@/prisma";
import { protect } from "@/lib/protect";

const router = Router();

router.post(
	"/create",
	typed({
		context: protect(),
		schemas: {
			input: createCorpSetting,
		},
		async handler({ input, ctx }) {
			try {
				const {
					corpData,
					dayMoment,
					maxSlots,
					corpId,
					confirmationChoice,
					numberDays,
					numberWeeks,
				} = input;

				const corpDataOrDefault = corpData ?? 0;
				const dayMomentOrDefault = dayMoment ?? "all";
				const maxSlotsOrDefault = maxSlots ?? 0;
				const id = corpId ?? ctx.id;
				const confirm = confirmationChoice ?? false;
				const numberDaysOrDefault = numberDays ?? 0;
				const numberWeeksOrDefault = numberWeeks ?? 0;

				await client.corpSetting.deleteMany({
					where: { corpId: id },
				});

				const CorpSetting = await client.corpSetting.create({
					data: {
						corpData: corpDataOrDefault,
						dayMoment: dayMomentOrDefault,
						maxSlots: maxSlotsOrDefault,
						corpId: id,
						confirmationChoice: confirm,
						numberDays: numberDaysOrDefault,
						numberWeeks: numberWeeksOrDefault,
					},
				});

				return new ApiResponse(CorpSetting);
			} catch (error) {
				// Gérer les erreurs ici
				console.error(
					"Erreur lors de la création de CorpSetting :",
					error
				);
				throw new Error(
					"Une erreur s'est produite lors de la création de CorpSetting"
				);
			}
		},
	})
);

router.get(
	"/get/corpsetting",
	typed({
		context: protect(),
		async handler({ ctx }) {
			try {
				const CorpSetting = await client.corpSetting.findMany({
					where: { corpId: ctx.id },
				});

				return new ApiResponse(CorpSetting);
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des superpositions :",
					error
				);
				return new ApiResponse(
					{
						error: "Erreur lors de la récupération des superpositions.",
					},
					500
				);
			}
		},
	})
);

export { router as CorpSettingRouter };
