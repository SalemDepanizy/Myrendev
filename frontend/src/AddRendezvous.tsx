import { useEffect, useState } from "react";
import {
	Calendar,
	createCalendarController,
	CalendarEvent,
} from "./components/Calandar";
import moment from "moment";
import "moment/locale/fr"; // Import French locale
import { Modal, InputNumber, Popover, Select, Input } from "antd";
import { InboxOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import Button from "./components/Button";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher } from "./axios";
import { User } from "./components/auth/protect";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Student } from "./Students";
import Forfait from "./Forfait";
import { Monitor } from "./Moniteurs";
import type { UploadProps } from "antd/es/upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faAlignLeft,
	faBriefcase,
	faClock,
	faFileSignature,
	faInfoCircle,
	faCalendar,
	faPenToSquare,
	faTrash,
	faUser,
	faUserTie,
	faFile,
	faUserPlus,
	faEuroSign,
} from "@fortawesome/free-solid-svg-icons";
import { Popconfirm, message } from "antd";
import { File } from "buffer";
import Autocomplete from "./components/Autocomplete";
import MyCalendar from "./Scheduler";
import "./assets/app.css";
import { AvailabiltyResult } from "./components/Availabilty";
import "moment/locale/fr";
import { CorpSetting } from "src/CorpSetting";
import { useAuth } from "./lib/hooks/auth";
import AllInOneCalendar from "./components/allInOneCalendar";
import CorpCalendar from "./components/corpCalendar";
import { UploadRequestOption } from "rc-upload/lib/interface";
import Dragger from "antd/es/upload/Dragger";
import { Modal as AntModal } from "antd";
import { useNotification } from "./components/NotificationContext"; // Import the notification context
import SameTimeCalendar from "./components/SameTimeCalendar";
import Addstudents from "./Addstudents";

const { Option } = Select;

moment.locale("fr");

type Availabilities = {
	id: string;
	day: string;
	start: string;
	end: string;
	monitorId: string;
};

type Payload = {
	client: User;
	forfait?: Forfait;
	monitor?: Monitor;
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
	// payload: Payload;
	isActivated: boolean;
	payload: any;
	creator: string;
	isValid: boolean;
	enterpriseId: string;
};
interface APIFile {
	filename: string;
	originalFilename: string;
}

