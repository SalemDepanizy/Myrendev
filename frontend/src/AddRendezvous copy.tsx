import React, { useState } from "react";
import { FaCalendarAlt, FaUsers, FaEye, FaEyeSlash } from "react-icons/fa";
import { useModal } from "./components/modal";
import useSWR from "swr";
import { fetcher } from "./axios";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { Calendar, Popover } from "antd"; // Import the Calendar component
import type { Dayjs } from "dayjs";
import type { CalendarProps } from "antd";
import { PickerLocale } from "antd/lib/date-picker/generatePicker";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "./components/Button";

interface Student {
	id: number;
	name: string;
	lastname: string;
}

interface Monitor {
	id: number;
	name: string;
	lastname: string;
}

interface Vehicule {
	id: number;
	vehicleBrand: string;
	vehiculeType: string;
}

const customFrLocale: PickerLocale = {
	lang: {
		locale: "fr",
		placeholder: "Sélectionnez la date",
		rangePlaceholder: ["Date de début", "Date de fin"],
		today: "Aujourd'hui",
		now: "Maintenant",
		backToToday: "Retour à aujourd'hui",
		ok: "Ok",
		clear: "Effacer",
		month: "Mois",
		year: "Année",
		timeSelect: "Sélectionner l'heure",
		dateSelect: "Sélectionner la date",
		monthSelect: "Choisissez un mois",
		yearSelect: "Choisissez une année",
		decadeSelect: "Choisissez une décennie",
		yearFormat: "YYYY",
		dateFormat: "DD/MM/YYYY",
		dayFormat: "DD",
		dateTimeFormat: "DD/MM/YYYY HH:mm:ss",
		monthFormat: "MMMM",
		monthBeforeYear: true,
		previousMonth: "Mois précédent",
		nextMonth: "Mois suivant",
		previousYear: "Année précédente",
		nextYear: "Année suivante",
		previousDecade: "Décennie précédente",
		nextDecade: "Décennie suivante",
		previousCentury: "Siècle précédent",
		nextCentury: "Siècle suivant",
	},
	timePickerLocale: {
		placeholder: "Sélectionner l'heure",
	},
};

