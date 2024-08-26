import React, { useEffect, useRef, useState } from "react";
import { Calendar, createCalendarController, CalendarEvent } from "./Calandar";
import moment from "moment";
import "moment/locale/fr"; // Import French locale
import { Modal, Upload, InputNumber, Popover, Select } from "antd";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Button from "./Button";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher } from "../axios";
import { User } from "./auth/protect";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student } from "../Students";
import Forfait from "../Forfait";
import { Monitor } from "../Moniteurs";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { Popconfirm, message, Image } from "antd";
import { File } from "buffer";
import Autocomplete from "./Autocomplete";
import MyCalendar from "../Scheduler";
// import "./assets/app.css";
import { AvailabiltyResult } from "./Availabilty";
import "moment/locale/fr";
import { CorpSetting } from "src/CorpSetting";

type Payload = {
	client: User;
	forfait?: Forfait;
	monitor?: Monitor;
	images?: object[];
	creneau?: string;
};

type Rendezvous = {
	creneau: string;
	id: string;
	title: string;
	dateTime: string;
	description: string | null;
	client: User;
	forfait?: Forfait;
	monitor?: Monitor;
	images?: { filename: string; rendezVousId: string }[];
	// payload: Payload;
	isActivated: boolean;
	payload: any;
	creator: string;
};

function AddRendezvous({ onConfirm, data, date }) {
	const [events, setEvents] = useState<
		(CalendarEvent<Payload> & {
			id: string;
			creneau: string;
			relationKey: string;
			isActivated: boolean;
			creator: string;
		})[]
	>([]);

	const calendarController = createCalendarController<Payload>();

	calendarController.subscribe({
		eventsListner(events) {
			setEvents(events as any);
		},
		// dateListner(date) {
		//   setDate(date);
		// },
	});

	const forEditRdv = data;

	return (
		<div className="w-full h-full">
			<div className=""></div>
			<EventDisplay
				events={events}
				onEventAdded={() => {
					//   refetch();
					onConfirm();
				}}
				date={date}
				forEditRdv={forEditRdv}
			/>
		</div>
	);
}

export default AddRendezvous;

const addRendezVousSchema = z.object({
	title: z.string(),
	description: z.string(),
});

