import useSWR from "swr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { fetcher } from "../axios";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { AutoComplete, message, Popconfirm } from "antd";
import EditDayPicker from "./EditDaypicker";
import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import Button from "./Button";
import moment from "moment";
import ExcelJS from "exceljs";

function SuperpositionView() {
	const [filtredSuperpositions, setFiltredSuperpositions] = useState<any[]>(
		[]
	);
	const [searchValue, setSearchValue] = useState<string>("");
	const {
		data: superpositions = [],
		isLoading: loadingSuperpositions,
		error: errorSuperpositions,
		mutate: refetchSuperposition,
	} = useSWR("/disponibilite/get/superposition", async (url) => {
		const superpositions = (await fetcher.get(url)).data as any[];
		setFiltredSuperpositions(superpositions);
		return superpositions;
	});

	useEffect(() => {
		if (searchValue.trim().length > 0) {
			setFiltredSuperpositions(
				superpositions?.filter((superposition) =>
					`${superposition.user.name} ${superposition.user.lastname}`
						.toLowerCase()
						.includes(searchValue.toLowerCase())
				)
			);
		} else {
			setFiltredSuperpositions(superpositions);
		}
	}, [searchValue]);

	if (loadingSuperpositions)
		return (
			<div className="text-center text-xl font-semibold">Loading...</div>
		);
	if (errorSuperpositions)
		return (
			<div className="text-center text-xl text-red-500">
				Error loading data
			</div>
		);

	const handleDeleteEvent = async (eventId: string) => {
		try {
			await fetcher(`/disponibilite/deletes/${eventId}`, {
				method: "delete",
			});
			refetchSuperposition();
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	const handleExport = () => {
		const csvData = filtredSuperpositions.map((superposition) => ({
			Titre: superposition?.titre,
			Pour: `${superposition?.user?.name} ${superposition?.user?.lastname}`,
			Type:
				superposition?.user?.type === "ENTREPRISE"
					? "ENTREPRISE"
					: "collaborateur",
			Commentaire: superposition?.comment,
			"Dates Désactivées":
				superposition?.disabledDates?.length > 1
					? `du ${format(
							new Date(superposition?.disabledDates[0]),
							"PP",
							{ locale: fr }
					  )} au ${format(
							new Date(
								superposition?.disabledDates[
									superposition?.disabledDates?.length - 1
								]
							),
							"PP",
							{ locale: fr }
					  )}`
					: format(new Date(superposition?.disabledDates[0]), "PP", {
							locale: fr,
					  }),
			Justificatif:
				superposition?.file && superposition?.file !== ""
					? `http://localhost:3000/api/images/${superposition?.file}`
					: "Pas de justificatif",
		}));

		const csv = [
			[
				"Titre",
				"Pour",
				"Type",
				"Commentaire",
				"Dates Désactivées",
				"Justificatif",
			],
			...csvData.map((row) => [
				row.Titre,
				row.Pour,
				row.Type,
				row.Commentaire,
				row["Dates Désactivées"],
				row.Justificatif,
			]),
		]
			.map((e) => e.join(","))
			.join("\n");

		const csvWithBom = "\uFEFF" + csv;

		const blob = new Blob([csvWithBom], {
			type: "text/csv;charset=utf-8;",
		});
		saveAs(blob, "superpositions.csv");
	};

	const exportExcelFile = () => {
		const workbook = new ExcelJS.Workbook();
		const sheet = workbook.addWorksheet("Superpositions");

		sheet.getRow(1).font = {
			name: "Arial",
			size: 11,
			bold: true,
		};

		sheet.getRow(1).height = 40;

		sheet.getRow(1).alignment = {
			vertical: "middle",
			horizontal: "center",
		};

		sheet.columns = [
			{
				header: "Titre",
				key: "titre",
				width: 30,
			},
			{
				header: "Pour",
				key: "pour",
				width: 30,
			},
			{
				header: "Commentaire",
				key: "commentaire",
				width: 40,
			},
			{
				header: "Dates Désactivées",
				key: "datesDesactivees",
				width: 30,
			},
			{
				header: "Justificatif",
				key: "justificatif",
				width: 30,
			},
		];

		const promise = Promise.all(
			filtredSuperpositions?.map((superposition) => {
				const pour = `${superposition?.user?.name} ${
					superposition?.user?.lastname
				} (${
					superposition?.user?.type === "ENTREPRISE"
						? superposition?.user?.type
						: "collaborateur"
				})`;

				const datesDesactivees =
					superposition?.disabledDates?.length > 1
						? `du ${moment(superposition?.disabledDates[0]).format(
								"DD/MM/YYYY"
						  )} au ${moment(
								superposition?.disabledDates[
									superposition?.disabledDates.length - 1
								]
						  ).format("DD/MM/YYYY")}`
						: moment(superposition?.disabledDates[0]).format(
								"DD/MM/YYYY"
						  );

				const justificatif =
					superposition?.file && superposition?.file !== ""
						? `http://localhost:3000/api/images/${superposition?.file}`
						: "Pas de justificatif";

				sheet.addRow({
					titre: superposition?.titre,
					pour: pour,
					commentaire: superposition?.comment || "",
					datesDesactivees: datesDesactivees,
					justificatif: justificatif,
				});
			})
		);

		promise.then(() => {
			workbook.xlsx.writeBuffer().then(function (filtredSuperpositions) {
				const blob = new Blob([filtredSuperpositions], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				});
				const url = window.URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = "superpositions.xlsx";
				anchor.click();
				window.URL.revokeObjectURL(url);
			});
		});
	};

	return (
		<div className="min-h-screen py-10">
			<div>
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Absences/Congés.
				</h1>
				<div className="flex items-center justify-between">
					<Button onClick={exportExcelFile}>Export CSV</Button>
					<AutoComplete
						options={superpositions?.reduce(
							(acc, superposition) => {
								const fullName = `${superposition?.user?.name} ${superposition?.user?.lastname}`;
								if (
									!acc.some((item) => item.value === fullName)
								) {
									acc.push({ value: fullName });
								}
								return acc;
							},
							[]
						)}
						onSelect={(value) => setSearchValue(value)}
						onChange={(value) => setSearchValue(value)}
						placeholder="Rechercher par employé"
						filterOption={(inputValue: string, option: any) =>
							option?.value
								.toLowerCase()
								.includes(inputValue.toLowerCase())
						}
						size="large"
						className="w-72"
						allowClear
					/>
				</div>
				{superpositions.length === 0 ? (
					<div className="text-center text-lg text-gray-600 py-5">
						Pas de superpositions disponibles
					</div>
				) : (
					<>
						<div className="mt-3 shadow-sm border rounded-lg overflow-x-auto">
							<table className="w-full table-auto text-sm text-left">
								<thead className="bg-gray-50 text-gray-600 font-medium border-b">
									<tr>
										<th className="py-3 px-6">Titre</th>
										<th className="py-3 px-6">Pour</th>
										<th className="py-3 px-6">
											Commentaire
										</th>
										<th className="py-3 px-6">
											Dates Désactivées
										</th>
										<th className="py-3 px-6">
											Justificatif
										</th>
										<th className="py-3 px-6">Actions</th>
									</tr>
								</thead>
								<tbody className="text-gray-600 divide-y">
									{filtredSuperpositions?.map(
										(superposition, idx) => (
											<tr key={idx}>
												<td className="px-6 py-4 whitespace-nowrap">
													{superposition?.titre}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className="font-semibold lowercase">
														{`${superposition?.user?.name} ${superposition?.user?.lastname}`}
													</span>{" "}
													<span className="lowercase">
														(
														{superposition?.user
															?.type ===
														"ENTREPRISE"
															? superposition
																	?.user?.type
															: "collaborateur"}
														)
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{superposition?.comment}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{superposition
														?.disabledDates
														?.length > 1
														? "du " +
														  format(
																new Date(
																	superposition?.disabledDates[0]
																),
																"PP",
																{ locale: fr }
														  ) +
														  " au " +
														  format(
																new Date(
																	superposition?.disabledDates[
																		superposition
																			?.disabledDates
																			?.length -
																			1
																	]
																),
																"PP",
																{ locale: fr }
														  )
														: format(
																new Date(
																	superposition?.disabledDates[0]
																),
																"PP",
																{ locale: fr }
														  )}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													{superposition?.file &&
													superposition?.file !==
														"" ? (
														<a
															href={`http://localhost:3000/api/images/${superposition?.file}`}
															target="_blank"
														>
															Voir
														</a>
													) : (
														"Pas de justificatif"
													)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
													<EditDayPicker
														id={superposition?.id}
													/>
													<Popconfirm
														title="Supprimer"
														description="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?"
														onConfirm={() => {
															handleDeleteEvent(
																superposition?.id
															);
															message.success(
																"Rendez-vous supprimé avec succès"
															);
														}}
														onCancel={(e) => {
															e?.stopPropagation();
														}}
														icon={
															<QuestionCircleOutlined
																style={{
																	color: "red",
																}}
															/>
														}
														okText="Oui"
														okType="danger"
														cancelText="Non"
													>
														<button
															onClick={(e) =>
																e.stopPropagation()
															}
															className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
														>
															supprimer
														</button>
													</Popconfirm>
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default SuperpositionView;

{
	/* <div className="bg-white shadow-md rounded-lg overflow-hidden">
	<table className="min-w-full bg-white">
		<thead>
			<tr>
				<th className="py-2 px-4 bg-gray-100 font-semibold text-gray-700 text-center">
					Titre
				</th>
				<th className="py-2 px-4 bg-gray-100 font-semibold text-gray-700 text-center">
					Pour
				</th>
				<th className="py-2 px-4 bg-gray-100 font-semibold text-gray-700 text-center">
					{" "}
					Dates Désactivées
				</th>
				<th className="py-2 px-4 bg-gray-100 font-semibold text-gray-700 text-center">
					Supprimé
				</th>
				<th className="py-2 px-4 bg-gray-100 font-semibold text-gray-700 text-center">
					Modifier
				</th>
			</tr>
		</thead>
		<tbody>
			{superpositions.map((superposition) => (
				<tr key={superposition.id} className="border-t">
					<td className="py-2 px-4 text-center">
						{superposition.titre}
					</td>
					<td className="py-2 px-4 text-center">
						<span className="font-semibold lowercase">
							{superposition.user.name}
						</span>{" "}
						<span className="lowercase">
							(
							{superposition.user.type === "ENTREPRISE"
								? superposition.user.type
								: "collaborateur"}
							)
						</span>
					</td>
					<td className="py-2 px-4 text-center">
						{superposition.disabledDates.length > 1
							? "du " +
							  format(
									new Date(superposition.disabledDates[0]),
									"PP",
									{ locale: fr }
							  ) +
							  " au " +
							  format(
									new Date(
										superposition.disabledDates[
											superposition.disabledDates.length -
												1
										]
									),
									"PP",
									{ locale: fr }
							  )
							: format(
									new Date(superposition.disabledDates[0]),
									"PP",
									{ locale: fr }
							  )}
					</td>
					<td className="py-2 px-4 text-center">
						<Popconfirm
							title="Supprimer"
							description="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?"
							onConfirm={() => {
								handleDeleteEvent(superposition.id);
								message.success(
									"Rendez-vous supprimé avec succès"
								);
							}}
							onCancel={(e) => {
								e?.stopPropagation(); // Stop click event from propagating to parent elements
							}}
							icon={
								<QuestionCircleOutlined
									style={{
										color: "red",
									}}
								/>
							}
							okText={<span className="text-white">Oui</span>}
							cancelText="Non"
						>
							<FontAwesomeIcon
								icon={faTrash}
								className="order-2 text-red-500 cursor-pointer hover:text-red-600 "
								onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the parent elements
							/>
						</Popconfirm>
					</td>

					<td className="py-2 px-4 text-center">
						<EditDayPicker id={superposition.id} />
					</td>
				</tr>
			))}
		</tbody>
	</table>
</div>; */
}
