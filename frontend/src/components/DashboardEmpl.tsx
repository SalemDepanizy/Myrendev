import React, { useState, useEffect, ReactNode, Key } from "react";
import { useAuth } from "../lib/hooks/auth";
import useSWR from "swr";
import { fetcher } from "../axios";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { Select } from "antd";
const { Option } = Select;
const DashboardEmpl: React.FC = () => {
	const { user } = useAuth();
	const userId = user?.id;

	const {
		data: appointmentsData,
		error: appointmentsError,
		isLoading: appointmentsLoading,
	} = useSWR(`/rendezvous/get/byEmployee/${userId}`, async (url) => {
		const result = await fetcher.get(url);
		return result.data;
	});

	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
	const [requestedAppointment, setRequestedAppointment] = useState(false);
	const [showPastAppointments, setShowPastAppointments] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState("");
	const [events, setEvents] = useState<any[]>([]);
	const [closestEvent, setClosestEvent] = useState<any | null>(null);
	const [closestExpiredEvent, setClosestExpiredEvent] = useState<any | null>(
		null
	);
	const [isClicked, setIsClicked] = useState(false);

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
		return appointment.status === "pending"; // Votre logique pour déterminer si le rendez-vous est en attente de confirmation
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
		setIsClicked(!isClicked); // Mettre à jour l'état pour indiquer que le bouton a été cliqué
	};

	return (
		<div className="container">
			<div className="grid  grid-cols-2 gap-4 py-4">
				<div className="col-span-2 sm:col-span-1 bg-blue-200 p-4 rounded text-center">
					{/* Afficher uniquement l'événement le plus proche */}

					{/* <h2>Rendez-vous précédent</h2>
          {closestExpired && (
            <div key={closestExpired.id}>
              {closestExpired.title} -{" "}
              {format(parseISO(closestExpired.dateTime), "dd MMMM yyyy ", {
                locale: fr,
              })}
            </div>
          )} */}
				</div>
				<div className="col-span-2 sm:col-span-1 bg-green-200 p-4 rounded text-center">
					{/* Section pour les événements à venir */}
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

			<div className=" bg-gray-100 p-4 mx-auto w-full rounded ">
				{/* <h1 className="text-2xl font-bold mb-4">Dashboard de Rendez-vous</h1> */}

				<button onClick={handleRequestClick}>
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
							<div className="flex justify-end">
								<button
									onClick={handleAddAppointment}
									className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
								>
									envoyer
								</button>
								<button
									onClick={handleCloseRequestModal}
									className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
								>
									Annuler
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Filtres */}
				<div className="mb-4 flex flex-row items-center justify-evenly">
					<div className="flex  gap-2">
						{/* <button
                className={`border rounded-md p-2 m-2 bg-${isClicked ? 'green' : 'blue'}-500 text-white hover:bg-${isClicked ? 'green' : 'blue'}-600 focus:outline-none focus:ring focus:ring-${isClicked ? 'green' : 'blue'}-400`}
              onClick={handleClick }
            >
              Rendez-vous passés
            </button> */}
					</div>

					<div className="  ">
						{/* <label className="block text-gray-700">Sélectionner une entreprise :</label> */}
						<Select
							showSearch
							value={selectedCompany}
							style={{ width: 200 }}
							placeholder="Sélectionnez une entreprise"
							optionFilterProp="children"
							onChange={(value) => setSelectedCompany(value)}
							filterOption={(input, option) => {
								// Check if option is valid and has a 'children' property of type string
								if (
									option &&
									typeof option.children === "string"
								) {
									// Cast option.children to string to avoid 'never' type inference
									const childrenString =
										option.children as string;
									// Perform case-insensitive search
									return childrenString
										.toLowerCase()
										.includes(input.toLowerCase());
								}
								return false; // Return false for invalid or unexpected options
							}}
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
					{filteredAppointments.map((appointment) => (
						<div
							key={appointment.id}
							className="bg-white rounded-lg shadow-md p-4 relative"
						>
							{isPastAppointment(appointment.dateTime) ? (
								<span className="absolute top-2 right-2 bg-gray-500 w-4 h-4 rounded-full"></span>
							) : (
								<span className="absolute top-2 right-2 bg-green-500 w-4 h-4 rounded-full"></span>
							)}
							<h3 className="text-lg font-bold mb-2">
								{appointment.title}
							</h3>
							<p className="text-sm text-gray-600 ">
								Date:{" "}
								{format(
									parseISO(appointment.dateTime),
									"dd MMMM yyyy ",
									{
										locale: fr,
									}
								)}
							</p>
							<span className="text-sm ">
								Addresse : {appointment.client.address}{" "}
								{appointment.client.ville}{" "}
								{appointment.client.codePostal}
							</span>
							<span className="text-sm flex gap-2">
								Localisation:{" "}
								<a
									href={`https://www.google.com/maps?q=${encodeURIComponent(
										appointment.client.address +
											appointment.client.ville +
											appointment.client.codePostal
									)}`}
									target="_blank"
									className="w-6 "
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											stroke-linejoin="round"
											d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
										/>
										<path
											strokeLinecap="round"
											stroke-linejoin="round"
											d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
										/>
									</svg>
								</a>
							</span>

							<p>Entreprise : {appointment.enterpriseName}</p>

							{/* {!isPastAppointment(appointment.dateTime) && (
                <button
                  // onClick={() => handleCancelAppointment(appointment.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                  Annuler
                </button>
              )} */}
							<button
								onClick={() => handleDetailsClick(appointment)}
								className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 "
							>
								Détails
							</button>
						</div>
					))}
				</div>

				{/* Modal pour afficher les détails du rendez-vous sélectionné */}
				{selectedAppointment && (
					<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
						<div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
							<h2 className="text-xl font-bold mb-4">
								Détails du Rendez-vous
							</h2>
							<p className="text-lg font-bold">
								{selectedAppointment.title}
							</p>
							<p>
								Description : {selectedAppointment.description}
							</p>
							<p>
								Date:{" "}
								{format(
									parseISO(selectedAppointment.dateTime),
									"dd MMMM yyyy ",
									{
										locale: fr,
									}
								)}
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
							</div>

							<p>
								Adresse : {selectedAppointment.client.address}{" "}
								{selectedAppointment.client.codePostal}{" "}
								{selectedAppointment.client.ville}
							</p>
							<button
								onClick={handleCloseModal}
								className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-gray-600"
							>
								Fermer
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardEmpl;