function EventDisplay({
	events,
	forEditRdv,
	date,
	onEventAdded,
}: {
	events: (CalendarEvent<Payload> & {
		id: string;
		creneau: string;
		isActivated: boolean;
		creator: string;
	})[];
	onEventAdded?: () => void;
	date: moment.Moment;
	forEditRdv: any;
}) {
	const [createEventModalVisible, setCreateEventModalVisible] =
		useState(false);
	const [horairesModalVisible, setHorairesModalVisible] = useState(false); // New state for the "Horaires" modal

	const [horairesAgendaModalVisible, setHorairesAgendaModalVisible] =
		useState(false); // New state for the "Horaires" modal
	const [horairesAsapModalVisible, setHorairesAsapModalVisible] =
		useState(false);

	const [output, setOutput] = useState(false);
	const handleDataFromChildAgenda2 = (event: any) => {
		setOutput(event);
	};

	const handleHorairesModalClose = () => {
		setHorairesModalVisible(false);
	};

	const handleHorairesButtonClose2 = () => {
		setHorairesAgendaModalVisible(false);
	};
	useEffect(() => {
		if (output === true) {
			setHorairesAgendaModalVisible(false);
		}
	}, []);

	const [creneau, setCreneau] = useState<string>("");

	const handleDataFromChildAutocomplete = (id: string) => {
		setStudentId(id);
	};

	const handleDataFromChildAutocompleteMonitor = (id: string) => {
		setMonitorId(id);
	};
	const [valueForfait, setValueForfait] = useState<number>(0);

	const handleDataFromChildAutocompleteForfait = (id: string) => {
		setForfaitId(id);
		const op = forfaits?.find((forfait) => forfait.id === id);
		if (op) {
			const intermediate = parseInt(op?.heure);

			setValueForfait(intermediate);
		}
	};
	const handleHorairesButtonClick2 = () => {
		if (forfaitId !== "" && studentId !== "") {
			setAsap(false);
			setHorairesAgendaModalVisible(true);
		} else {
			message.error("Veuillez choisir un forfait et/ou un client");
		}
	};
	const [newCreneau, setNewCreneau] = useState<string>("");
	const [newDates, setNewDates] = useState<string>("");
	const [closeAgenda, setCloseAgenda] = useState(false); // New state for the "Horaires" modal
	const [autoMonitor, setAutoMonitor] = useState<string>("");
	const [isItReSchedule, setIsItReSchedule] = useState(false);

	const handleDataFromChildAgenda = (
		creneauToSend: string,
		dates: string,
		closed: boolean,
		reSchedule: boolean,
		idMonitorBef: string
	) => {
		setNewCreneau(creneauToSend);
		setNewDates(dates);
		setCloseAgenda(closed);
		setIsItReSchedule(reSchedule);
		setAutoMonitor(idMonitorBef);
	};

	useEffect(() => {
		if (closeAgenda) {
			setHorairesAgendaModalVisible(false);
		}
		setCloseAgenda(false);
	});

	const dataFromChild: Set<string> = new Set(creneau); // Assuming this is your data
	const stringDataFromChild: string = Array.from(dataFromChild)[0];
	const [isTrue, setIsTrue] = useState("false");
	useEffect(() => {
		if (stringDataFromChild) {
			setIsTrue("true");
		}

		if (isTrue === "true") {
			setHorairesModalVisible(false);
		}
	});
	const [monitorId, setMonitorId] = useState<string>("");
	const [imageObjects, setImageObjects] = useState<any[]>([]);
	const [delayedEventTitle, setDelayedEventTitle] = useState<string>("");
	const [delayedEventDescription, setDelayedEventDescription] =
		useState<string>(" ");

	useEffect(() => {
		setDelayedEventTitle(eventTitle);
		setDelayedEventDescription(eventDescription);
	});
	const { data, error, isLoading, mutate } = useSWR(
		`/users/availability/${monitorId}`,
		async (url) => {
			const result = await fetcher.get(url);
			const resultData = result.data as AvailabiltyResult;
			const availabilities = resultData.data.reduce(
				(acc: { [day: string]: { intervals: string[] } }, item) => {
					acc[item.day] = {
						intervals: item.intervals,
					};
					return acc;
				},
				{}
			);

			return availabilities;
		}
	);

	const days = moment(date).format("dddd");

	const traduireJourEnFrancais = (jourAnglais) => {
		const traductions = {
			Monday: "Lundi",
			Tuesday: "Mardi",
			Wednesday: "Mercredi",
			Thursday: "Jeudi",
			Friday: "Vendredi",
			Saturday: "Samedi",
			Sunday: "Dimanche",
		};

		// Vérifie si le jour anglais existe dans les traductions
		if (traductions.hasOwnProperty(jourAnglais)) {
			return traductions[jourAnglais];
		} else {
			return "Traduction non disponible";
		}
	};

	// Exemple d'utilisation
	const jourEnAnglais = days;
	const jourEnFrancais = traduireJourEnFrancais(jourEnAnglais);

	const [available, setAvailable] = useState("");
	const [daysC, setDaysC] = useState("");

	useEffect(() => {
		for (const day in data) {
			if (data.hasOwnProperty(day) && day === jourEnFrancais) {
				setDaysC(day);
				const concat = data[day].intervals[0].concat(
					data[day].intervals[1]
				);
				setAvailable(data[day].intervals[0]);
				// setKeyc((Math.random()*(1000-1)+1).toString());
			}
		}
	});

	const clientDecision = async (event) => {
		if (!studentId) {
			message.warning("Please select a student first.");
			return;
		} else {
			const relationKey = (Math.random() * (1000 - 1) + 1).toString();
			sendEmailToStudent(studentId, relationKey);
			const data = {
				title: delayedEventTitle || "",
				description: delayedEventDescription,
				clientId: studentId,
				forfaitId: forfaitId,
				monitorId: monitorId,
				relationKey: relationKey,
				images:
					fileList.map((file) => ({
						filename: file.name,
						rendezVousId: "",
					})) || [],
			};

			const response = await fetcher.post(
				"delayedrendezvous/create",
				data
			);
			if (response.status === 200) {
				setCreateEventModalVisible(false);
				message.success("Rendez-vous en attente créé avec succès.");
			} else {
				// Handle failure case
				message.error("Échec de la création d'un rendez-vous différé.");
			}
		}
	};

	const { trigger: createEvent } = useSWRMutation(
		`/rendezvous/create`,
		async (
			url,
			{
				arg: {
					title,
					description,
					date,
					clientId,
					forfaitId,
					monitorId,
				},
			}: {
				arg: {
					title: string;
					description: string;
					date: moment.Moment;
					clientId: string;
					forfaitId: string;
					creneau: string;
					monitorId?: string;
					images?: RcFile[];
				};
			}
		) => {
			for (let index = 0; index < imageObjects.length; index++) {
				let newFileList = imageObjects[index].filename;

				let fileListIndex = index % fileList.length; // Permet de faire une boucle sur fileList
				fileList[fileListIndex].name = newFileList;
			}
			if (!newDates) {
				return;
			}

			return await fetcher.post("/rendezvous/create", {
				title,
				description,
				dateTime: newDates,
				clientId: studentId,
				forfaitId,
				monitorId: monitorId ? monitorId : autoMonitor,
				creneau: newCreneau,
				images:
					fileList.map((file) => ({
						filename: file.name, // Provide the filename
						rendezVousId: "", // Provide the rendezVousId if applicable
					})) || [],
			});
		},
		{
			onSuccess: () => {
				if (!newDates) {
					message.error("Veuillez choisir une date");
				} else {
					message.success("Rendez-vous ajouté avec succès");
					setCreateEventModalVisible(false);
					window.location.reload();
				}

				onEventAdded?.();
			},
		}
	);

	const {
		data: students,
		isLoading: loadingStudents,
		error: errorStudents,
	} = useSWR(
		"/users/get/student",
		async (url) => {
			return (await fetcher.get(url)).data as Student[];
		},
		{
			onSuccess: (data) => {
				setStudentId(data[0].id);
			},
		}
	);

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
		mutate: refresh,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url))?.data as Monitor[];
	});

	const {
		data: forfaits,
		isLoading: loadingForfaits,
		error: errorForfaits,
	} = useSWR("/forfait/all", async (url) => {
		return (await fetcher.get(url))?.data as Forfait[];
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.infer<typeof addRendezVousSchema>>({
		resolver: zodResolver(addRendezVousSchema),
	});
	const [heureEtMinute, setHeureEtMinute] = useState<moment.Moment>(date);
	const [heure, setHeure] = useState(heureEtMinute.hour());
	const [minute, setMinute] = useState(heureEtMinute.minute());
	const [studentId, setStudentId] = useState<string | null>(null);
	// const [monitorId, setMonitorId] = useState<string | null>(null);
	const [forfaitId, setForfaitId] = useState<string | null>(null);
	const [isPastDate, setIsPastDate] = useState(false);
	const [eventTitle, setEventTitle] = useState("");
	const [eventDescription, setEventDescription] = useState("");

	const handleTitleChange = (event) => {
		setEventTitle(event.target.value);
	};
	const handleDescriptionChange = (event) => {
		setEventDescription(event.target.value);
	};

	useEffect(() => {
		setHeureEtMinute(date);
		setHeure(date.hour());
		setMinute(date.minute());
	}, [date.hour(), date.minute()]);

	useEffect(() => {
		if (date.isBefore(moment())) {
			setIsPastDate(true);
		} else {
			setIsPastDate(false);
		}
	}, [date]);

	useEffect(() => {
		if (date.startOf("day").isBefore(moment().startOf("day"))) {
			setIsPastDate(true);
		} else {
			setIsPastDate(false);
		}
	}, [date]);

	// Add this function in the EventDisplay component or wherever you are managing events
	const handleDeleteEvent = async (eventId: string) => {
		try {
			await fetcher(`/rendezvous/desactivate/${eventId}`, {
				method: "PATCH",
			});
			onEventAdded?.();
		} catch (error) {
			console.error("Error deleting event:", error);
		}
	};

	// Add these state variables inside EventDisplay function
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");
	const [previewTitle, setPreviewTitle] = useState("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleCancel = () => setPreviewOpen(false);

	const handlePreview = async (file: UploadFile) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj as RcFile);
		}

		setPreviewImage(file.url || (file.preview as string));
		setPreviewOpen(true);
		setPreviewTitle(
			file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
		);
	};

	const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
		setFileList(newFileList);

	const getBase64 = (file: RcFile): Promise<string> =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	const [asap, setAsap] = useState(false);

	const handleLePlusVitePossibleClick = () => {
		setAsap(true);
		setHorairesAsapModalVisible(true);
	};
	const handleLePlusVitePossibleClickClose = () => {
		setHorairesAsapModalVisible(false);
	};

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [showConditionalSection, setShowConditionalSection] = useState(true);

	const handleEventClick = (event) => {
		// Add this line to log the entire event object

		setSelectedEvent(event);

		// Transform images to fileList format expected by antd Upload for display
		const fileList = event.images.map((img, index) => ({
			uid: -index.toString(),
			name: img.filename,
			status: "done", // Mark as done to show as uploaded
			url: `http://localhost:3000/api/images/${img.filename}`, // Adjust URL based on how you serve images
		}));

		setFileList(fileList);
		setIsModalVisible(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setSelectedEvent(null);
	};

	const sendEmailToStudent = async (studentId, relationKey) => {
		if (!studentId) {
			message.warning("Please select a student first.");
			return;
		}

		if (!students || students.length === 0) {
			message.warning("Student data is not available");
			return;
		}

		const student = students.find((s) => s.id === studentId);
		if (!student) {
			message.warning("Student not found");
			return;
		}

		try {
			const response = await fetcher.post(
				"/rendezvous/send-mail-to-student",
				{
					email: student.email,
					available: available || "", // Ensure title is defined and fallback to an empty string if not
					days: daysC,
					date: date || "",
					key: (Math.random() * (1000 - 1) + 1).toString(),
					relationKey: relationKey,
				}
			);

			if (response.status === 200) {
				message.success("E-mail envoyé avec succès à " + student.email);
			} else {
				console.error("Failed to send email.");
				message.warning("Veuillez choisir un client");
			}
		} catch (error) {
			console.error("Error sending email:", error);
			message.error("Adresse email introuvable");
		}
	};

	const handleUpload = async () => {
		const formData = new FormData();
		if (fileList && fileList.length > 0) {
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				if (file.originFileObj) {
					formData.append("files", file.originFileObj);
				}
			}
		}
		try {
			const response = await fetcher.post("/uploads", formData);
			return response?.data;
		} catch (error) {
			console.error("Error uploading files:", error);
		}
	};

	const [selectedHour, setSelectedHour] = useState<number | null>(null);
	const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

	// AUTOCOMPLETE//////////////////////////////////////////////////
	const [setting, setSetting] = useState(1);

	const {
		data: settings,
		isLoading: loadingSettings,
		error: errorSettings,
		mutate: refreshSettings,
	} = useSWR("/CorpSetting/get/corpsetting", async (url) => {
		const SettingData = (await fetcher.get(url)).data as CorpSetting[];

		return SettingData;
	});

	useEffect(() => {
		if (settings && settings.length > 0) {
			if (settings[0].corpData > 0) {
				setSetting(settings[0].corpData);
			}
		}
	}, [settings]);

	const [namesData, setNamesData] = useState<string[]>([]);
	const [idData, setIdData] = useState<string[]>([]);
	const [namesDataMonitor, setNamesDataMonitor] = useState<string[]>([]);
	const [idDataMonitor, setIdDataMonitor] = useState<string[]>([]);
	const [namesDataForfait, setNamesDataForfait] = useState<string[]>([]);
	const [idDataForfait, setIdDataForfait] = useState<string[]>([]);
	const [hoursForfait, setHoursForfait] = useState<string[]>([]);
	const [availabilities, setAvailabilities] = useState<{
		[id: string]: AvailabiltyResult;
	}>({});

	const [filteredInstances, setFilteredInstances] = useState<any>([]);
	const [phoneDataMonitor, setPhoneDataMonitor] = useState<string[]>([]);
	const [addressDataClient, setAddressDataClient] = useState<string[]>([]);

	useEffect(() => {
		const fetchAndSetAvailability = async (id: string) => {
			try {
				const { data: availabilityData } = await fetcher.get(
					`/users/availability/${id}`
				);
				setAvailabilities((prevAvailabilities) => ({
					...prevAvailabilities,
					[id]: availabilityData,
				}));
			} catch (error) {
				console.error(
					`Erreur lors de la récupération des disponibilités pour le moniteur ${id}:`,
					error
				);
			}
		};

		if (monitors) {
			Promise.all(
				monitors.map((monitor) => fetchAndSetAvailability(monitor.id))
			).catch((error) =>
				console.error(
					"Erreur lors de la récupération des disponibilités pour les moniteurs:",
					error
				)
			);
		}
	}, [monitors]);

	useEffect(() => {
		const dayAllowed = Object.entries(availabilities)?.filter(
			([_, availability]) =>
				availability.data.some((slot) => slot.day === jourEnFrancais)
		);
		const disponibilitesMercredi = dayAllowed?.map(([id]) => String(id));

		const instances = monitors?.filter((instance) =>
			disponibilitesMercredi.includes(instance.id)
		);

		setFilteredInstances(instances);
	}, [availabilities, monitors, jourEnFrancais]);

	useEffect(() => {
		if (students) {
			const fullNames = students.map(
				(student) => `${student.lastname} ${student.name}`
			);
			setNamesData(fullNames);
			const ids = students.map((student) => student.id);
			setIdData(ids); // Utiliser setIdData pour mettre à jour idData avec les IDs récupérés
			const adresseClients = students.map((student) => student.address);
			setAddressDataClient(adresseClients);
		}
	}, [students]);

	useEffect(() => {
		if (monitors) {
			const fullNames = monitors.map(
				(monitor) => `${monitor.lastname} ${monitor.name}`
			);

			setNamesDataMonitor(fullNames);
			const ids = monitors.map((monitor) => monitor.id);
			setIdDataMonitor(ids); // Utiliser setIdData pour mettre à jour idData avec les IDs récupérés

			const phoneNumbers = monitors.map(
				(monitor) => "Tél.  " + monitor.phone
			);
			setPhoneDataMonitor(phoneNumbers);
		}
	}, [monitors, filteredInstances]);

	useEffect(() => {
		if (forfaits) {
			// const filteredForfaits = forfaits.filter(item => parseInt(item.heure) <= setting);
			const fullNames = forfaits.map((forfait) => `${forfait.name}`);

			setNamesDataForfait(fullNames);
			const ids = forfaits.map((forfait) => forfait.id);
			setIdDataForfait(ids);
			const hoursForfaits = forfaits.map(
				(forfait) => "Temps d'intervenion:  " + forfait.heure
			);

			// setValueForfait(forfait.heure);
			// const detail = "Temps d'intervenion: " + hoursForfaits;
			setHoursForfait(hoursForfaits);
		}
	}, [forfaits, setting]);

	const [inputValue, setInputValue] = useState(0);
	const [selectValue, setSelectValue] = useState(" "); // Valeur initiale 'jours'

	const handleInputChange = (event) => {
		const newValue = event.target.value;
		// Vérifie si la nouvelle valeur est comprise entre 0 et 10
		if (newValue >= 0 && newValue <= 10) {
			setInputValue(newValue);
		}
	};

	const handleSelectChange = (event) => {
		setSelectValue(event.target.value);
	};

	const [defaultForfait, setDefaultForfait] = useState(0);

	useEffect(() => {
		if (forfaits) {
			const selectedForfait = forfaits.find(
				(forfait) => forfait.id === forfaitId
			);
			if (selectedForfait) {
				const forfaitHours = selectedForfait.heure;
				const NumberForfait = parseInt(forfaitHours);
				setDefaultForfait(NumberForfait);
			}
		}
	}, [forfaits, forfaitId]);

	const [forfaitToSend, setForfaitToSend] = useState(defaultForfait);

	const [heureForfait, setHeureForfait] = useState(0);
	const [minuteForfait, setMinuteForfait] = useState(0);
	const [heureEtMinuteForfait, setHeureEtMinuteForfait] = useState(0);

	const onChangeNewInter1 = (value) => {
		setHeureForfait(value);
	};

	const onChangeNewInter2 = (value) => {
		setMinuteForfait(value / 100);
	};

	useEffect(() => {
		const specialForfait = heureForfait + minuteForfait;
		setHeureEtMinuteForfait(specialForfait);
	});
	useEffect(() => {
		if (heureEtMinuteForfait > 0) {
			setForfaitToSend(heureEtMinuteForfait);
		} else {
			setForfaitToSend(defaultForfait);
		}
	}, [
		forfaitToSend,
		heureEtMinuteForfait,
		defaultForfait,
		heureForfait,
		minuteForfait,
	]);

	return (
		<>
			<form
				className="flex flex-col gap-2"
				onSubmit={handleSubmit(async (data) => {
					if (!studentId) {
						message.warning("Veuillez choisir un client");
						return;
					}
					if (!forfaitId) {
						message.warning("Veuillez choisir une intervention");
						return;
					}
					const uploadedImages = await handleUpload();
					setImageObjects(
						uploadedImages.map((image) => {
							return {
								filename: image.filename,
								rendezVousId: "",
							};
						})
					);
					createEvent({
						title: eventTitle,
						description: eventDescription,
						date: heureEtMinute,
						clientId: studentId,
						forfaitId: forfaitId,
						monitorId: monitorId,
						creneau: creneau,
						images: imageObjects,
					});
				})}
			>
				<div>
					<label htmlFor="titre">Titre Intervention*</label>
					<input
						type="text"
						className="w-full border border-gray-300 rounded-md p-2"
						{...register("title")}
						onChange={handleTitleChange}
					/>
				</div>
				<div>
					<label htmlFor="description">Commentaire</label>
					<textarea
						className="w-full border border-gray-300 rounded-md p-2"
						{...register("description")}
						onChange={handleDescriptionChange}
					/>
				</div>
				<div>
					<label>Client*</label>

					<Autocomplete
						suggestionsData={namesData}
						suggestionsInfo={addressDataClient}
						idData={idData}
						onDataFromChild={handleDataFromChildAutocomplete}
						defaultValue=" "
					/>
				</div>
				<div>
					<label>Employé*</label>

					<Autocomplete
						suggestionsData={namesDataMonitor}
						suggestionsInfo={phoneDataMonitor}
						idData={idDataMonitor}
						onDataFromChild={handleDataFromChildAutocompleteMonitor}
						defaultValue=" "
					/>
				</div>
				<div>
					<label>Intervention*</label>

					<Autocomplete
						suggestionsData={namesDataForfait}
						suggestionsInfo={hoursForfait}
						idData={idDataForfait}
						onDataFromChild={handleDataFromChildAutocompleteForfait}
						defaultValue=" "
					/>
				</div>
				{forfaitId && (
					<div>
						<div className="flex items-center gap-2">
							<p className="mb-1">
								Changer la durée de l'intervention uniquement
								pour ce rendez-vous ?{valueForfait}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<InputNumber
								className="w-16"
								min={0}
								max={10}
								defaultValue={valueForfait}
								onChange={onChangeNewInter1}
							/>
							<p>heures</p>
							<InputNumber
								className="w-16"
								min={0}
								max={50}
								defaultValue={0}
								step={5}
								onChange={onChangeNewInter2}
							/>
							<p>minutes</p>
						</div>
						{/* )} */}
					</div>
				)}
				<div>
					<label>Ajouter Des Photos</label>
					<Upload
						listType="picture-card"
						multiple={true}
						maxCount={10}
						fileList={fileList}
						onPreview={handlePreview}
						onChange={handleChange}
						customRequest={({ file, onSuccess }) => {
							setTimeout(() => {
								file && onSuccess && onSuccess("ok");
							}, 0);
						}}
					>
						{fileList.length >= 40 ? null : (
							<div>
								<PlusOutlined />
								<div style={{ marginTop: 8 }}>Upload</div>
							</div>
						)}
					</Upload>
					<div></div>
					<label>
						À partir de quelle heure souhaitez-vous le prendre
						rendez-vous?*
					</label>
					<div className="flex flex-row gap-2 items-center">
						<select
							value={heure}
							onChange={(e) => {
								const selectedHour = parseInt(e.target.value);
								setSelectedHour(selectedHour);

								setHeure(selectedHour);
								setHeureEtMinute(
									heureEtMinute.hour(parseInt(e.target.value))
								);
							}}
							className="border border-gray-300 rounded-md p-2"
						>
							{Array.from({ length: 24 }).map((_, index) => (
								<option key={index} value={index}>
									{
										// display 0 as 00
										index.toString().padStart(2, "0")
									}
								</option>
							))}
						</select>

						<select
							value={minute}
							onChange={(e) => {
								const selectedMinute = parseInt(e.target.value);
								setSelectedMinute(selectedMinute);
								setMinute(parseInt(e.target.value));
								setHeureEtMinute(
									moment(heureEtMinute).minute(
										parseInt(e.target.value)
									)
								);
							}}
							className="border border-gray-300 rounded-md p-2"
						>
							{Array.from({ length: 6 }).map((_, index) => {
								const minuteValue = index * 10; // Multiply index by 10 to get multiples of 10
								return (
									<option key={index} value={minuteValue}>
										{
											// display 0 as 00
											minuteValue
												.toString()
												.padStart(2, "0")
										}
									</option>
								);
							})}
						</select>
					</div>

					<div className="flex items-center gap-2 my-2">
						<Button
							type="button"
							onClick={handleLePlusVitePossibleClick}
						>
							Le plus vite possible
						</Button>

						<Modal
							className="modalStyle"
							destroyOnClose={true}
							// bodyStyle={{ height: 600, overflowY: "scroll" }}
							open={horairesAsapModalVisible}
							onCancel={handleLePlusVitePossibleClickClose}
							title="Le plus vite possible"
							okButtonProps={{
								className: "hidden",
							}}
							maskClosable={false}
							cancelButtonProps={{
								className: "hidden",
							}}
							closable={true}
							style={{ top: "10px", maxHeight: "95vh" }}
							footer={null}
							width={"85%"}
						>
							<MyCalendar
								reSchedule={false}
								asap={asap}
								monitorId={monitorId}
								forfait={forfaitToSend}
								onDataFromChild={handleDataFromChildAgenda}
								onDataFromChild2={handleDataFromChildAgenda2}
								date={date}
								limiterHours={selectedHour!}
								limiterMinutes={selectedMinute!}
								delay={selectValue}
								time={inputValue}
							/>

							<div className="flex justify-end"></div>
						</Modal>

						{showConditionalSection && (
							<>
								<span>Ou Dans</span>
								<input
									min={0}
									max={10}
									type="number"
									className="border border-gray-300 rounded-md p-1 text-s w-12"
									value={inputValue}
									onChange={handleInputChange}
								/>
								<select
									className="border border-gray-300 rounded-md p-2"
									value={selectValue}
									onChange={handleSelectChange}
								>
									<option
										value=" "
										className="text-s text-gray bg-gray-200"
									>
										Choisir
									</option>
									<option value="jours">jours</option>
									<option value="semaines">semaines</option>
								</select>
							</>
						)}
						{!showConditionalSection && (
							<Button
								type="button"
								onClick={() => setShowConditionalSection(true)}
							>
								Afficher les Options
							</Button>
						)}
					</div>
					{/* <DateDelay onThisDataFromChild={handleDelayedDateChange} /> */}
					<Modal
						destroyOnClose={true}
						open={previewOpen}
						title={previewTitle}
						footer={null}
						onCancel={handleCancel}
					>
						<img
							alt="example"
							style={{ width: "100%" }}
							src={previewImage}
						/>
					</Modal>
				</div>
				<div className="my-4">
					<div>
						{/* <Button type="button" onClick={handleHorairesButtonClick}>
                Je Choisis
              </Button> */}

						<Button
							type="button"
							onClick={handleHorairesButtonClick2}
						>
							Je Choisis agenda
						</Button>

						<Modal
							destroyOnClose={true}
							open={horairesModalVisible}
							onCancel={handleHorairesModalClose}
							okButtonProps={{
								className: "hidden",
							}}
							cancelButtonProps={{
								className: "hidden",
							}}
						>
							<div className="flex justify-end"></div>
						</Modal>

						<Modal
							className="modalStyle"
							destroyOnClose={true}
							open={horairesAgendaModalVisible}
							onCancel={handleHorairesButtonClose2}
							title="Agenda"
							okButtonProps={{
								className: "hidden",
							}}
							cancelButtonProps={{
								className: "hidden",
							}}
							style={{ top: "10px", maxHeight: "95vh" }}
							closable={true}
							footer={null}
							width={"65%"}
						>
							<div
								style={{ height: 900 }}
								className="h-64   scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
							>
								<MyCalendar
									reSchedule={false}
									forfait={forfaitToSend}
									asap={asap}
									monitorId={monitorId}
									onDataFromChild={handleDataFromChildAgenda}
									onDataFromChild2={
										handleDataFromChildAgenda2
									}
									date={date}
									limiterHours={selectedHour!}
									limiterMinutes={selectedMinute!}
									delay={selectValue}
									time={inputValue}
								/>
							</div>
						</Modal>

						<Button type="button" onClick={clientDecision}>
							Le Client Choisis
						</Button>
					</div>
					<div className="flex flex-row gap-1">
						<span>Créneau horaire :</span>
						<p className="bg-green-500 rounded-lg px-1">
							{newCreneau}
						</p>
					</div>
				</div>

				<Button type="submit" useStyle className="w-full m-0">
					Ajouter
				</Button>
			</form>
		</>
	);
}
