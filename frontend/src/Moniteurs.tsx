import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "./axios";
import { FaUserFriends } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { message, Popconfirm, Modal as ModalAntd } from "antd";
import { Switch } from "antd";
import Availabilty from "./components/Availabilty";
import Calendrier from "./components/Calendrier";
import Button from "./components/Button";
import Modal from "react-bootstrap/Modal";
import Addmoniteurs from "./Addmoniteurs";
import MoniteursEdit from "./MoniteursEdit";
import { QuestionCircleOutlined } from "@ant-design/icons";
import MultipleDayPickerEmployee from "../src/components/SuperpositionEmployee";
import { Link, useLocation } from "react-router-dom";
import { Dayjs } from "dayjs";

export interface Monitor {
	id: string;
	name: string;
	lastname: string;
	title: string;
	phone: string;
	email: string;
	address: string;
	image: string;
	color: string;
	createdAt?: string;
	active: boolean;
	availabilities?: {
		day: string;
		start: string;
		end: string;
	}[];
	ville: string;
	codePostal: string;
}

interface File {
	id: number;
	filename: string;
	originalFilename: string;
}

function Moniteurs() {
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const monitorsPerPage = 5;
	const [sortAlphabeticallyAz, setSortAlphabeticallyAz] = useState(false);
	const [sortAlphabeticallyZa, setSortAlphabeticallyZa] = useState(false);
	const [sortByCreationDate, setSortByCreationDate] = useState(false);
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const active = searchParams.get("active");

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
		mutate: refresh,
	} = useSWR("/users/get/monitor", async (url) => {
		return ((await fetcher.get(url)).data as Monitor[]).toSorted((a, b) => {
			return a.name.localeCompare(b.name);
		});
	});

	const handleDelete = (id: string) => {
		fetcher.delete(`/users/delete/${id}`).then((res) => {
			if (res.data.success) {
				window.location.reload();
				// refresh();
			} else {
				alert("Error");
			}
		});
	};

	const monitorCount = monitors ? monitors.length : 0;

	const filteredMonitors = monitors
		? monitors?.filter((monitor) => {
				const fullName = `${monitor.name} ${monitor.lastname}`;
				return (
					fullName
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase()) ||
					monitor?.phone
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase()) ||
					monitor?.email
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase()) ||
					monitor?.address
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase()) ||
					monitor?.ville
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase()) ||
					monitor?.codePostal
						?.toLowerCase()
						?.includes(searchQuery.toLowerCase())
				);
		  })
		: [];

	const indexOfLastMonitor = currentPage * monitorsPerPage;
	const indexOfFirstMonitor = indexOfLastMonitor - monitorsPerPage;
	const currentMonitors = filteredMonitors.slice(
		indexOfFirstMonitor,
		indexOfLastMonitor
	);

	const joursSemaine = [
		"Dimanche",
		"Lundi",
		"Mardi",
		"Mercredi",
		"Jeudi",
		"Vendredi",
		"Samedi",
	];
	const today = new Date().getDay();
	const todayName = joursSemaine[today];
	const sortCurrentMonitors = () => {
		const monitorsToday = monitors?.filter((monitor) =>
			monitor?.availabilities?.some(
				(availability) => availability.day === todayName
			)
		);
		let sortedMonitors = active ? monitorsToday : [...currentMonitors];

		if (sortAlphabeticallyAz) {
			sortedMonitors?.sort((a, b) => {
				if (a.name && b.name) {
					return a.name.localeCompare(b.name);
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		} else if (sortAlphabeticallyZa) {
			sortedMonitors?.sort((a, b) => {
				if (a.name && b.name) {
					return b.name.localeCompare(a.name);
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		}

		if (sortByCreationDate) {
			console.log("Sorting by creation date:", sortByCreationDate);
			sortedMonitors?.sort((a, b) => {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return dateA - dateB;
			});
		}

		if (sortAlphabeticallyAz && sortByCreationDate) {
			sortedMonitors?.sort((a, b) => {
				if (a.name && b.name) {
					const nameComparison = a.name.localeCompare(b.name);
					if (nameComparison !== 0) {
						return nameComparison;
					} else {
						const dateA = a.createdAt
							? new Date(a.createdAt).getTime()
							: 0;
						const dateB = b.createdAt
							? new Date(b.createdAt).getTime()
							: 0;
						return dateA - dateB;
					}
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		} else if (sortAlphabeticallyZa && sortByCreationDate) {
			sortedMonitors?.sort((a, b) => {
				if (a.name && b.name) {
					const nameComparison = b.name.localeCompare(a.name);
					if (nameComparison !== 0) {
						return nameComparison;
					} else {
						const dateA = a.createdAt
							? new Date(a.createdAt).getTime()
							: 0;
						const dateB = b.createdAt
							? new Date(b.createdAt).getTime()
							: 0;
						return dateA - dateB;
					}
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		}

		return sortedMonitors;
	};
	const sortedMonitors = sortCurrentMonitors();

	const handleNextClick = () => {
		if (
			currentPage < Math.ceil(filteredMonitors.length / monitorsPerPage)
		) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevClick = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const [addingAvailability, setAddingAvailability] = useState(false);

	const closeAvailabilityModal = () => {
		setAddingAvailability(false);
	};

	const daysOfWeek = [
		"Lundi",
		"Mardi",
		"Mercredi",
		"Jeudi",
		"Vendredi",
		"Samedi",
		"Dimanche",
	];
	const [availability, setAvailability] = useState(
		daysOfWeek.map((day) => ({
			day,
			startTime: "",
			endTime: "",
			isActive: false,
		}))
	);

	const handleTimeChange = (
		index: number,
		key: string,
		value: Dayjs | Dayjs[]
	) => {
		// Handle your logic with Dayjs value
		const formattedValue = Array.isArray(value)
			? value.map((v) => v.format("HH:mm"))
			: value.format("HH:mm");

		setAvailability((prevAvailability) => {
			const updatedAvailability = [...prevAvailability];
			updatedAvailability[index][key] = formattedValue;
			return updatedAvailability;
		});
	};

	const [showAddEmployeModal, setShowAddEmployeModal] = useState(false);

	const openAddEmployeModal = () => {
		setShowAddEmployeModal(true);
	};

	const closeAddEmployeModal = () => {
		setShowAddEmployeModal(false);
	};
	const [editEmployeId, setEditEmployeId] = useState(null);

	const openEditEmployeModal = (id) => {
		setEditEmployeId(id);
	};

	const closeEditEmployeModal = () => {
		setEditEmployeId(null);
	};
	function formatDate(dateString) {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, "0")}/${(
			date.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")}/${date.getFullYear()}`;
	}

	const handleToggleActive = async (id, active) => {
		try {
			const response = await fetcher.patch(`/users/update-status/${id}`, {
				active,
			});
			if (response.data.success) {
				message.success(
					`Employé ${active ? "activé" : "désactivé"} avec succès`
				);
				mutate("/users/get/monitor");
			} else {
				throw new Error("Failed to update Monitor status");
			}
		} catch (error) {
			message.error("Error updating Monitor status");
		}
	};

	const [showFilenameModal, setShowFilenameModal] = useState(false);
	const [loadingFiles, setLoadingFiles] = useState(false);
	const [monitorFiles, setMonitorFiles] = useState<File[]>([]);
	const [open, setOpen] = useState(false);

	const openFilenameModal = async (monitorId) => {
		setShowFilenameModal(true);
		setLoadingFiles(true);
		try {
			const response = await fetcher.get(
				`/users/api/files?monitorId=${monitorId}`
			);
			console.log("response", response.data);
			setMonitorFiles(response.data);
		} catch (error) {
			console.error("Error fetching filenames:", error);
		} finally {
			setLoadingFiles(false);
		}
	};

	const closeFilenameModal = () => {
		setShowFilenameModal(false);
		setMonitorFiles([]);
	};

	const handleFileDownload = (filename: string) => {
		console.log("filename", filename);
		const fileUrl = `http://localhost:3000/api/images/${filename}`;
		const link = document.createElement("a");
		link.target = "_blank";
		link.href = fileUrl;
		link.download = filename;
		link.click();
	};

	return (
		<div className="container px-6 py-8 mx-auto">
			<h3 className="text-3xl font-medium text-gray-700 mb-8">
				Gestion des Employes
			</h3>
			<div className="md:w-1/2 rounded-xl bg-white p-3 md:p-4 flex items-center gap-3 shadow-md hover:shadow-lg border border-gray-900/10">
				<div className="flex flex-col items-center gap-1.5 border-r pr-5">
					<div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#fdf4ff]">
						<FaUserFriends className="w-8 h-8 text-[#e879f9]" />
					</div>
					<span className="text-base font-medium">Employés</span>
				</div>
				<div className="w-full flex items-center justify-around">
					<Link
						to="/moniteurs"
						className="flex flex-col items-center"
					>
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#e0f2fe] font-bold">
							<span className="text-[#0284c7]">
								<p className="text-2xl">{monitorCount}</p>
							</span>
						</div>
						<span className="text-gray-600 italic font-medium">
							total
						</span>
					</Link>
					<Link
						to="/moniteurs?active=true"
						className="flex flex-col items-center"
					>
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#ecfdf5] font-bold">
							<span className="text-[#34d399]">
								<p className="text-2xl">
									{
										monitors?.filter((monitor) =>
											monitor?.availabilities?.some(
												(item) =>
													item?.day?.toLocaleLowerCase() ===
													todayName.toLocaleLowerCase()
											)
										)?.length
									}
								</p>
							</span>
						</div>
						<span className="text-gray-600 italic font-medium">
							disponible(s)
						</span>
					</Link>
				</div>
			</div>
			<div className="mt-4">
				<div className="flex flex-col justify-center py-6 sm:px-6">
					<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
						<div className="flex justify-between">
							<h2 className="text-2xl font-semibold leading-tight">
								Liste Des Employés
							</h2>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-between">
									<div className="flex bg-gray-50 items-center p-2 gap-3 rounded-lg border border-gray-900/10">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 text-gray-400"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
												clipRule="evenodd"
											/>
										</svg>
										<input
											className="bg-gray-50 outline-none block"
											type="text"
											name="search"
											placeholder="Recherche..."
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
										/>
									</div>
								</div>
								<Button onClick={openAddEmployeModal}>
									Ajouter un employe
								</Button>
							</div>
						</div>
					</div>

					<ModalAntd
						title={
							<span className="text-2xl">Ajouter un Employé</span>
						}
						open={showAddEmployeModal}
						onCancel={closeAddEmployeModal}
						footer={[]}
						width={750}
					>
						<Addmoniteurs
							onMoniteurCreated={() => {
								closeAddEmployeModal();
								refresh();
							}}
						/>
					</ModalAntd>

					<div className="mt-6 shadow-sm border rounded-lg overflow-x-auto">
						<table className="w-full table-auto text-sm text-left">
							<thead className="bg-gray-50 text-gray-600 font-medium border-b">
								<tr>
									<th className="py-3 px-6">Employé</th>
									<th className="py-3 px-6">Titre</th>
									<th className="py-3 px-6">
										Numéro de téléphone
									</th>
									{/* <th className="py-3 px-6">Email</th> */}
									<th className="py-3 px-6">
										Date de création
									</th>
									{/* <th className="py-3 px-6">Historique</th> */}
									<th className="py-3 px-6">Disponibilité</th>
									<th className="py-3 px-6">Superposition</th>
									<th className="py-3 px-6">Calendrier</th>
									<th className="py-3 px-6">Actions</th>
									<th className="py-3 px-6">Etat</th>
									<th className="py-3 px-6">Dossier</th>
								</tr>
							</thead>
							<tbody className="text-gray-600 divide-y">
								{sortedMonitors?.map((monitor, idx) => (
									<tr key={idx}>
										<td className="flex flex-col items-center w-28 gap-x-3 py-3 px-6 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 w-10 h-10">
													{monitor?.image &&
													monitor?.image !== "" ? (
														<img
															src={`http://localhost:3000/api/images/${monitor?.image}`}
															alt="photo du client"
															className="students_image"
														/>
													) : (
														<span className="text-gray-600">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																strokeWidth={
																	1.5
																}
																stroke="currentColor"
																className="size-10"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
																/>
															</svg>
														</span>
													)}
												</div>
											</div>
											<div className="ml-3">
												<p className="text-gray-900 whitespace-no-wrap">
													{monitor?.name}{" "}
													{monitor?.lastname}
												</p>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{monitor?.title}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{monitor?.phone}
										</td>
										{/* <td className="px-6 py-4 whitespace-nowrap">
											<a href={`mailto:${monitor.email}`}>
												{monitor.email}
											</a>
										</td> */}
										<td className="px-6 py-4 whitespace-nowrap">
											{monitor?.createdAt
												? formatDate(monitor?.createdAt)
												: "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Availabilty
												days={daysOfWeek}
												monitor={monitor}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<MultipleDayPickerEmployee
												monitor={monitor}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Calendrier
												days={daysOfWeek}
												monitor={monitor}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-1">
												<span
													className="py-1 px-2 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg cursor-pointer"
													onClick={() =>
														openEditEmployeModal(
															monitor.id
														)
													}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
														className="size-6"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
														/>
													</svg>
												</span>
												<Popconfirm
													title="epprimer"
													description="Êtes-vous sûr de vouloir le supprimer ?"
													onConfirm={() =>
														handleDelete(monitor.id)
													}
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
													<span className="py-1 leading-none cursor-pointer px-2 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="size-6"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
															/>
														</svg>
													</span>
												</Popconfirm>
											</div>
											<ModalAntd
												title={
													<span className="text-2xl">
														Modifier un Employé
													</span>
												}
												open={
													editEmployeId === monitor.id
												}
												onCancel={closeEditEmployeModal}
												footer={[]}
												width={750}
											>
												<MoniteursEdit
													monitorId={monitor.id}
													onClose={
														closeEditEmployeModal
													}
												/>
											</ModalAntd>
											{/* <Modal
												show={
													editEmployeId === monitor.id
												}
												onHide={closeEditEmployeModal}
												size="lg"
											>
												<Modal.Header>
													<Modal.Title>
														Modifier un Employé
													</Modal.Title>
													<FontAwesomeIcon
														icon={faTimes}
														className="cursor-pointer"
														onClick={
															closeEditEmployeModal
														}
													/>
												</Modal.Header>
												<Modal.Body>
													<MoniteursEdit
														monitorId={monitor.id}
														onClose={
															closeEditEmployeModal
														}
													/>
												</Modal.Body>
											</Modal> */}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Switch
												checked={monitor.active}
												onChange={() =>
													handleToggleActive(
														monitor.id,
														!monitor.active
													)
												}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												onClick={() =>
													openFilenameModal(
														monitor.id
													)
												}
												className="py-1 cursor-pointer px-2 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													className="size-6"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
													/>
												</svg>
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap"></td>
									</tr>
								))}
							</tbody>
						</table>
						<div className="px-5 py-3 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
							<span className="text-xs xs:text-sm text-gray-900">
								Affichage {indexOfFirstMonitor + 1} à{" "}
								{Math.min(indexOfLastMonitor, monitorCount)} de{" "}
								{monitorCount} Entrées
							</span>
							<div className="inline-flex mt-3 xs:mt-0">
								<button
									className="px-2.5 py-1 border text-sm rounded-lg duration-150 hover:bg-gray-50"
									onClick={handlePrevClick}
								>
									Précedent
								</button>
								&nbsp; &nbsp;
								<button
									className="px-2.5 py-1 border text-sm rounded-lg duration-150 hover:bg-gray-50"
									onClick={handleNextClick}
								>
									Suivant
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Moniteurs;

{
	/* <div>
	<div className="flex flex-col">
		<div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-hidden  ">
			<div className="inline-block shadow rounded-lg overflow-hidden scale-75">
				<table className=" leading-normal">
					<thead>
						<tr>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Employé
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Titre
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Numéro de téléphone
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								E-mail
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								<div className="flex items-center gap-1">
									Créer{" "}
								</div>
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								DISPONIBILITÉ
							</th>

							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Superposition
							</th>

							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Calendrier
							</th>
							<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Action
							</th>
							<th className="px-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Etat
							</th>
							<th className="px-2 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								Dossier
							</th>
						</tr>
					</thead>
					<tbody>
						{sortedMonitors?.map((monitor) => {
							return (
								<tr key={monitor.id}>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<div className="flex items-center">
											<div className="flex-shrink-0 w-10 h-10">
												{monitor?.image &&
												monitor?.image !== "" ? (
													<img
														src={monitor?.image}
														alt="photo du client"
														className="students_image"
													/>
												) : (
													<span className="text-gray-600">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="size-10"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
															/>
														</svg>
													</span>
												)}
											</div>
											<div className="ml-3">
												<p className="text-gray-900 whitespace-no-wrap">
													{monitor.name}{" "}
													{monitor.lastname}
												</p>
											</div>
										</div>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<p className="text-gray-900 whitespace-no-wrap">
											{monitor.title}
										</p>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<p className="text-gray-900 whitespace-no-wrap">
											{monitor.phone}
										</p>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<p className="text-gray-900 whitespace-no-wrap">
											<a href={`mailto:${monitor.email}`}>
												{monitor.email}
											</a>
										</p>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
											<span
												aria-hidden
												className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
											></span>
											{monitor.createdAt
												? formatDate(monitor.createdAt)
												: "N/A"}
										</span>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<Stack direction="row" spacing={1}>
											<Availabilty
												days={daysOfWeek}
												monitor={monitor}
											/>
										</Stack>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<Stack direction="row" spacing={1}>
											<MultipleDayPickerEmployee
												monitor={monitor}
											/>
										</Stack>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<Stack direction="row" spacing={1}>
											<Calendrier
												days={daysOfWeek}
												monitor={monitor}
											/>
										</Stack>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<Stack direction="row" spacing={1}>
											<IconButton
												color="primary"
												aria-label="Modifier"
												onClick={() =>
													openEditEmployeModal(
														monitor.id
													)
												}
											>
												<ModeEditIcon />
											</IconButton>

											<Popconfirm
												title="epprimer"
												description="Êtes-vous sûr de vouloir le supprimer ?"
												onConfirm={() =>
													handleDelete(monitor.id)
												}
												icon={
													<QuestionCircleOutlined
														style={{
															color: "red",
														}}
													/>
												}
												okText={
													<span className="text-red-500">
														Oui
													</span>
												}
												cancelText="Non"
											>
												<IconButton>
													<FaTrash
														size={20}
														className="text-red-500 hover:text-red-700"
													/>
												</IconButton>
											</Popconfirm>
										</Stack>

										<Modal
											show={editEmployeId === monitor.id}
											onHide={closeEditEmployeModal}
										>
											<Modal.Header>
												<Modal.Title>
													Modifier un Employé
												</Modal.Title>
												<FontAwesomeIcon
													icon={faTimes}
													className="cursor-pointer"
													onClick={
														closeEditEmployeModal
													}
												/>
											</Modal.Header>
											<Modal.Body>
												<MoniteursEdit
													monitorId={monitor.id}
													onClose={
														closeEditEmployeModal
													}
												/>
											</Modal.Body>
										</Modal>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<Switch
											checked={monitor.active}
											onChange={() =>
												handleToggleActive(
													monitor.id,
													!monitor.active
												)
											}
										/>
									</td>
									<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
										<FontAwesomeIcon
											icon={faFile}
											className="cursor-pointer text-blue-500 hover:text-blue-700"
											onClick={() =>
												openFilenameModal(monitor.id)
											}
										/>
										<Modal
											show={showFilenameModal}
											onHide={closeFilenameModal}
										>
											<Modal.Header closeButton>
												<Modal.Title>
													Monitor Files
												</Modal.Title>
											</Modal.Header>
											<Modal.Body>
												{loadingFiles ? (
													<p>Loading...</p>
												) : (
													<ul>
														{monitorFiles.map(
															(file) => (
																<li
																	key={
																		file.id
																	}
																>
																	<button
																		onClick={(
																			e
																		) => {
																			e.preventDefault();
																			handleFileDownload(
																				file.filename
																			);
																		}}
																	>
																		{
																			file.originalFilename
																		}
																	</button>
																</li>
															)
														)}
													</ul>
												)}
											</Modal.Body>
										</Modal>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				<div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
					<span className="text-xs xs:text-sm text-gray-900">
						Affichage {indexOfFirstMonitor + 1} à{" "}
						{Math.min(indexOfLastMonitor, monitorCount)} de{" "}
						{monitorCount} Entrées
					</span>
					<div className="inline-flex mt-2 xs:mt-0">
						<Button
							className="text-sm text-indigo-50 transition duration-150 hover-bg-indigo-500 bg-black font-semibold py-2 px-4 rounded-l"
							onClick={handlePrevClick}
						>
							Prev
						</Button>
						&nbsp; &nbsp;
						<Button
							className="text-sm text-indigo-50 transition duration-150 hover-bg-indigo-500 bg-black font-semibold py-2 px-4 rounded-r"
							onClick={handleNextClick}
						>
							Suivant
						</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> */
}
