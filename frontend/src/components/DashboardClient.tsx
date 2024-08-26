import React, { useState, ReactNode, Key } from "react";
import { useAuth } from "../lib/hooks/auth";
import useSWR, { mutate } from "swr";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { fetcher } from "../axios";
import { message, Popconfirm, Select, Modal } from "antd";
import UpdateDateClient from "../components/updateDateClient";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const DashboardClient: React.FC = () => {
	const { user } = useAuth();
	const userId = user?.id;

	const {
		data: appointmentsData,
		error: appointmentsError,
		isLoading: appointmentsLoading,
	} = useSWR(`/rendezvous/get/byClient/${userId}`, async (url) => {
		const result = await fetcher.get(url);
		return result.data;
	});

	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
	const [requestedAppointment, setRequestedAppointment] = useState(false);
	const [showPastAppointments, setShowPastAppointments] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState("");
	const [isClicked, setIsClicked] = useState(false);
	const [open, setOpen] = useState(false);
	const [rendezVousToMod, setRendezVousToMod] = useState<string>("");

	const currentDate = new Date();

	const handleAddAppointment = () => {
		if (!title || !date) return;
		const newAppointment = {
			id: appointmentsData.length + 1,
			title,
			date,
		};
		setTitle("");
		setDate("");
	};

	const handleTitleChange = (e) => {
		setTitle(e.target.value);
	};

	const handleDateChange = (e) => {
		setDate(e.target.value);
	};

	const handleDetailsClick = (appointment) => {
		setSelectedAppointment(appointment);
	};

	const handleCloseModal = () => {
		setSelectedAppointment(null);
	};

	const handleRequestClick = () => {
		setRequestedAppointment(true);
	};

	const handleCloseRequestModal = () => {
		setRequestedAppointment(false);
	};

	const isPastAppointment = (dateTime) => {
		const appointmentDate = new Date(dateTime);
		const currentDate = new Date();
		return appointmentDate < currentDate;
	};

	const isDeletedAppointment = (isActivated) => {
		return isActivated === true;
	};

	if (appointmentsLoading) return <p>Chargement des rendez-vous...</p>;
	if (appointmentsError)
		return (
			<p>
				Erreur lors du chargement des rendez-vous:{" "}
				{appointmentsError.message}
			</p>
		);

	const filteredAppointments = appointmentsData.filter((appointment) => {
		const isPast = isPastAppointment(appointment.dateTime);
		const isMatchingCompany =
			selectedCompany === "" ||
			appointment.enterpriseName === selectedCompany;
		return showPastAppointments
			? isMatchingCompany
			: !isPast && isMatchingCompany;
	});

	const isPendingConfirmation = (appointment) => {
		return appointment.status === "pending";
	};

	const closest = appointmentsData.reduce((closestEvent, currentEvent) => {
		const eventDate = new Date(currentEvent.dateTime);
		if (isAfter(eventDate, currentDate)) {
			if (!closestEvent || eventDate < new Date(closestEvent.dateTime)) {
				return currentEvent;
			}
		}
		return closestEvent;
	}, null);

	const closestExpired = appointmentsData.reduce(
		(closestEvent, currentEvent) => {
			const eventDate = new Date(currentEvent.dateTime);
			if (isBefore(eventDate, currentDate)) {
				if (
					!closestEvent ||
					eventDate > new Date(closestEvent.dateTime)
				) {
					return currentEvent;
				}
			}
			return closestEvent;
		},
		null
	);

	const handleClick = () => {
		setShowPastAppointments(!showPastAppointments);
		setIsClicked(!isClicked);
	};

	// const handleDeleteEvent = async (eventId: string) => {
	// 	try {
	// 		await fetcher(`/rendezvous/desactivate/${eventId}`, {
	// 			method: "PATCH",
	// 		});
	// 	} catch (error) {
	// 		console.error("Error deleting event:", error);
	// 	}
	// };

	const handleDeleteEvent = async (eventId: string) => {
		try {
			await fetcher(`/rendezvous/delete/${eventId}`, {
				method: "DELETE",
			});
			message.success("Rendez-vous supprimé avec succès");
			mutate(`/rendezvous/get/byClient/${userId}`);
		} catch (error) {
			console.error("Error deleting event:", error);
			message.error("Échec de la suppression du rendez-vous.");
		}
	};

	const openModal = (appointmentId) => {
		setOpen(true);
		setRendezVousToMod(appointmentId);
	};

	console.log(appointmentsData);

	return (
		<div className="container">
			<h1 className="text-2xl font-bold mt-4">Mes Rendez-vous</h1>

			<div className="grid grid-cols-2 gap-4 py-4">
				<div className="col-span-2 sm:col-span-1 bg-blue-200 p-4 rounded text-center">
					<h2>Rendez-vous précédent</h2>
					{closestExpired && (
						<div key={closestExpired.id}>
							{closestExpired.title} -{" "}
							{format(
								parseISO(closestExpired.dateTime),
								"dd MMMM yyyy ",
								{
									locale: fr,
								}
							)}
						</div>
					)}
				</div>
				<div className="col-span-2 sm:col-span-1 bg-green-200 p-4 rounded text-center">
					<h2>Prochain rendez-vous</h2>
					{closest && (
						<div key={closest.id}>
							{closest.title} -{" "}
							{format(
								parseISO(closest.dateTime),
								"dd MMMM yyyy ",
								{
									locale: fr,
								}
							)}
							- {"chez " + closest.enterpriseName}
						</div>
					)}
				</div>
			</div>

			<div className="p-4 mx-auto w-full rounded ">
				<div className="mb-4 flex flex-col items-start md:flex-row md:items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							className="py-2 px-4 bg-green-500 text-white rounded-lg"
							onClick={handleRequestClick}
						>
							Demander un rendez-vous
						</button>

						{requestedAppointment && (
							<div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center">
								<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
									<h2 className="text-xl font-bold mb-4">
										Nouveau rendez-vous
									</h2>
									<input
										type="text"
										placeholder="Titre du rendez-vous"
										value={title}
										onChange={handleTitleChange}
										className="w-full border rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<input
										type="text"
										placeholder="Intervention requise"
										// value={intervention}
										// onChange={handleInterventionChange}
										className="w-full border rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<div className="flex items-center mb-4">
										<input
											type="date"
											value={date}
											onChange={handleDateChange}
											className="w-1/2 border rounded-md p-3 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<select
											name="quand"
											// value={timeOfDay}
											// onChange={handleTimeOfDayChange}
											className="w-1/2 border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="matin">Matin</option>
											<option value="apres-midi">
												Après-midi
											</option>
										</select>
									</div>
									<div className="flex justify-end gap-3">
										<button
											onClick={handleCloseRequestModal}
											className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
										>
											Annuler
										</button>

										<button
											onClick={handleAddAppointment}
											className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
										>
											Envoyer
										</button>
									</div>
								</div>
							</div>
						)}

						<div className="flex gap-2">
							<button
								className={`border rounded-lg p-2 m-2 bg-${
									isClicked ? "green" : "blue"
								}-500 text-white hover:bg-${
									isClicked ? "green" : "blue"
								}-600 focus:outline-none focus:ring focus:ring-${
									isClicked ? "green" : "blue"
								}-400`}
								onClick={handleClick}
							>
								Rendez-vous passés
							</button>
						</div>
					</div>

					<div>
						<Select
							showSearch
							value={selectedCompany}
							className="w-60"
							placeholder="Sélectionnez une entreprise"
							optionFilterProp="children"
							onChange={(value) => setSelectedCompany(value)}
							filterOption={(input, option) => {
								if (
									option &&
									typeof option.children === "string"
								) {
									const childrenString =
										option.children as string;
									return childrenString
										.toLowerCase()
										.includes(input.toLowerCase());
								}
								return false;
							}}
							size="large"
						>
							<Option value="">Toutes les entreprises</Option>
							{[
								...new Set(
									appointmentsData.map(
										(appointment) =>
											appointment.enterpriseName
									)
								),
							].map((companyName) => (
								<Option
									key={companyName as Key}
									value={companyName as string}
								>
									{companyName as ReactNode}
								</Option>
							))}
						</Select>
					</div>
				</div>
				{/* Liste des rendez-vous filtrés */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredAppointments?.map((appointment) => (
						<div
							key={appointment.id}
							className="rounded-xl shadow-md p-4 relative border border-gray-900/10 hover:shadow-lg flex justify-between flex-col"
						>
							<div>
								{isPastAppointment(appointment.dateTime) ? (
									<span className="absolute top-2 right-2 bg-gray-500 w-4 h-4 rounded-full"></span>
								) : (
									<span className="absolute top-2 right-2 bg-green-500 w-4 h-4 rounded-full"></span>
								)}
								{isDeletedAppointment(
									appointment.isActivated
								) && (
									<span className="absolute top-2 right-2 bg-red-500 w-4 h-4 rounded-full"></span>
								)}
								<h3 className="text-lg font-bold mb-2">
									{appointment.title}
								</h3>
								<p className="text-sm text-gray-600">
									Date:{" "}
									{format(
										parseISO(appointment.dateTime),
										"dd MMMM yyyy ",
										{
											locale: fr,
										}
									)}
								</p>
								<p className="my-3">
									Entreprise : {appointment.enterpriseName}
								</p>
							</div>
							<div className="flex flex-col gap-2">
								{!isPastAppointment(appointment.dateTime) &&
									!isDeletedAppointment(
										appointment.isActivated
									) && (
										<div className="flex gap-1">
											<button
												onClick={() =>
													openModal(appointment.id)
												}
												className="bg-green-600 flex-1 text-white px-3 py-1 rounded-md hover:bg-green-500"
											>
												reSchedule
											</button>
											<Popconfirm
												title="Suppression"
												description="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?"
												icon={
													<QuestionCircleOutlined
														style={{ color: "red" }}
													/>
												}
												onConfirm={() =>
													handleDeleteEvent(
														appointment.id
													)
												}
												okText="Oui"
												cancelText="Non"
												okButtonProps={{
													className:
														"text-white bg-red-600 hover:!bg-red-500",
												}}
											>
												<button className="bg-red-500 flex-1 text-white ml-2 px-3 py-1 rounded-md hover:bg-red-600">
													Annuler
												</button>
											</Popconfirm>
										</div>
									)}
								<button
									onClick={() =>
										handleDetailsClick(appointment)
									}
									className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
								>
									Détails
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Modal pour afficher les détails du rendez-vous sélectionné */}
				{selectedAppointment && (
					<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
						<div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full flex items-center flex-col">
							<h2 className="text-xl font-bold mb-4">
								Détails du Rendez-vous
							</h2>
							<p className="text-lg font-medium text-center">
								{selectedAppointment.title}
							</p>
							<div className="info flex flex-row gap-2">
								<p>
									Entreprise :{" "}
									{selectedAppointment.enterpriseName}{" "}
								</p>
								{selectedAppointment.enterpriseContact[0] && (
									<a
										href={`mailto:${selectedAppointment.enterpriseContact[0]}`}
									>
										<FontAwesomeIcon icon={faEnvelope} />
									</a>
								)}
								{selectedAppointment.enterpriseContact[1] && (
									<a
										href={`mailto:${selectedAppointment.enterpriseContact[1]}`}
									>
										<FontAwesomeIcon icon={faPhone} />
									</a>
								)}
								{selectedAppointment.images && (
									<div>
										{selectedAppointment.images.map(
											(image) => (
												<img
													src={image}
													alt="image"
													className="w-32 h-32 object-cover"
												/>
											)
										)}
									</div>
								)}
							</div>
							<p>
								{format(
									parseISO(selectedAppointment.dateTime),
									"dd MMMM yyyy ",
									{
										locale: fr,
									}
								)}
							</p>
							<button
								onClick={handleCloseModal}
								className="bg-gray-50 px-4 py-2 rounded-lg mt-4 border border-gray-900/10 hover:bg-gray-100"
							>
								Fermer
							</button>
						</div>
					</div>
				)}
				<Modal
					open={open}
					okButtonProps={{
						className: "hidden",
					}}
					cancelButtonProps={{
						className: "hidden",
					}}
					onCancel={() => setOpen(false)}
					title="Reports"
				>
					<div>
						<UpdateDateClient rendezvousId={rendezVousToMod} />
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default DashboardClient;