function AddRendezvous() {
	const [data, setData] = useState({
		title: "",
		studentId: "",
		monitorId: "",
		vehicleId: "",
		dateTime: "" as string | undefined, // Use string | undefined
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const isValidDate = !isNaN(new Date(value).getTime());

		setData({
			...data,
			dateTime: isValidDate ? value : undefined, // Use undefined instead of null
		});
	};

	const { Modal, openModal, closeModal } = useModal();
	const {
		Modal: Modal2,
		openModal: OpenModal2,
		closeModal: closeModal2,
	} = useModal();

	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const onPanelChange = (
		value: Dayjs,
		mode: CalendarProps<Dayjs>["mode"]
	) => {};

	const {
		data: students,
		isLoading: loadingStudents,
		error: errorStudents,
	} = useSWR("/users/get/student", async (url) => {
		return (await fetcher.get(url)).data as Student[];
	});

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	const {
		data: vehicules,
		isLoading: loadingVehicules,
		error: errorVehicules,
	} = useSWR("/vehicule/all", async (url) => {
		const vehicules = (await fetcher.get(url)).data as Vehicule[];

		return vehicules;
	});

	const handleSubmit = (event: { preventDefault: () => void }) => {
		event.preventDefault();

		if (data.dateTime !== undefined) {
			const formattedDateTime = new Date(data.dateTime).toISOString();
			const updatedData = { ...data, dateTime: formattedDateTime };

			fetcher.post("/rendezvous/create", updatedData).then((res) => {
				window.location.reload();
			});
		}
	};

	const {
		data: rendezvousData,
		isLoading: loadingRendezvous,
		error: errorRendezvous,
	} = useSWR("/rendezvous/all", async (url) => {
		return (await fetcher.get(url)).data; // Assuming your server provides an endpoint to fetch all rendezvous
	});

	const handleDelete = (id: number) => {
		fetcher.delete(`/rendezvous/delete/${id}`).then((res) => {
			if (res.data.success) {
				window.location.reload();
			} else {
				alert("Error");
			}
		});
	};

	const [selectedRendezvous, setSelectedRendezvous] = useState(null);

	return (
		<main className="flex-1 overflow-x-hidden overflow-y-auto bg-white h-full">
			<div className="container mx-auto px-4 sm:px-6 py-8">
				<h3 className="text-3xl font-medium text-gray-700">
					Tableau de bord Rendez-Vous
				</h3>

				<div className="mt-4">
					<div className="flex flex-wrap -mx-6">
						<div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
							<div className="flex items-center px-5 py-6 bg-white rounded-3xl shadow-sm">
								<div className="p-3 bg-blue-600 bg-opacity-75 rounded-full">
									<FaCalendarAlt className="w-8 h-8 text-white" />
								</div>

								<div className="mx-5">
									<h4 className="text-2xl font-semibold text-gray-700">
										0
									</h4>
									<div className="text-gray-500">
										Total de Rendez-vous Aujourd'hui
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="container mx-auto py-6 sm:px-6">
							<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
								<div className="flex justify-between">
									<h2 className="text-2xl font-semibold leading-tight">
										Calendrier Des Rendez-vous
									</h2>
									<Button
										onClick={OpenModal2}
										className="btn btn-success"
									>
										Ajouter un Rendez-vous
									</Button>
									<Modal2 title="Ajouter un rendez-vous">
										<form
											className="w-full h-full"
											onSubmit={handleSubmit}
										>
											<div>
												<div className="mt-4">
													<label
														className="block text-gray-700 text-sm font-bold mb-2"
														htmlFor="tire-de-rendez-vous"
													>
														Titre de rendez-vous:
													</label>
													<input
														type="text"
														id="tire-de-rendez-vous"
														className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
														placeholder="Enter tire de rendez-vous"
														value={data.title}
														onChange={(e) =>
															setData({
																...data,
																title: e.target
																	.value,
															})
														}
													/>
												</div>
												<div className="mt-4">
													<label
														className="block text-gray-700 text-sm font-bold mb-2"
														htmlFor="date-time-picker"
													>
														Date et Heure:
													</label>
													<input
														type="datetime-local"
														id="date-time-picker"
														className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
														value={data.dateTime}
														onChange={handleChange}
													/>
												</div>
											</div>
											<div className="flex justify-end pt-2">
												<Button className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover-bg-gray-300">
													Annuler
												</Button>
												<Button
													type="submit"
													className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover-bg-teal-400"
												>
													Ajouter
												</Button>
											</div>
										</form>
									</Modal2>
								</div>
							</div>
							{/* Table content here */}
						</div>
					</div>
				</div>

				<div className="mt-8">
					<div className="flex flex-col sm:flex-row">
						<div className="w-full sm:w-8/12">
							<div className="shadow-lg p-4 bg-white">
								<Calendar
									onPanelChange={onPanelChange}
									locale={customFrLocale}
									onSelect={(date: Dayjs) => {
										// Fetch data based on the selected date or perform any other actions
									}}
									dateCellRender={(date: Dayjs) => {
										const formattedDate =
											date.format("YYYY-MM-DD");
										const rendezvousForDate =
											rendezvousData?.filter(
												(rendezvous) =>
													formattedDate ===
													new Date(
														rendezvous.dateTime
													)
														.toISOString()
														.split("T")[0]
											);

										return (
											<div>
												{rendezvousForDate?.map(
													(rendezvous) => (
														<Popover
															key={rendezvous.id}
															content={
																<Card>
																	<CardContent>
																		<div>
																			<strong>
																				Title:
																			</strong>{" "}
																			{
																				rendezvous.title
																			}
																		</div>
																		<div>
																			<strong>
																				Date
																				and
																				Time:
																			</strong>{" "}
																			{new Date(
																				rendezvous.dateTime
																			).toLocaleString()}
																		</div>

																		{/* Add more rendezvous information here */}
																	</CardContent>
																</Card>
															}
															title={
																rendezvous.title
															}
															trigger="click"
															open={
																selectedRendezvous ===
																rendezvous.id
															}
															onOpenChange={(
																visible
															) => {
																if (visible) {
																	setSelectedRendezvous(
																		rendezvous.id
																	);
																} else {
																	setSelectedRendezvous(
																		null
																	);
																}
															}}
														>
															<div
																style={{
																	backgroundColor:
																		"green",
																	height: "20px",
																	width: "20px",
																	borderRadius:
																		"50%",
																	cursor: "pointer",
																	textAlign:
																		"center",
																	lineHeight:
																		"20px",
																	color: "white",
																}}
															>
																{/* Remove the title here */}
															</div>
														</Popover>
													)
												)}
											</div>
										);
									}}
								/>
							</div>
						</div>
						<div className="w-full sm:w-4/12 pl-4 h-full flex flex-col">
							<div className="bg-white text-sm text-gray-500 font-bold px-5 py-2 shadow border-b border-gray-300">
								Suivi Des Rendez-Vous
							</div>
							<div
								className="w-full h-full overflow-auto shadow bg-white"
								id="journal-scroll"
							>
								<table className="w-full">
									<tbody>
										{/* Map over rendezvousData to display each rendezvous */}
										{rendezvousData &&
											rendezvousData.map((rendezvous) => (
												<tr
													key={rendezvous.id}
													className="relative transform scale-100 text-xs py-1 border-b-2 border-blue-100 cursor-default bg-blue-500 bg-opacity-25"
												>
													<td className="pl-5 pr-3 whitespace-no-wrap">
														<div className="text-gray-400">
															{new Date(
																rendezvous.dateTime
															).toLocaleDateString(
																"fr-FR",
																{
																	weekday:
																		"long",
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																}
															)}
														</div>
														<div>
															{new Date(
																rendezvous.dateTime
															).toLocaleTimeString()}
														</div>
													</td>
													<td className="px-2 py-2 whitespace-no-wrap">
														<div className="flex justify-between items-center">
															<div className="leading-5 text-gray-500 font-medium">
																{
																	rendezvous.title
																}
															</div>
															<div></div>

															<div>
																<IconButton
																	aria-label="delete"
																	onClick={() =>
																		handleDelete(
																			rendezvous.id
																		)
																	}
																>
																	<DeleteIcon />
																</IconButton>
															</div>
														</div>
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
export default AddRendezvous;