function AddRendezvous() {
	const [events, setEvents] = useState<
		(CalendarEvent<Payload> & {
			id: string;
			creneau: string;
			relationKey: string;
			isActivated: boolean;
			creator: string;
			isValid: boolean;
			rendezVousId: string;
		})[]
	>([]);

	const calendarController = createCalendarController<Payload>();
	const [date, setDate] = useState<moment.Moment>(moment());

	calendarController.subscribe({
		eventsListner(events) {
			setEvents(events as any);
		},
		dateListner(date) {
			setDate(date);
		},
	});

	const { data, mutate: refetch } = useSWR("/rendezvous/all", async (url) => {
		return ((await fetcher.get(url)).data as Rendezvous[]).map(
			(r) =>
				({
					id: r.id,
					title: r.title,
					date: moment(r.dateTime),
					description: r.description,
					creneau: r.creneau,
					isActivated: r.isActivated,
					start: new Date(r.dateTime),
					end: moment(r.dateTime).add(1, "hours").toDate(),
					resourceId: r.creneau,
					creator: r.creator,
					isValid: r.isValid,
					payload: {
						client: r.client,
						forfait: r.forfait,
						monitor: r.monitor,
					},
					enterpriseId: r.enterpriseId,
				} as CalendarEvent<Payload> & {
					id: string;
					creneau: string;
					isActivated: boolean;
					isValid: boolean;
				})
		);
	});

	const forEditRdv = data;

	return (
		<div className="w-full flex gap-5 container mx-auto py-5 px-5 md:px-0">
			<div className="flex-1 border border-gray-900/10 shadow-md hover:shadow-lg rounded-xl">
				<Calendar
					date={date}
					controller={calendarController}
					events={[...(data ?? [])]}
				/>
			</div>
			<div className="flex-1">
				<EventDisplay
					events={events}
					onEventAdded={() => {
						refetch();
					}}
					date={date}
					forEditRdv={forEditRdv}
				/>
			</div>
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
		isValid: boolean;
		rendezVousId: string;
	})[];
	onEventAdded?: () => void;
	date: moment.Moment;
	forEditRdv: any;
}) {
	const [newCreneau, setNewCreneau] = useState<string>("");
	const [newDates, setNewDates] = useState<string>("");
	const [closeAgenda, setCloseAgenda] = useState(false);
	const [autoMonitor, setAutoMonitor] = useState<string>("");
	const [isItReSchedule, setIsItReSchedule] = useState(false);
	const [automaticTitle, setAutomaticTitle] = useState<string>("");

	const [createEventModalVisible, setCreateEventModalVisible] =
		useState(false);
	const [editEventModalVisible, setEditEventModalVisible] = useState(false);
	const [horairesModalVisible, setHorairesModalVisible] = useState(false);
	const [horairesAgendaModalVisible, setHorairesAgendaModalVisible] =
		useState(false);
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
	const [monitorId, setMonitorId] = useState<string>("");

	useEffect(() => {
		if (output === true) {
			setHorairesAgendaModalVisible(false);
		}
	});

	const [creneau, setCreneau] = useState<string>("");
	const [monitorIds, setMonitorIds] = useState<string[]>([]);
	const [valueForfait, setValueForfait] = useState<number>(0);
	const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
	const [selectedInter, setSelectedInter] = useState<any>();
	const [clearInputValue, setClearInputValue] = useState(false);
	const [forfaitId, setForfaitId] = useState<string | null>(null);
	const [createClient, setCreateClient] = useState(false);
	let studentNameForAutoTitle;
	const handleDataFromChildAutocomplete = (id: string) => {
		setStudentId(id);
		const op = students?.find((stud) => stud.id === id);
		studentNameForAutoTitle = `${op?.name ?? ""} ${op?.lastname ?? ""}`;
		setAutomaticTitle(
			automaticTitle +
				" " +
				op?.name +
				" " +
				op?.lastname +
				" " +
				op?.ville +
				" " +
				op?.codePostal
		);
	};

	const handleDataFromChildAutocompleteForfait = (id: string) => {
		setForfaitId(id);

		const op = forfaits?.find((forfait) => forfait.id === id);

		setSelectedInter(op);
		setAutomaticTitle(automaticTitle + " " + op?.name);
		if (op) {
			const intermediate = parseFloat(op?.heure);
			const nbPeople = op?.numberOfPeople > 0 ? op?.numberOfPeople : 1;
			setValueForfait(intermediate);
			setNumberOfPeople(nbPeople);
		}
	};

	const handleDataFromChildAutocompleteMonitor = (
		id: string,
		index: number
	) => {
		const updatedMonitorIds = [...monitorIds];
		updatedMonitorIds[index] = id;
		setMonitorIds(updatedMonitorIds);
		if (updatedMonitorIds.length === 1) {
			setMonitorId(id);
		}
	};

	useEffect(() => {
		console.log("monitorId", monitorId);
		const verification = forfaits?.find(
			(forfait) => forfait.id === forfaitId
		);
		if (
			verification &&
			monitorId !== "" &&
			verification.monitorId !== null &&
			verification.monitorId !== monitorId
		) {
			setClearInputValue(true);
			setAutomaticTitle("");
		}
	}, [forfaitId, monitorId]);

	const [allMonitors, setAllMonitors] = useState(false);
	const [atThesameTime, setAtThesameTime] = useState(false);
	const [idAllInOne, setIdAllInOne] = useState<string>("");
	const [creneauAllInOne, setCreneauAllInOne] = useState<string>("");

	const handleDataFromChildForAllMonitors = (
		id: string,
		selectedDay: string,
		creneau: string,
		closed: boolean
	) => {
		setIdAllInOne(id);
		setNewDates(selectedDay);
		if (monitorId === "") {
			setCreneauAllInOne(creneau);
		}

		setAllMonitors(false);
		setHorairesAsapModalVisible(false);
		setHorairesAgendaModalVisible(false);
	};
	const [multipleMonitor, setMultipleMonitor] = useState<string[]>([]);

	const handleDataFromChildForSameTimeMonitor = (
		id: string,
		selectedDay: string,
		creneau: string,
		closed: boolean,
		monitorIds: string[]
	) => {
		setMultipleMonitor(monitorIds);
		setIdAllInOne(id);
		setNewDates(selectedDay);
		setCreneauAllInOne(creneau);
		setAtThesameTime(false);
		setHorairesAsapModalVisible(false);
	};

	const closeAllMonitors = () => {
		setAllMonitors(false);
		setAtThesameTime(false);
	};

	const handleHorairesButtonClick2 = () => {
		if (forfaitId === "" || studentId === "") {
			message.error("Veuillez choisir un forfait et/ou un client");
			return;
		}

		if (numberOfPeople > 1) {
			setAtThesameTime(true);
		} else {
			if (monitorId === "") {
				setAsap(false);
				setAllMonitors(true);
			} else {
				setHorairesAgendaModalVisible(true);
				setAsap(false);
			}
		}
	};

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
		setHorairesAsapModalVisible(false);
		setIsItReSchedule(reSchedule);
		setAutoMonitor(idMonitorBef);
	};

	const handleDataCorpCalendar = (dates: any, times: any) => {
		setNewCreneau(times);
		setNewDates(dates);
		setCloseAgenda(true);
	};

	useEffect(() => {
		if (closeAgenda) {
			setHorairesAgendaModalVisible(false);
			setOpenEditCalendar(false);
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

		if (traductions.hasOwnProperty(jourAnglais)) {
			return traductions[jourAnglais];
		} else {
			return "Traduction non disponible";
		}
	};

	const jourEnAnglais = days;
	const jourEnFrancais = traduireJourEnFrancais(jourEnAnglais);
	const [available, setAvailable] = useState<any>();
	const [daysC, setDaysC] = useState("");

	useEffect(() => {
		for (const day in data) {
			if (data.hasOwnProperty(day) && day === jourEnFrancais) {
				setDaysC(day);
				const availableToString = data[day].intervals.join(", ");
				setAvailable([data]);
			}
		}
	}, [data]);

	const clientDecision = async (event) => {
		if (!studentId || forfaitId === "" || monitorId === "") {
			message.warning(
				"Veuillez choisir un client, un forfait et un monitor"
			);

			return;
		} else {
			const relationKey = (Math.random() * (1000 - 1) + 1).toString();
			sendEmailToStudent(studentId, relationKey);
			const data = {
				title: eventTitle || "",
				description: eventDescription,
				clientId: studentId,
				dateTime: date,
				forfaitId: forfaitId,
				monitorId: monitorId,
				relationKey: relationKey,
				creneau: "",
				isValid: false,
			};

			const response = await fetcher.post("/rendezvous/create", data);
			if (response.status === 200) {
				setCreateEventModalVisible(false);
				message.success("Rendez-vous en attente créé avec succès.");
			} else {
				message.error("Échec de la création d'un rendez-vous différé.");
			}
		}
	};

	useEffect(() => {
		if (monitorId !== "") {
			setCreneauAllInOne("");
		}
	}, [monitorId]);

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
					isValid,
					files,
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
					isValid: boolean; // Inclure isValid en tant que type boolean
					files: File[]; // Taper explicitement les fichiers en tant que File[]
				};
			}
		) => {
			if (multipleMonitor.length > 0) {
				for (let monitorId of multipleMonitor) {
					const formData = new FormData();
					const fileUrls = await handleUpload();
					console.log("fileUrls1", fileUrls);

					formData.append("title", title || automaticTitle);
					formData.append("description", description);
					formData.append("dateTime", newDates);
					formData.append("clientId", clientId);
					formData.append("forfaitId", forfaitId);
					formData.append("monitorId", monitorId);
					formData.append("creneau", creneauAllInOne);
					// formData.append("isValid", Boolean(isValid).toString());

					if (fileUrls && fileUrls.length > 0) {
						fileUrls.forEach((fileUrl, index) => {
							formData.append(`filenames[${index}]`, fileUrl);
							formData.append(
								`originalnames[${index}]`,
								draggedFiles[index]?.name
							);
						});
					}

					await fetcher.post(url, formData);
				}
			} else {
				const formData = new FormData();
				const fileUrls = await handleUpload();
				console.log("fileUrls", fileUrls);

				formData.append("title", title || automaticTitle);
				formData.append("description", description);
				formData.append("dateTime", newDates);
				formData.append("clientId", clientId);
				formData.append("price", price);
				formData.append("forfaitId", forfaitId);
				formData.append(
					"monitorId",
					monitorId ? monitorId : idAllInOne
				);
				formData.append(
					"creneau",
					newCreneau ? newCreneau : monitorId ? "" : creneauAllInOne
				);
				// formData.append("isValid", Boolean(isValid).toString());

				files.forEach((file: File) => {
					formData.append(
						"files",
						file as unknown as Blob,
						file.name
					); // Double cast pour gérer la conversion de type
				});

				console.log("files", files);

				await fetcher.post(url, formData);
			}
		},
		{
			onSuccess: () => {
				if (!newDates) {
					message.error("Veuillez choisir une date");
				}
				if (creneauAllInOne === "" && monitorId === "") {
					message.error("Veuillez choisir un créneau");
				} else {
					message.success("Rendez-vous ajouté avec succès");
					setCreateEventModalVisible(false);
				}
			},
		}
	);

	const { trigger: updateEvent } = useSWRMutation(
		`/rendezvous/update`,
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
					rendezvousId,
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
					rendezvousId: string;
				};
			}
		) => {
			if (!newDates) {
				return;
			}

			return await fetcher.post("/rendezvous/update", {
				title,
				description,
				dateTime: newDates,
				clientId,
				forfaitId,
				monitorId,
				rendezvousId,
				creneau: newCreneau,
			});
		},
		{
			onSuccess: () => {
				if (!newDates) {
					message.error("Veuillez choisir une date");
				} else {
					message.success("Rendez-vous modifié avec succès");
					setEditEventModalVisible(false);
				}

				onEventAdded?.();
			},
		}
	);

	const {
		data: students,
		isLoading: loadingStudents,
		mutate: refetchStudents,
		error: errorStudents,
	} = useSWR("/users/get/student", async (url) => {
		return (await fetcher.get(url)).data as Student[];
	});

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

	const { data: availabilitiesAll, error: errorAvailabilitiesAll } = useSWR(
		"/users/get/availability/all",
		async (url) => {
			const response = await fetcher.get(url);
			return response.data as any[];
		}
	);

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

	const [defaultValue, setDefaultValue] = useState<any>();
	const [defaultTitle, setDefaultTitle] = useState<any>("");
	const [defaultDesc, setDefaultDesc] = useState<any>("");
	const [defaultName, setDefaultName] = useState<any>("");
	const [defaultMonitor, setDefaultMonitor] = useState<any>("");
	const [defaultMonitorId, setDefaultMonitorId] = useState<any>("");
	const [defaultValueForfait, setDefaultValueForfait] = useState<any>("");
	const [defaultValueForfaitId, setDefaultValueForfaitId] =
		useState<number>(0);
	const [defaultRendezVousId, setDefaultRendezVousId] = useState<any>("");
	const [openEditCalendar, setOpenEditCalendar] = useState(false);

	const closeeditCalendar = () => {
		setOpenEditCalendar(false);
		window.location.reload();
	};

	const handleEditEvent = async (e, eventId: string) => {
		e.stopPropagation();
		const value = forEditRdv?.filter((event) => event.id === eventId);
		if (value && value.length > 0) {
			setDefaultValue(value);
			setDefaultTitle(value[0].title);
			setDefaultDesc(value[0].description);
			setDefaultName(value[0].payload.client.id);
			setDefaultMonitor(value[0].payload.monitor.id);
			setDefaultValueForfait(value[0].payload.forfait.id);
			setDefaultRendezVousId(value[0].id);
			setEditEventModalVisible(true);
		}
	};

	const handleReSchedule = async (e, eventId: string) => {
		e.stopPropagation();
		const value = forEditRdv?.filter((event) => event.id === eventId);
		if (value && value.length > 0) {
			setDefaultMonitorId(value[0].payload.monitor.id);
			const forfaitValue = value[0].payload.forfait.heure;
			setDefaultValueForfaitId(parseInt(forfaitValue));
			setDefaultRendezVousId(value[0].id);
		}
		setOpenEditCalendar(true);
	};

	useEffect(() => {
		const fetchData = async () => {
			if (isItReSchedule) {
				try {
					const response = await fetcher.post(
						"/rendezvous/update-schedule",
						{
							dateTime: newDates,
							rendezvousId: defaultRendezVousId,
							creneau: newCreneau,
						}
					);

					// Handle response data here if needed
					window.location.reload();
				} catch (error) {
					// Handle any errors that occur during the API call
					console.error("Error updating schedule:", error);
				}
			}
		};

		// Call the fetchData function directly inside useEffect
		fetchData();
	}, [isItReSchedule, newDates, defaultRendezVousId, newCreneau]);

	// Add these state variables inside EventDisplay function
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewTitle, setPreviewTitle] = useState("");
	// const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleCancel = () => setPreviewOpen(false);
	const [asap, setAsap] = useState(false);

	const handleLePlusVitePossibleClick = () => {
		setAsap(true);
		setHorairesAsapModalVisible(true);
	};
	const handleLePlusVitePossibleClickClose = () => {
		setHorairesAsapModalVisible(false);
	};

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isModalVisibleFiles, setIsModalVisibleFiles] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [showConditionalSection, setShowConditionalSection] = useState(true);

	const handleEventClick = (event) => {
		// Add this line to log the entire event object
		setSelectedEvent(event);
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

		const minutes = Number(
			(forfaitToSend - Math.floor(forfaitToSend)).toFixed(2)
		);
		const hours = forfaitToSend.toFixed(0);
		const fullHours = Number(hours) + Number((minutes / 60) * 100);

		try {
			const response = await fetcher.post(
				"/rendezvous/send-mail-to-student",
				{
					email: student.email,
					available: available || "",
					days: daysC,
					date: date || "",
					key: (Math.random() * (1000 - 1) + 1).toString(),
					relationKey: relationKey,

					tempsInter: fullHours,
					options: numberDays
						? [
								dayMoment,
								maxSlots,
								confirmationChoice,
								numberDays,
								numberWeeks,
						  ]
						: "",

					staffIds: user ? [user?.id, monitorId] : "",
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
		if (!draggedFiles || draggedFiles.length === 0) return false;

		const formData = new FormData();
		draggedFiles.forEach((file) => {
			formData.append("files", file as unknown as Blob);
		});
		console.log("draggedFiles", draggedFiles);
		try {
			const res = await fetcher.post(
				"http://localhost:3000/uploads",
				formData
			);
			return res?.data;
		} catch (err) {
			console.error("Error uploading files", err);
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

	const dayMoment =
		settings && settings[0] ? String(settings[0].dayMoment) || "" : "";
	const maxSlots =
		settings && settings[0] ? String(settings[0].maxSlots) || "" : "";
	const confirmationChoice =
		settings && settings[0]
			? String(settings[0].confirmationChoice) || ""
			: "";
	const numberDays =
		settings && settings[0] ? String(settings[0].numberDays) || "" : "";
	const numberWeeks =
		settings && settings[0] ? String(settings[0].numberWeeks) || "" : "";

	// useEffect(() => {
	//   if (settings && settings.length > 0) {
	//     if (settings[0].corpData > 0) {
	//       setSetting(settings[0].corpData);
	//     }
	//   }
	// }, [settings]);

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
	const [loadingAvailabilities, setLoadingAvailabilities] = useState(true);
	const [filteredInstances, setFilteredInstances] = useState<any>([]);
	const [phoneDataMonitor, setPhoneDataMonitor] = useState<string[]>([]);
	const [addressDataClient, setAddressDataClient] = useState<string[]>([]);
	const [verif, setVerif] = useState<boolean>(false);
	const [ff, setff] = useState<any>();

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
			)
				.then(() => setLoadingAvailabilities(false))
				.catch((error) =>
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
			setVerif(false);
		}
	}, [students]);

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
			setVerif(false);
		}
	}, [forfaits, setting]);

	useEffect(() => {
		// chercher si l'intervention est assigné a quelq'un
		const cece = forfaits?.find((forfait) => forfait.id === forfaitId);
		const monitorDependOf = cece?.monitorId ?? "";
		let monitorForThisInter: string[] = [];
		monitorForThisInter.push(monitorDependOf);
		const activeMonitor = monitors?.filter(
			(monitor) => monitor.active === true
		);

		if (activeMonitor) {
			const fullNames = activeMonitor?.map(
				(monitor) => `${monitor.lastname} ${monitor.name}`
			);

			setNamesDataMonitor(fullNames);
			const ids = activeMonitor?.map((monitor) => monitor.id);
			setIdDataMonitor(ids); // Utiliser setIdData pour mettre à jour idData avec les IDs récupérés

			const phoneNumbers = activeMonitor?.map(
				(monitor) => "Tél.  " + monitor.phone
			);
			setPhoneDataMonitor(phoneNumbers);
			setVerif(true);
		}
		if (monitorForThisInter.length > 0) {
			const whichMonitor = activeMonitor?.find(
				(monitor) => monitor.id === monitorForThisInter[0]
			);
			if (whichMonitor) {
				setNamesDataMonitor([
					whichMonitor.name + " " + whichMonitor.lastname,
				]);
				setPhoneDataMonitor(["Tél.  " + whichMonitor.phone]);
				setIdDataMonitor([whichMonitor.id]);
			}
		}
	}, [monitors, filteredInstances, forfaitId]);

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

	const [forfaitToSend, setForfaitToSend] = useState<number>(valueForfait);

	// const [heureForfait, setHeureForfait] = useState(Number(valueForfait.toFixed(0)));

	const [heureForfait, setHeureForfait] = useState(Math.round(valueForfait));
	const [minuteForfait, setMinuteForfait] = useState(0);
	const [heureEtMinuteForfait, setHeureEtMinuteForfait] = useState(0);
	// useEffect(() => {
	//   setHeureForfait(Number(valueForfait.toFixed(0)));
	// }, [valueForfait]);

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
			setForfaitToSend(valueForfait);
		}
	}, [
		forfaitToSend,
		heureEtMinuteForfait,
		valueForfait,
		heureForfait,
		minuteForfait,
	]);

	const {
		data: dataClientsChoice,
		isLoading: loadingClientsChoice,
		error: errorClientsChoice,
	} = useSWR("/clientsChoice/get/confirmed/all", async (url) => {
		return (await fetcher.get(url))?.data as any[];
	});

	const [isChecked, setIsChecked] = useState(false);
	const [isCheckedExpired, setIsCheckedExpired] = useState(false);

	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
	};
	const handleCheckboxChangeExpired = () => {
		setIsCheckedExpired(!isCheckedExpired);
	};
	// const [isGrayBackground, setIsGrayBackground] = useState(false);

	const [modalAllRdvVisible, setModalAllRdvVisible] = useState(false);
	const [filterChecked, setFilterChecked] = useState(false);
	const [pendingAppointments, setPendingAppointments] = useState(false);

	const handleModalAllRdvVisible = () => {
		setModalAllRdvVisible(false);
	};

	const waitingAppointment = () => {
		setPendingAppointments(!pendingAppointments);
	};

	const handleFilterChange = () => {
		setFilterChecked(!filterChecked);
	};

	//Emplyee filter//
	const { user } = useAuth();

	const [selectedUser, setSelectedUser] = useState("");
	const url = `/users/get/ownership/owner/${user?.id}`; // Modifiez la seconde URL selon votre logique

	const {
		data: ownership,
		isLoading: loadingownership,
		error: errorownership,
	} = useSWR(url, async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

	const updateStatus = async (event) => {
		try {
			// Confirm the slot using the userId
			const Updaterdv = await fetcher.patch("rendezvous/update-status", {
				rendezvousId: event.id, // Use the actual date as needed
				clientId: event.payload.client.id,
			});

			if (Updaterdv.status === 200) {
				// setIsConfirmed(true);

				message.success("Rendez-vous confirmé avec succès !");
				window.location.reload();
			} else {
				message.error("Échec de la confirmation du rendez-vous.");
			}
		} catch (error) {
			console.error("Error during the slot confirmation process:", error);
			message.error(
				"Une erreur s'est produite lors de la confirmation du rendez-vous."
			);
		}
	};

	const [draggedFiles, setDraggedFiles] = useState<File[]>([]);

	const handleDraggerFileChange = (info: any) => {
		const { status } = info.file;
		if (status !== "uploading") {
		}
		if (status === "done") {
			setDraggedFiles((prevFiles) => [
				...prevFiles,
				info.file.originFileObj as File,
			]);
			message.success(`${info.file.name} file uploaded successfully.`);
		} else if (status === "error") {
			message.error(`${info.file.name} file upload failed.`);
		}
	};

	const draggerProps: UploadProps = {
		name: "files",
		multiple: true,
		onChange: handleDraggerFileChange,
		customRequest: (options: UploadRequestOption) => {
			const { file, onSuccess, onError } = options;
			setTimeout(() => {
				onSuccess?.("ok");
			}, 0);
		},
		onDrop(e) {},
	};

	const [selectedRendezVousFiles, setSelectedRendezVousFiles] = useState<
		APIFile[]
	>([]);

	const handleViewFiles = async (e, rendezVousId) => {
		setIsModalVisible(false);
		e.preventDefault();
		e.stopPropagation();
		try {
			const response = await fetch(
				`http://localhost:3000/rendezvous/api/files?rendezVousId=${rendezVousId}`
			);
			const text = await response.text(); // Get the raw text of the response

			const data = JSON.parse(text); // Parse the JSON from the text
			console.log("Parsed data:", data); // Log the parsed JSON

			setSelectedRendezVousFiles(data);
			setIsModalVisibleFiles(true);
		} catch (error) {
			console.error("Error fetching files:", error);
		}
	};

	const handleFileDownload = (filename: string) => {
		const fileUrl = `http://localhost:3000/api/multiple-images/${filename}`;
		const link = document.createElement("a");
		link.target = "_blank";
		link.href = fileUrl;
		link.download = filename;
		link.click();
	};

	const closeAddStudentModal = () => {
		setCreateClient(false);
	};
	const addClient = () => {
		setCreateClient(true);
	};
	const [correctDateToSend, setCorrectDateToSend] = useState<Date>(
		new Date()
	);
	const [price, setPrice] = useState<string>("");

	const dateToNewDate = date.toDate();
	dateToNewDate.setDate(dateToNewDate.getDate() + Number(0));
	useEffect(() => {
		const newDate = dateToNewDate; // Crée une nouvelle instance de Date
		if (selectValue === "jours") {
			newDate.setDate(newDate.getDate() + Number(inputValue));
		} else if (selectValue === "semaines") {
			newDate.setDate(newDate.getDate() + Number(inputValue) * 7);
		}

		setCorrectDateToSend(newDate);
	}, [selectValue, inputValue, date]);

	return (
		<>
			<Modal
				destroyOnClose={true}
				open={createEventModalVisible}
				onCancel={() => setCreateEventModalVisible(false)}
				title="Ajouter un rendez-vous"
				footer={[]}
				afterClose={() => window.location.reload()}
				width={750}
			>
				<form
					className="flex flex-col gap-3"
					onSubmit={handleSubmit(async (data) => {
						if (!forfaitId) {
							message.warning(
								"Veuillez choisir une intervention"
							);
							return;
						}

						createEvent({
							title: eventTitle,
							description: eventDescription,
							date: heureEtMinute,
							clientId: studentId || "",
							forfaitId: forfaitId,
							monitorId: monitorId,
							creneau: creneau,
							isValid: true,
							files: draggedFiles,
						});
					})}
				>
					<div>
						<label
							htmlFor="titre"
							className="block text-sm font-medium leading-6 text-gray-900"
						>
							Titre Intervention*
						</label>
						<input
							type="text"
							className="w-full border border-gray-300 rounded-lg p-2 mt-1"
							{...register("title")}
							onChange={handleTitleChange}
							defaultValue={automaticTitle}
						/>
					</div>
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium leading-6 text-gray-900"
						>
							Commentaire
						</label>
						<textarea
							className="w-full border border-gray-300 rounded-lg p-2 mt-1"
							{...register("description")}
							onChange={handleDescriptionChange}
							rows={3}
						/>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label
								id="inter"
								className="block text-sm font-medium leading-6 text-gray-900 mb-1"
							>
								Intervention*
							</label>
							<Autocomplete
								suggestionsData={namesDataForfait}
								suggestionsInfo={hoursForfait}
								idData={idDataForfait}
								onDataFromChild={
									handleDataFromChildAutocompleteForfait
								}
								defaultValue=" "
							/>
						</div>
						{forfaitId && (
							<div className="flex-1">
								<label
									id="employe"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Employé*
								</label>

								<Autocomplete
									suggestionsData={namesDataMonitor}
									suggestionsInfo={phoneDataMonitor}
									idData={idDataMonitor}
									onDataFromChild={
										handleDataFromChildAutocompleteMonitor
									}
									defaultValue=" "
									numnberOfPeople={numberOfPeople}
									clearInputValue={clearInputValue}
								/>
							</div>
						)}
					</div>
					{forfaitId && (
						<div>
							<div className="flex items-center gap-2">
								<p className="mb-1">
									Changer la durée de l'intervention
									uniquement pour ce rendez-vous ?
									{valueForfait}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<InputNumber
									className="w-16"
									min={0}
									max={10}
									placeholder={`${valueForfait.toFixed(0)}`}
									onChange={onChangeNewInter1}
								/>
								<p>heures</p>
								<InputNumber
									className="w-16"
									min={0}
									max={50}
									placeholder={`${
										Number(
											(
												valueForfait -
												Math.floor(valueForfait)
											).toFixed(2)
										) * 100
									}`}
									step={10}
									onChange={onChangeNewInter2}
								/>

								<p>minutes</p>
							</div>
						</div>
					)}

					<div>
						<label>
							À partir de quelle heure souhaitez-vous le prendre
							rendez-vous?*
						</label>
						<div className="flex flex-row gap-2 items-center">
							<select
								value={heure}
								onChange={(e) => {
									const selectedHour = parseInt(
										e.target.value
									);
									setSelectedHour(selectedHour);

									setHeure(selectedHour);
									setHeureEtMinute(
										heureEtMinute.hour(
											parseInt(e.target.value)
										)
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
									const selectedMinute = parseInt(
										e.target.value
									);
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
							{monitorId !== "" || !data ? (
								<MyCalendar
									reSchedule={false}
									asap={asap}
									monitorId={monitorId}
									forfait={forfaitToSend}
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
							) : (
								<AllInOneCalendar
									onDataFromChild={
										handleDataFromChildForAllMonitors
									}
									inter={forfaitToSend}
									delay={selectValue!}
									time={inputValue!}
									date={correctDateToSend}
									limiterHours={selectedHour!}
									limiterMinutes={selectedMinute!}
									// limit={limiter}
								/>
							)}

							<div></div>
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

					<div>
						<div>
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
								title="Je choisis agenda"
								okButtonProps={{
									className: "hidden",
								}}
								cancelButtonProps={{
									className: "hidden",
								}}
								style={{ top: "10px", maxHeight: "90vh" }}
								closable={true}
								footer={null}
								width={"65%"}
							>
								<div
									style={{ height: 900 }}
									className="h-64   scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
								>
									{forfaitToSend !== 0 && monitorId ? (
										<div>
											{data &&
											Object.keys(data).length > 0 ? (
												<div>
													<MyCalendar
														reSchedule={false}
														forfait={forfaitToSend}
														asap={asap}
														monitorId={monitorId}
														onDataFromChild={
															handleDataFromChildAgenda
														}
														onDataFromChild2={
															handleDataFromChildAgenda2
														}
														date={date}
														limiterHours={
															selectedHour!
														}
														limiterMinutes={
															selectedMinute!
														}
														delay={selectValue}
														time={inputValue}
													/>
												</div>
											) : (
												<div
													style={{ height: 890 }}
													className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
												>
													<AllInOneCalendar
														onDataFromChild={
															handleDataFromChildForAllMonitors
														}
														inter={forfaitToSend}
														delay={selectValue!}
														time={inputValue!}
														date={correctDateToSend}
														limiterHours={
															selectedHour!
														}
														limiterMinutes={
															selectedMinute!
														}
													/>
												</div>
											)}
										</div>
									) : (
										<div
											style={{ height: 800 }}
											className="h-64   scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
										>
											<CorpCalendar
												date={correctDateToSend}
												onDataFromChild={
													handleDataCorpCalendar
												}
											/>
										</div>
									)}
								</div>
							</Modal>

							<Button type="button" onClick={clientDecision}>
								Le Client Choisis
							</Button>
						</div>
						<div className="flex flex-row gap-1 mt-3">
							<span>Créneau horaire :</span>
							<p className=" rounded-lg px-1">
								{newCreneau || creneauAllInOne}
							</p>
						</div>
						{newCreneau || creneauAllInOne ? (
							<div>
								<label>Client*</label>
								<div className="flex gap-2">
									<div className="w-96 flex flex-col ">
										<Autocomplete
											suggestionsData={namesData}
											suggestionsInfo={addressDataClient}
											idData={idData}
											onDataFromChild={
												handleDataFromChildAutocomplete
											}
											defaultValue={" "}
										/>
									</div>
									<div className="flex py-2">
										<FontAwesomeIcon
											icon={faUserPlus}
											className="text-blue-400 cursor-pointer"
											onClick={addClient}
										/>
									</div>
								</div>
								<div>
									<label className="block ">Prix*</label>
									<div className="flex items-center space-x-2">
										<Input
											placeholder="Entrez le prix"
											className="w-36 mb-2 align-middle mt-2"
											onChange={(e) =>
												setPrice(e.target.value)
											}
										/>
										<FontAwesomeIcon icon={faEuroSign} />
									</div>
								</div>
							</div>
						) : (
							""
						)}
						<Modal
							onCancel={closeAddStudentModal}
							open={createClient}
							okButtonProps={{
								className: "hidden",
							}}
							cancelButtonProps={{
								className: "hidden",
							}}
						>
							<Addstudents
								onUserCreated={() => {
									closeAddStudentModal();
									refetchStudents();
								}}
								closeIt={() => {
									closeAddStudentModal();
									refetchStudents();
								}}
							/>
						</Modal>
						<div className="mt-3">
							<Dragger {...draggerProps}>
								<p className="ant-upload-drag-icon">
									<InboxOutlined />
								</p>
								<p className="ant-upload-text">
									Cliquez ou faites glisser le fichier dans
									cette zone pour le télécharger
								</p>
							</Dragger>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={() => setCreateEventModalVisible(false)}
							className="py-2 px-3 bg-gray-50 border border-gray-900/10 rounded-lg"
						>
							Annuler
						</button>
						<Button type="submit" useStyle className="">
							Ajouter
						</Button>
					</div>
				</form>
			</Modal>

			<Modal
				destroyOnClose={true}
				open={editEventModalVisible}
				onCancel={() => setEditEventModalVisible(false)}
				title="Editer un rendez-vous"
				okButtonProps={{
					className: "hidden",
				}}
			>
				<form
					className="flex flex-col gap-2"
					onSubmit={handleSubmit(async (data) => {
						// if (!studentId) {
						//   message.warning("Veuillez choisir un client");
						//   return;
						// }
						if (!forfaitId) {
							message.warning(
								"Veuillez choisir une intervention"
							);
							return;
						}
						if (!monitorId) {
							message.warning("Veuillez choisir un employé");
							return;
						}
						updateEvent({
							title: eventTitle || defaultTitle,
							description: eventDescription || defaultDesc,
							date: heureEtMinute,
							clientId: studentId || "",
							forfaitId: forfaitId,
							monitorId: monitorId,
							creneau: creneau,
							rendezvousId: defaultRendezVousId,
						});
					})}
				>
					<div>
						<label htmlFor="titre">Titre Intervention*</label>
						<input
							type="text"
							placeholder={defaultTitle}
							className="w-full border border-gray-300 rounded-md p-2"
							{...register("title")}
							onChange={handleTitleChange}
						/>
					</div>
					<div>
						<label htmlFor="description">Commentaire</label>
						<textarea
							placeholder={defaultDesc}
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
							defaultValue={defaultName}
						/>
					</div>
					<div>
						<label>Employé*</label>

						<Autocomplete
							suggestionsData={namesDataMonitor}
							suggestionsInfo={phoneDataMonitor}
							idData={idDataMonitor}
							onDataFromChild={
								handleDataFromChildAutocompleteMonitor
							}
							defaultValue={defaultMonitor}
						/>
					</div>
					<div>
						<label>Intervention*</label>

						<Autocomplete
							suggestionsData={namesDataForfait}
							suggestionsInfo={hoursForfait}
							idData={idDataForfait}
							onDataFromChild={
								handleDataFromChildAutocompleteForfait
							}
							defaultValue={""}
						/>
					</div>
					{forfaitId && (
						<div>
							<div className="flex items-center gap-2">
								<p className="mb-1">
									Changer la durée de l'intervention
									uniquement pour ce rendez-vous ?
								</p>
								{/* <input type="checkbox" onClick={handleShowInput}/> */}
							</div>
							{/* {showInput && ( */}
							<div className="flex items-center gap-2">
								<InputNumber
									className="w-16"
									min={0}
									max={10}
									placeholder={`${valueForfait.toFixed(0)}`}
									onChange={onChangeNewInter1}
								/>
								<p>heures</p>
								<InputNumber
									className="w-16"
									min={0}
									max={50}
									placeholder={`${
										Number(
											(
												valueForfait -
												Math.floor(valueForfait)
											).toFixed(2)
										) * 100
									}`}
									step={10}
									onChange={onChangeNewInter2}
								/>
								<p>minutes</p>
							</div>
							{/* )} */}
						</div>
					)}

					<div>
						{/* <label>Ajouter Des Photos</label>
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
            </Upload> */}

						{/* <div>
              <button
              
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                save
              </button>
            </div> */}
						{/* <div className="flex flex-col gap-2">hehe</div> */}
						<label>
							À partir de quelle heure souhaitez-vous le prendre
							rendez-vous?*
						</label>
						<div className="flex flex-row gap-2 items-center">
							<select
								value={heure}
								onChange={(e) => {
									const selectedHour = parseInt(
										e.target.value
									);
									setSelectedHour(selectedHour);

									setHeure(selectedHour);
									setHeureEtMinute(
										heureEtMinute.hour(
											parseInt(e.target.value)
										)
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
									const selectedMinute = parseInt(
										e.target.value
									);
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
								title="double View"
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
								{/* Add your availability table or content here */}
								<MyCalendar
									reSchedule={false}
									asap={asap}
									monitorId={monitorId}
									forfait={forfaitToSend}
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
										<option value="semaines">
											semaines
										</option>
									</select>
								</>
							)}
							{!showConditionalSection && (
								<Button
									type="button"
									onClick={() =>
										setShowConditionalSection(true)
									}
								>
									Afficher les Options
								</Button>
							)}
						</div>
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
										onDataFromChild={
											handleDataFromChildAgenda
										}
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
						Modifier
					</Button>
				</form>
			</Modal>

			<Modal
				className="modalStyle"
				destroyOnClose={true}
				open={openEditCalendar}
				onCancel={closeeditCalendar}
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
					reSchedule={true}
					forfait={defaultValueForfaitId}
					asap={asap}
					monitorId={defaultMonitorId}
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

			<Modal
				title="Multiple employer"
				className="modalStyle"
				destroyOnClose={true}
				open={atThesameTime}
				onCancel={closeAllMonitors}
				cancelButtonProps={{
					hidden: true,
				}}
				okButtonProps={{
					hidden: true,
				}}
				style={{ top: "1px", maxHeight: "90vh" }}
				closable={true}
				width={"90%"}
			>
				<div
					// style={{ height: 600 }}
					className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
				>
					<div className="">
						<SameTimeCalendar
							onDataFromChild={
								handleDataFromChildForSameTimeMonitor
							}
							inter={forfaitToSend}
							numberOfPeople={numberOfPeople}
							monitorArray={monitorIds}
							intervention={selectedInter}
						/>
					</div>
				</div>
			</Modal>

			<Modal
				title="multiple collaborateur"
				className="modalStyle"
				destroyOnClose={true}
				open={allMonitors}
				onCancel={closeAllMonitors}
				cancelButtonProps={{
					hidden: true,
				}}
				okButtonProps={{
					hidden: true,
				}}
				style={{ top: "1px", maxHeight: "90vh" }}
				closable={true}
				width={"90%"}
			>
				<div
					style={{ height: 890 }}
					className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
				>
					<AllInOneCalendar
						onDataFromChild={handleDataFromChildForAllMonitors}
						inter={forfaitToSend}
						delay={selectValue!}
						time={inputValue!}
						date={correctDateToSend}
						limiterHours={selectedHour!}
						limiterMinutes={selectedMinute!}
					/>
				</div>
			</Modal>

			<div className="showoff0 col-span-3 col-start-6 bg-white h-fit p-3 rounded-xl shadow-md border border-gray-900/10 flex flex-col gap-2">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col justify-between">
						<div className="flex flex-row justify-between items-center border-gray-200 pb-2 mb-2">
							<div className="text-xl font-semibold">
								Rendez-vous
							</div>
							<div className="text-sm text-gray-500">
								{date.format("DD MMM YYYY")}
							</div>
							<div className="text-sm text-gray-500">
								{events.length} rendez-vous
							</div>
						</div>

						<div className="flex flex-row flex-wrap justify-between">
							<span
								className="text-sm text-gray-500 cursor-pointer underline"
								onClick={handleFilterChange}
							>
								filtrer
							</span>
							<span
								className={`text-sm cursor-pointer underline ${
									pendingAppointments
										? "text-blue-500"
										: "text-gray-500"
								}`}
								onClick={waitingAppointment}
							>
								rendez-vous en attentes
							</span>
						</div>

						<div className="wrap flex flex-col gap-2">
							<div className="flex flex-row gap-1">
								<div className="flex flex-row gap-1">
									<p className="text-sm text-gray-500">
										rendez-vous expiré
									</p>
									<input
										type="checkbox"
										checked={isCheckedExpired}
										onChange={handleCheckboxChangeExpired}
									/>
								</div>
								<div className="flex flex-row gap-1">
									<p className="text-sm text-gray-500">
										rendez-vous supprimer
									</p>
									<input
										type="checkbox"
										checked={isChecked}
										onChange={handleCheckboxChange}
									/>
								</div>
							</div>
							<Select
								showSearch
								// defaultValue={ dates.length>0 ? defaultValue.name:""}
								value={selectedUser}
								style={{ width: 200 }}
								placeholder="Sélectionnez une entreprise"
								optionFilterProp="children"
								onChange={(value) => setSelectedUser(value)}
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
							>
								<Option value="">{"Tous"}</Option>
								{ownership
									? Array.from(
											new Map(
												ownership
													?.filter(
														(appointment) =>
															appointment.id &&
															appointment.user &&
															appointment.user
																.type ===
																"MONITOR"
													) // Ensure id and user exist
													.map((appointment) => [
														appointment.user.id,
														appointment.user,
													]) // Map user id to user
											).values() // Get unique user values
									  ).map((user) => (
											<Option
												key={user.id}
												value={user.id}
											>
												{user.name}
											</Option>
									  ))
									: "Sélectionner"}
							</Select>
						</div>
					</div>
					{!isPastDate && (
						<Button
							onClick={() => setCreateEventModalVisible(true)}
							useStyle
							className="w-full m-0"
						>
							Ajouter un rendez-vous
						</Button>
					)}
				</div>
				<div className="flex flex-col gap-2 overflow-y-auto h-[450px]">
					{events
						.sort((a, b) => b.date.valueOf() - a.date.valueOf())
						.filter((event) => {
							if (event.isActivated === true) {
								return pendingAppointments
									? (event.creneau === "" &&
											!event.isValid) ||
											!event.isValid
									: event.isValid;
							} else if (
								!isChecked &&
								event.isActivated === false
							) {
								return pendingAppointments
									? !event.isValid ||
											(event.creneau === "" &&
												!event.isValid)
									: event.isValid;
							} else {
								return true;
							}
						})
						.filter((event) => {
							const dateReference = new Date();
							const eventDates = event.date.toDate();
							const eventMonitorId = event.payload.monitor?.id;
							const eventIsExpired = isCheckedExpired
								? eventDates > dateReference
								: true;
							const eventIsHidden =
								(eventIsExpired &&
									eventDates < dateReference &&
									event.creneau !== "") ||
								(selectedUser &&
									selectedUser !== eventMonitorId);

							if (isCheckedExpired) {
								// Si on affiche les expirés, on cache les événements non expirés
								return (
									isCheckedExpired === !eventIsExpired &&
									!eventIsHidden
								);
							} else {
								// Si on n'affiche pas les expirés, on cache les événements expirés
								return eventIsExpired && !eventIsHidden;
							}
						})
						.map((event, index) => {
							return (
								<div
									key={index}
									className={`flex flex-col gap-2 p-3  shadow-md rounded-lg`}
								>
									<div className="flex flex-col space-y-1">
										<div
											className={`flex flex-col p-3 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out relative`}
											onClick={() =>
												handleEventClick(event)
											}
										>
											<div className="flex justify-between items-center">
												<span className="font-semibold text-gray-800">
													Titre: {event.title}
												</span>
												<span className="text-sm text-gray-500">
													{event.date.format(
														"DD MMM YYYY"
													) +
														" entre " +
														event.creneau}
												</span>
											</div>
											{event.description && (
												<div className="text-sm text-gray-600 mt-2">
													<FontAwesomeIcon
														icon={faInfoCircle}
														className="mr-2 text-blue-500"
													/>
													Commentaire:{" "}
													{event.description}
												</div>
											)}
											<div className="text-sm text-gray-600 mt-1">
												<FontAwesomeIcon
													icon={faUser}
													className="mr-2 text-green-500"
												/>
												Client:{" "}
												{event.payload.client.lastname}{" "}
												{event.payload.client.name}
											</div>
											<div className="text-sm text-gray-600 mt-1">
												<FontAwesomeIcon
													icon={faUser}
													className="mr-2 text-green-500"
												/>
												Client:{" "}
												<a
													href={`mailto:${event.payload.client.email}`}
												>
													{event.payload.client.email}
												</a>
											</div>
											{event.payload.forfait && (
												<div className="text-sm text-gray-600 mt-1">
													<FontAwesomeIcon
														icon={faBriefcase}
														className="mr-2 text-purple-500"
													/>
													Intervention:{" "}
													{event.payload.forfait.name}
												</div>
											)}
											{event.payload.forfait && (
												<div className="text-sm text-gray-600 mt-1">
													<FontAwesomeIcon
														icon={faClock}
														className="mr-2 text-purple-500"
													/>
													Temps d'Intervention:{" "}
													{
														event.payload.forfait
															.heure
													}{" "}
													Heure
												</div>
											)}
											{event.payload.monitor && (
												<div className="text-sm text-gray-600 mt-1">
													<FontAwesomeIcon
														icon={faUserTie}
														className="mr-2 text-red-500"
													/>
													Employé:{" "}
													{event.payload.monitor.name}
													{
														event.payload.monitor
															.lastname
													}
												</div>
											)}
											{event.creneau && (
												<div className="text-sm text-gray-600 mt-1">
													<FontAwesomeIcon
														icon={faUserTie}
														className="mr-2 text-red-500"
													/>
													Créneau: {event.creneau}{" "}
													{/* {event.payload.monitor.lastname} */}
												</div>
											)}
											{event.creator && (
												<div className="text-sm text-gray-600 mt-1">
													<FontAwesomeIcon
														icon={faUserTie}
														className="mr-2 text-red-500"
													/>
													Créateur: {event.creator}{" "}
													{/* {event.payload.monitor.lastname} */}
												</div>
											)}
											<div className="mt-3 w-full flex justify-end gap-3">
												{event.isValid === false &&
													event.creneau !== "" && (
														<div>
															<button
																className="bg-blue-500 text-white px-1 rounded-lg"
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	updateStatus(
																		event
																	);
																}}
															>
																confirmer
															</button>
														</div>
													)}
												<div></div>
												<AntModal
													title="Files Associated with Rendezvous"
													open={isModalVisibleFiles}
													onCancel={(e) => {
														e.stopPropagation();
														e.preventDefault();
														setIsModalVisibleFiles(
															false
														);
													}}
													footer={[
														<Button
															key="close1"
															onClick={(e) => {
																e.stopPropagation();
																setIsModalVisibleFiles(
																	false
																);
															}}
														>
															Close
														</Button>,
													]}
												>
													{/* Render the files */}
													<ul>
														{selectedRendezVousFiles.map(
															(file, index) => (
																<li key={index}>
																	<button
																		className="text-blue-500 hover:text-blue-700"
																		onClick={() =>
																			handleFileDownload(
																				file.filename
																			)
																		}
																	>
																		{
																			file.originalFilename
																		}
																	</button>
																</li>
															)
														)}
													</ul>
												</AntModal>
												<Popconfirm
													title="Supprimer"
													description="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?"
													onConfirm={() => {
														handleDeleteEvent(
															event.id
														);
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
													okText={
														<span className="text-red-500">
															Oui
														</span>
													}
													cancelText="Non"
												>
													<FontAwesomeIcon
														icon={faTrash}
														className="order-2 text-red-500 cursor-pointer hover:text-red-600"
														onClick={(e) =>
															e.stopPropagation()
														} // Prevent click from bubbling to the parent elements
													/>
												</Popconfirm>

												<Popover content="modifier">
													<FontAwesomeIcon
														className=""
														icon={faPenToSquare}
														onClick={(e) =>
															handleEditEvent(
																e,
																event.id
															)
														}
													/>
												</Popover>
												<Popover content="files">
													<FontAwesomeIcon
														icon={faFile}
														className="text-blue-500 cursor-pointer"
														onClick={(e) => {
															handleViewFiles(
																e,
																event.id
															);
														}}
													/>
												</Popover>
												<Popover content="reprogrammé">
													<FontAwesomeIcon
														onClick={(e) =>
															handleReSchedule(
																e,
																event.id
															)
														}
														className=""
														icon={faCalendar}
													/>
												</Popover>
											</div>
										</div>

										<Modal
											title={
												<span
													style={{
														fontSize: "1.25rem",
														fontWeight: "bold",
													}}
												>
													Détails Du Rendez-Vous
												</span>
											}
											open={isModalVisible}
											onCancel={closeModal}
											footer={[
												<Button
													key="close"
													onClick={closeModal}
													style={{
														backgroundColor:
															"#4CAF50",
														color: "white",
														borderRadius: "5px",
													}}
												>
													Close
												</Button>,
											]}
											style={{ top: 20 }}
										>
											{selectedEvent && (
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "10px",
													}}
												>
													<div className="flex items-center gap-2">
														<FontAwesomeIcon
															icon={
																faFileSignature
															}
															className="text-blue-500"
														/>
														<span className="font-semibold">
															Titre Intervention:{" "}
														</span>
														<span>
															{event.title}
														</span>
													</div>

													<div>
														<div className="general-info">
															{event.description && (
																<div className="flex items-center gap-2">
																	<FontAwesomeIcon
																		icon={
																			faAlignLeft
																		}
																		className="text-green-500"
																	/>
																	<span className="font-semibold">
																		Description:{" "}
																	</span>
																	<span>
																		{
																			event.description
																		}
																	</span>
																</div>
															)}
															{event.creneau && (
																<div className="flex items-center gap-2">
																	<FontAwesomeIcon
																		icon={
																			faAlignLeft
																		}
																		className="text-green-500"
																	/>
																	<span className="font-semibold">
																		Créneau:{" "}
																	</span>
																	<span>
																		{
																			event.creneau
																		}
																	</span>
																</div>
															)}
															{event.creator && (
																<div className="flex items-center gap-2">
																	<FontAwesomeIcon
																		icon={
																			faAlignLeft
																		}
																		className="text-green-500"
																	/>
																	<span className="font-semibold">
																		Createur:{" "}
																	</span>
																	<span>
																		{
																			event.creator
																		}
																	</span>
																</div>
															)}
														</div>
														<div className="client-info">
															<div className="flex items-center gap-2">
																<FontAwesomeIcon
																	icon={
																		faUser
																	}
																	className="text-green-500"
																/>
																<span className="font-semibold">
																	Client:{" "}
																</span>
																<span>
																	{
																		event
																			.payload
																			.client
																			.name
																	}{" "}
																	{
																		event
																			.payload
																			.client
																			.lastname
																	}
																</span>
															</div>
															<div className="flex items-center gap-2">
																<FontAwesomeIcon
																	icon={
																		faUser
																	}
																	className="text-green-500"
																/>
																<span className="font-semibold">
																	Email du
																	client:{" "}
																</span>
																<span>
																	<a
																		href={`mailto:${event.payload.client.email}`}
																	>
																		{
																			event
																				.payload
																				.client
																				.email
																		}
																	</a>
																</span>
															</div>
															<div className="flex items-center gap-2">
																<FontAwesomeIcon
																	icon={
																		faUser
																	}
																	className="text-green-500"
																/>
																<span className="font-semibold">
																	Email du
																	client:{" "}
																</span>
																<span>
																	<a
																		href={`tel:${event.payload.client.phone}`}
																	>
																		{
																			event
																				.payload
																				.client
																				.phone
																		}
																	</a>
																</span>
															</div>
														</div>

														<div className="employee-info">
															{event.payload
																.monitor && (
																<div className="flex flex-col p gap-2">
																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faUserTie
																			}
																			className="text-red-500"
																		/>
																		<div className="">
																			<span className="font-semibold">
																				Employé:{" "}
																			</span>
																			<span>
																				{
																					event
																						.payload
																						.monitor
																						?.name
																				}{" "}
																				{
																					event
																						.payload
																						.monitor
																						?.lastname
																				}
																			</span>
																		</div>
																	</div>
																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faUserTie
																			}
																			className="text-red-500"
																		/>
																		<span className="font-semibold">
																			Email
																			de
																			l'employé:{" "}
																		</span>
																		<span>
																			<a
																				href={`mailto:${event.payload.monitor?.email}`}
																			>
																				{
																					event
																						.payload
																						.monitor
																						?.email
																				}
																			</a>
																		</span>
																	</div>

																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faUserTie
																			}
																			className="text-red-500"
																		/>
																		<span className="font-semibold">
																			Tél
																			employé:{" "}
																		</span>
																		<span>
																			<a
																				href={`tel:${event.payload.monitor?.phone}`}
																			>
																				{
																					event
																						.payload
																						.monitor
																						?.phone
																				}
																			</a>
																		</span>
																	</div>
																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faBriefcase
																			}
																			className="text-purple-500"
																		/>
																		<span className="font-semibold">
																			Intervention:{" "}
																		</span>
																		<span>
																			{
																				event
																					.payload
																					.forfait
																					?.name
																			}
																		</span>
																	</div>
																</div>
															)}
														</div>
														<div className="forfait-info">
															{event.payload
																.forfait && (
																<div className="flex flex-col gap-2">
																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faBriefcase
																			}
																			className="text-purple-500"
																		/>
																		<span className="font-semibold">
																			Durée
																			de
																			l'intervention:{" "}
																		</span>
																		<span>
																			{
																				event
																					.payload
																					.forfait
																					?.heure
																			}
																			h
																		</span>
																	</div>
																	<div className="flex items-center gap-2">
																		<FontAwesomeIcon
																			icon={
																				faBriefcase
																			}
																			className="text-purple-500"
																		/>
																		<span className="font-semibold">
																			Nombre
																			d'intervenants:{" "}
																		</span>
																		<span>
																			{
																				event
																					.payload
																					.forfait
																					?.numberOfPeople
																			}
																		</span>
																	</div>
																</div>
															)}
														</div>
													</div>
												</div>
											)}
										</Modal>
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</>
	);
}
