import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "dayjs/locale/fr";
import { AutoComplete, message, Modal } from "antd";
import dayLocaleData from "dayjs/plugin/localeData";
import { FaCalendarAlt } from "react-icons/fa";
import { useModal } from "./components/modal";
import useSWR from "swr";
import { fetcher } from "./axios";
import Button from "./components/Button";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { MouseEventHandler } from "react";
import "../src/assets/app.css";
import ModalDispo from "./components/modal/ModalDispo";
import { useLocation } from "react-router-dom";
import MultipleDayPicker from "../src/components/DayPicker";
import { useAuth } from "./lib/hooks/auth";
import SuperpositionView from "./components/superpositionView";
import { Monitor } from "./Moniteurs";
import TextArea from "antd/es/input/TextArea";

dayjs.extend(dayLocaleData);

export interface Superposition {
	disabledDates: dateTime[];
	selectedOption: string;
	id: string;
	titre: string;
}
export interface Disponibilite {
	extra: string;
	day: String[];
	from: String;
	to: String;
	id: string;
}

type dateTime = string;

const Disponibilite: React.FC = () => {
	const [disabledDates, setDisabledDates] = useState<string[]>([]);
	const [isDatePickerOpen, setDatePickerOpen] = useState(false);
	const [selectedOption, setSelectedOption] = useState("");
	const [titre, setTitre] = useState("");
	const [title, setTitle] = useState("");
	const [comment, setComment] = useState("");
	const [forWho, setForWho] = useState<boolean>(false);
	const { user } = useAuth();
	const initialStartDate = new Date();
	const initialEndDate = new Date();
	const [selectedEmploye, setSelectedEmploye] = useState<{
		value: string;
		label: string;
	}>({ value: "tous", label: "Tous" });
	const [file, setFile] = useState<File | null>(null);
	const [open, setOpen] = useState(false);

	const handleDeleteDisp = (id) => {
		fetcher
			.delete(`/disponibilite/deleteDisponibilite/${id}`)
			.then((res) => {
				if (res.data.success) {
					message.success("Supprimée avec succès.");
					window.location.reload();
				} else {
					message.error("error Failed to delete");
				}
			})
			.catch((err) => console.log(err));
	};

	const [selection, setSelection] = useState({
		startDate: initialStartDate,
		endDate: initialEndDate,
		key: "selection",
	});

	const handleCloseDatePicker = () => {
		setDatePickerOpen(false);
	};

	const [datesToSubmit, setDatesToSubmit] = useState([]);
	const [idToSubmit, setIdToSubmit] = useState("");
	const [isItFromEncryption, setIsItFromEncryption] =
		useState<boolean>(false);
	const [tokenFromEncryption, setTokenFromEncryption] = useState("");
	const handleFromchildData = (
		date: any,
		id: string,
		title: string,
		dataFromEncrypted: boolean,
		token: string
	) => {
		setDatesToSubmit(date);
		setIdToSubmit(id);
		setTitre(title);
		setIsItFromEncryption(dataFromEncrypted);
		setTokenFromEncryption(token);
	};

	const handleUpload = async () => {
		try {
			if (file) {
				const formData = new FormData();
				formData.append("file", file);
				const res = await fetcher.post(`upload`, formData);
				if (res.status === 201) {
					return res?.data;
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSendData: MouseEventHandler<HTMLButtonElement> = async (
		event
	) => {
		event.preventDefault();
		const datesToDisable = datesToSubmit.map((date) => {
			return new Date(date).toISOString();
		});

		const idToSend =
			selectedEmploye?.value !== "tous"
				? selectedEmploye?.value
				: user?.id;

		try {
			let imgUrl = null;
			if (file) {
				imgUrl = await handleUpload();
			}
			const response = await fetcher.post(
				"disponibilite/create/superposition",
				{
					titre: title,
					disabledDates: datesToDisable,
					selectedOption: "selectedOption",
					userId: idToSend,
					reqToken: tokenFromEncryption || "",
					comment,
					file: imgUrl ? imgUrl : "",
				}
			);

			if (response.status === 200) {
				message.success("Dates ajouter avec succées");
				// window.location.reload();
				window.location.replace("/disponibilite");
			} else {
				console.error("Échec.");
			}
		} catch (error) {
			console.error("Erreur :", error);
			alert(error);
		}
	};

	const {
		Modal: Modal2,
		openModal: openModal2,
		closeModal: closeModal2,
	} = useModal();

	const {
		data: superpositions = [],
		isLoading: loadingSuperpositions,
		error: errorSuperpositions,
	} = useSWR("/disponibilite/get/superposition", async (url) => {
		return (await fetcher.get(url)).data as Superposition[];
	});

	const {
		data: disponibilites = [],
		isLoading: loadingDisponibilites,
		error: errorDisponibilites,
	} = useSWR("/disponibilite/get/disponibilite", async (url) => {
		return (await fetcher.get(url)).data as Disponibilite[];
	});

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		const monitors = (await fetcher.get(url)).data as Monitor[];
		const updatedMonitors = monitors?.map((monitor) => ({
			...monitor,
			value: monitor?.id,
			label: `${monitor?.name} ${monitor?.lastname}`,
		}));
		return updatedMonitors;
	});

	const handleResetAll = () => {
		setOpen(false);
		setDisabledDates([]);
		setTitre("");
		setTitle("");
		setSelectedOption("");
		setSelection({
			startDate: initialStartDate,
			endDate: initialEndDate,
			key: "selection",
		});
		handleCloseDatePicker();
	};

	const location = useLocation();
	const [dates, setDates] = useState<string[]>([]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const datesParam = params.get("dates");
		if (datesParam) {
			setDates(datesParam.split(","));
		}
	}, [location]);

	const weekIndex = {
		lundi: 0,
		mardi: 1,
		mercredi: 2,
		jeudi: 3,
		vendredi: 4,
		samedi: 5,
		dimanche: 6,
	};

	let allDays: any[] = [];
	disponibilites.forEach((disponibilite) => {
		allDays = [...new Set([...allDays, ...disponibilite.day])];
	});

	allDays.sort((a, b) => weekIndex[a] - weekIndex[b]);

	return (
		<div className="container px-6 py-8 mx-auto">
			<h3 className="text-3xl font-medium text-gray-700 mb-8">
				Gestion des Disponibilités
			</h3>
			<div className="flex items-center p-6 bg-white rounded-3xl shadow-md hover:shadow-lg w-96 border border-gray-900/10">
				<div className="p-3 bg-blue-600 bg-opacity-75 rounded-full">
					<FaCalendarAlt className="w-8 h-8 text-white" />
				</div>

				<div className="mx-5">
					<h4 className="text-xl font-semibold text-gray-700">
						lun. - ven. 7:00h - 19:00h
					</h4>
					<span className="text-gray-500">Disponibilités</span>
				</div>
			</div>

			<div className="flex justify-between my-5">
				<h2 className="text-2xl font-semibold leading-tight">
					Vos Horaires d'ouverture
				</h2>
				<div>
					<Button onClick={openModal2}>
						Ajouter Vos Horaires De Disponibilités
					</Button>
				</div>
			</div>
			<Modal2 title="Ajouter Vos Disponibilités">
				<div className="">
					<ModalDispo />
				</div>
			</Modal2>

			<div className="mt-6 shadow-sm border rounded-lg overflow-x-auto">
				<table className="w-full table-auto text-sm text-left">
					<thead className="bg-gray-50 text-gray-600 font-medium border-b">
						<tr>
							<th className="py-3 px-6">Jour</th>
							<th className="py-3 px-6">De</th>
							<th className="py-3 px-6">À</th>
							<th className="py-3 px-6">Supression</th>
						</tr>
					</thead>
					<tbody className="text-gray-600 divide-y">
						{disponibilites?.map((disponibilite, idx) => {
							const midHours2 = (disponibilite.to || "0")
								.replace(/undefined/g, " ")
								.split(",");
							const openHours2 = (disponibilite.from || "0")
								.replace(/undefined/g, " ")
								.split(",");
							const closeHours2 = (disponibilite.extra || "0")
								.replace(/undefined/g, " ")
								.split(",");

							const openHoursArray = openHours2.map(function (
								element
							) {
								if (element === " ") {
									return " ";
								}

								let str = String(element).replace(/\./g, "h");

								if (!str.includes("h")) {
									if (parseInt(str) < 10) {
										str = "0" + str;
									}
									str += "h";
								}
								return str.replace(/h5/g, "h30");
							});

							const midHoursArray = midHours2.map(function (
								element
							) {
								if (element === " ") {
									return " "; // Si l'élément est "x", le laisser tel quel
								}

								let str = String(element).replace(/\./g, "h"); // Remplace les points par des "h"
								if (!str.includes("h")) {
									if (parseInt(str) < 10) {
										str = "0" + str; // Ajoute un "0" devant si le nombre est inférieur à 10
									}
									str += "h"; // Ajoute un "h" derrière
								}
								return str.replace(/h5/g, "h30"); // Remplace les "h5" par "h30"
							});

							const closeHoursArray = closeHours2.map(function (
								element
							) {
								if (element === " ") {
									return " ";
								}

								let str = String(element).replace(/\./g, "h");
								if (!str.includes("h")) {
									if (parseInt(str) < 10) {
										str = "0" + str;
									}
									str += "h";
								}
								return str.replace(/h5/g, "h30");
							});
							return (
								<tr key={idx}>
									<td className="px-6 py-4 whitespace-nowrap">
										{disponibilite?.day?.map((day, i) => (
											<div
												key={i}
												className=" px-6 py-3 text-xs font-semibold leading-5 text-black"
											>
												<span className="bg-green-300 rounded-lg p-0.5 ">
													{disponibilite.day[i]
														? `${disponibilite.day[i]}`
														: day}
												</span>
											</div>
										))}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{openHoursArray[1] === " "
											? openHoursArray[0]
											: `${openHoursArray[0]} - ${midHoursArray[0]}`}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{closeHoursArray[0] === " "
											? closeHoursArray[0]
											: `${closeHoursArray[0]} - ${closeHoursArray[1]}`}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{closeHoursArray[0] === " "
											? closeHoursArray[0]
											: `${closeHoursArray[0]} - ${closeHoursArray[1]}`}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<button
											onClick={() =>
												handleDeleteDisp(
													disponibilite.id.toString()
												)
											}
											className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
										>
											supprimer
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-8">
				<div className="bg-white p-4 shadow-md rounded-xl border border-gray-900/10 hover:shadow-lg">
					<h3 className="text-xl font-semibold text-gray-700 mb-3">
						Superpositions de dates
					</h3>
					<p className="text-gray-600 mb-4">
						Ajoutez les dates où vos disponibilités changent de vos
						heures quotidiennes.
					</p>
					<Button
						onClick={() => setOpen(true)}
						className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover-bg-blue-600"
					>
						<span className="mr-2">Ajouter une superposition</span>
						<FaCalendarAlt className="w-5 h-5" />
					</Button>
				</div>
			</div>
			<div>
				<SuperpositionView />
			</div>

			<Modal
				title={
					<span className="text-xl font-bold">
						Ajouter une superposition
					</span>
				}
				open={open}
				onCancel={() => setOpen(false)}
				footer={[]}
				width={530}
			>
				<div className="flex flex-col items-center">
					<div className="mb-3 pt-1">
						<label
							htmlFor="title"
							className="block text-sm font-medium leading-6 text-gray-900"
						>
							Titre
						</label>
						<AutoComplete
							options={[
								{ value: "Congé payé" },
								{ value: "Congé non payé" },
								{ value: "RTT" },
								{ value: "Maladie" },
								{ value: "Autre" },
							]}
							className="w-[350px] sm:w-[420px] mt-1"
							id="title"
							size="large"
							value={title}
							onChange={(value: string) => setTitle(value)}
							onSelect={(value: string) => setTitle(value)}
							allowClear
						/>
					</div>
					{title === "Autre" && (
						<div className="mb-3 pt-1">
							<label
								htmlFor="comment"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Commentaire
							</label>
							<TextArea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								rows={4}
								className="w-[350px] sm:w-[420px]"
							/>
						</div>
					)}
					<div>
						<label
							htmlFor="employe"
							className="block text-sm font-medium leading-6 text-gray-900"
						>
							Employe
						</label>
						<AutoComplete
							options={[{ value: "tous", label: "Tous" }]?.concat(
								monitors!
							)}
							className="w-[350px] sm:w-[420px] mt-1"
							id="employe"
							size="large"
							value={selectedEmploye?.label}
							onChange={(value: string, option: any) =>
								setSelectedEmploye({
									value,
									label: option?.label,
								})
							}
							onSelect={(value: string, option: any) =>
								setSelectedEmploye({
									value,
									label: option?.label,
								})
							}
							allowClear
						/>
					</div>
					<div className="w-full flex flex-col">
						<div className="flex flex-col">
							{!isItFromEncryption ? (
								<div className="flex flex-row gap-3">
									{/* <h2>Superposition pour un employer ?</h2>
									<input type="checkbox" 
									checked={forWho}
									onChange={handleCheckboxChange}
									name="" id="" /> */}
								</div>
							) : (
								""
							)}
							<MultipleDayPicker
								param={false}
								onDataFromChild={handleFromchildData}
								toWho={forWho}
							/>
						</div>
					</div>
					<div className="mt-3">
						<label
							className="block text-sm font-medium leading-6 text-gray-900"
							htmlFor="inputGroupFile01"
						>
							Selectionner un fichier
						</label>
						<input
							type="file"
							className="form-control mt-1 w-[350px] sm:w-[420px]"
							id="inputGroupFile01"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									setFile(file);
								}
							}}
						/>
					</div>
					<div className="w-full">
						<div className="flex justify-end mt-4 gap-2">
							<button
								className="modal-close px-3 bg-gray-50 py-2 rounded-lg border border-gray-900/10 hover:bg-gray-100"
								onClick={handleResetAll}
							>
								Annuler
							</button>

							<Button type="submit" onClick={handleSendData}>
								Confirmer
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default Disponibilite;

{
	/* <div className="-mx-4 sm:-mx-6 sm:px-6">
	<div className="py-4 align-middle inline-block min-w-full sm:px-6">
		<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
			<table className="min-w-full border border-gray-300">
				<thead>
					<tr>
						<th className="px-1 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
							Jour
						</th>
						<th className="px-1 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
							De
						</th>
						<th className="px-1 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
							À
						</th>
						<th className="px-1 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
							Supression
						</th>
					</tr>
				</thead>
				<tbody>
					{disponibilites?.map((disponibilite, index) => {
						const closeHours = disponibilite.to.split(",");
						const openHours = disponibilite.from.split(",");
						const midHours2 = (disponibilite.to || "0")
							.replace(/undefined/g, " ")
							.split(",");
						const openHours2 = (disponibilite.from || "0")
							.replace(/undefined/g, " ")
							.split(",");
						const closeHours2 = (disponibilite.extra || "0")
							.replace(/undefined/g, " ")
							.split(",");

						const openHoursArray = openHours2.map(function (
							element
						) {
							if (element === " ") {
								return " "; // Si l'élément est "x", le laisser tel quel
							}

							let str = String(element).replace(/\./g, "h");

							if (!str.includes("h")) {
								if (parseInt(str) < 10) {
									str = "0" + str;
								}
								str += "h";
							}
							return str.replace(/h5/g, "h30");
						});

						const midHoursArray = midHours2.map(function (element) {
							if (element === " ") {
								return " "; // Si l'élément est "x", le laisser tel quel
							}

							let str = String(element).replace(/\./g, "h"); // Remplace les points par des "h"
							if (!str.includes("h")) {
								if (parseInt(str) < 10) {
									str = "0" + str; // Ajoute un "0" devant si le nombre est inférieur à 10
								}
								str += "h"; // Ajoute un "h" derrière
							}
							return str.replace(/h5/g, "h30"); // Remplace les "h5" par "h30"
						});

						const closeHoursArray = closeHours2.map(function (
							element
						) {
							if (element === " ") {
								return " "; // Si l'élément est "x", le laisser tel quel
							}

							let str = String(element).replace(/\./g, "h"); // Remplace les points par des "h"
							if (!str.includes("h")) {
								if (parseInt(str) < 10) {
									str = "0" + str; // Ajoute un "0" devant si le nombre est inférieur à 10
								}
								str += "h"; // Ajoute un "h" derrière
							}
							return str.replace(/h5/g, "h30"); // Remplace les "h5" par "h30"
						});
						return (
							<tr key={index}>
								<td>
									{disponibilite.day.map((day, i) => (
										<div
											key={`${index}-${i}`}
											className=" px-6 py-3 text-xs font-semibold leading-5 text-black"
										>
											<span className="bg-green-300 rounded-lg p-0.5 ">
												{disponibilite.day[i]
													? `${disponibilite.day[i]}`
													: day}
											</span>
										</div>
									))}
								</td>

								<td>
									{openHoursArray[1] === " "
										? openHoursArray[0]
										: `${openHoursArray[0]} - ${midHoursArray[0]}`}
								</td>

								<td>
									{openHoursArray[1] === " "
										? midHoursArray[0]
										: `${openHoursArray[1]} - ${midHoursArray[1]}`}
								</td>

								{closeHoursArray[0] !== " " && (
									<td>
										{closeHoursArray[0] === " "
											? closeHoursArray[0]
											: `${closeHoursArray[0]} - ${closeHoursArray[1]}`}
									</td>
								)}

								<td>
									<button
										onClick={() =>
											handleDeleteDisp(
												disponibilite.id.toString()
											)
										}
										className="text-red-500 hover:text-red-700"
									>
										Supprimer
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	</div>
</div>; */
}
