import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../axios/index";
import {
	Calendar,
	momentLocalizer,
	dateFnsLocalizer,
	Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import moment from "moment";
import "../assets/app.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fr } from "date-fns/locale";
import { Modal, Button, Input, Select, Popover, message } from "antd";
import Toolbar from "react-big-calendar/lib/Toolbar";

const { Option } = Select;

const locales = {
	fr,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

let formats = {
	dateFormat: "d",
	dayHeaderFormat: (date, culture, localizer) => {
		const formattedDate = localizer.format(
			date,
			"EEEE d MMMM yyyy",
			culture
		);
		return formattedDate;
	},
};
interface MonitorData {
	id: string;
	day: string;
	intervals: string[];
	monitor: {
		id: string;
		name: string;
		lastname: string;
		color: string;
	};
}

type User = {
	// Define your User type here
};

type Forfait = {
	// Define your Forfait type here
};

type Monitor = {
	id: string;
	name: string;
	lastname: string;
	color: string;
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
	count?: number;
};

function AllInOneCalendar({
	onDataFromChild,
	inter,
	delay,
	time,
	date,
	limiterHours,
	limiterMinutes,
}: {
	onDataFromChild: any;
	inter: any;
	delay: string;
	time: any;
	date: any;
	limiterHours: number;
	limiterMinutes: number;
}) {
	// const localizer = momentLocalizer(moment);

	const viewToDisplay =
		delay === "jours" ? "day" : delay === "semaines" ? "week" : "week";

	const [events, setEvents] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [formData, setFormData] = useState({
		role: "", // New field for the select
	});
	const [selectedValue, setSelectedValue] = useState(formData.role);
	const [selectedMonitors, setSelectedMonitors] = useState<Monitor[]>();

	// const [view, setView] = useState<string>("week");
	const [view, setView] = useState<string>(viewToDisplay);

	const [currentMonth, setCurrentMonth] = useState(moment().startOf("week"));
	const [selectedDay, setSelectedDay] = useState<string>("");
	const [creneau, setCreneau] = useState<string>("");
	const [chosenMonitor, setChosenMonitor] = useState<string>("");
	const [defaultDate, setDefaultDate] = useState<Date>(new Date(date));
	console.log("date", date);

	useEffect(() => {
		if (viewToDisplay) {
			setView(viewToDisplay);
		}
	}, [viewToDisplay]);

	const {
		data: monitorsAvailable,
		isLoading: loadingMonitorsAvailable,
		error: errorMonitorsAvailable,
		mutate: refreshMonitors,
	} = useSWR<MonitorData[]>("/users/get/availability/all", async (url) => {
		return (await fetcher.get(url))?.data;
	});
	const {
		data: monitorsSuperposition,
		isLoading: loadingmMnitorsSuperposition,
		error: errormMnitorsSuperposition,
	} = useSWR<any[]>("/disponibilite/get/superposition/all", async (url) => {
		return (await fetcher.get(url))?.data;
	});
	const mm = monitorsAvailable?.map((day) =>
		day.intervals.map((interval) => ({
			value: parseInt(interval.split(":")[0]),
		}))
	);

	const {
		data: monitors,
		mutate: refetchMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		const moni = (await fetcher.get(url)).data as any[];
		return moni;
	});

	const smallestNumber = mm?.reduce((min, day) => {
		const minValue = day.reduce((subMin, interval) => {
			return Math.min(subMin, interval.value);
		}, Infinity);

		return Math.min(min, minValue);
	}, Infinity);

	const vv = monitorsAvailable?.map((day) =>
		day.intervals.map((interval) => ({
			value: parseInt(interval.split("-")[1]),
		}))
	);

	const largestNumber = vv?.reduce((max, day) => {
		const maxValue = day.reduce((subMax, interval) => {
			return Math.max(subMax, interval.value);
		}, -Infinity);

		return Math.max(max, maxValue);
	}, -Infinity);

	const {
		data: rendezvousData,
		mutate: refetchRendezvous,
		error: errorRendezvous,
	} = useSWR("/rendezvous/all", async (url) => {
		const rendezvousArray = (await fetcher.get(url)).data as Rendezvous[];
		return rendezvousArray;
	});

	const minutes = Number((inter - Math.floor(inter)).toFixed(2));
	const hours = inter.toFixed(0);
	const fullHours = Number(hours) + Number((minutes / 60) * 100);

	const despues = fullHours || 1;

	const generateAvailabilityForMonth = (startDate) => {
		if (monitorsAvailable && rendezvousData) {
			const dayMapping = {
				Lundi: "Monday",
				Mardi: "Tuesday",
				Mercredi: "Wednesday",
				Jeudi: "Thursday",
				Vendredi: "Friday",
				Samedi: "Saturday",
				Dimanche: "Sunday",
			};

			const mergedEvents = {};
			// Déterminer la date de fin basée sur la vue (semaine ou mois)
			const endDate = startDate
				.clone()
				.endOf(view === "month" ? "month" : "week");

			// Boucler à travers chaque disponibilité des moniteurs
			monitorsAvailable.forEach((day) => {
				const dayOfWeek = dayMapping[day.day];
				if (dayOfWeek) {
					const dayIntervals = day.intervals.map((interval) => {
						const [startStr, endStr] = interval.split(" - ");
						const startTime = moment.duration(startStr);
						const endTime = moment.duration(endStr);
						return { startTime, endTime };
					});

					// Itérer à travers chaque jour dans la plage de dates
					for (
						let m = startDate.clone().startOf("week");
						m.isBefore(endDate.clone().add(1, "day"));
						m.add(1, "day")
					) {
						if (m.format("dddd") === dayOfWeek) {
							dayIntervals.forEach(({ startTime, endTime }) => {
								let currentTime = m
									.clone()
									.startOf("day")
									.add(startTime);
								while (
									currentTime <
									m.clone().startOf("day").add(endTime)
								) {
									const nextHour = moment.min(
										currentTime
											.clone()
											.add(despues, "hour"),
										m.clone().startOf("day").add(endTime)
									);
									const eventId = `${currentTime.format()} - ${nextHour.format()}`;
									const monitorInfo = {
										id: day.monitor.id,
										color: day.monitor.color,
										name:
											day.monitor.name +
											" " +
											day.monitor.lastname,
									};

									if (!mergedEvents[eventId]) {
										mergedEvents[eventId] = {
											start: currentTime.toDate(),
											end: nextHour.toDate(),
											title: "Disponible",
											monitorIds: new Set([monitorInfo]),
										};
									} else {
										mergedEvents[eventId].monitorIds.add(
											monitorInfo
										);
									}

									currentTime.add(despues, "hour");
								}
							});
						}
					}
				}
			});

			// Filtrer les événements en fonction des superpositions et des moniteurs choisis
			Object.values(mergedEvents).forEach((event) => {
				event.monitorIds = [...event.monitorIds].filter((monitor) => {
					if (chosenMonitor !== "" && chosenMonitor !== monitor.id)
						return false;

					const hasSuperposition = monitorsSuperposition?.some(
						(superposition) => {
							const superpositionDays =
								superposition.disabledDates || [];
							const isSuperposed =
								superposition.userId === monitor.id &&
								superpositionDays.some((superpositionDay) =>
									moment(superpositionDay).isSame(
										moment(event.start),
										"day"
									)
								);
							return isSuperposed;
						}
					);

					if (hasSuperposition) {
						return false;
					}

					const hasRendezvousSuperposition = rendezvousData.some(
						(rdv) => {
							const rdvStart = moment(rdv.dateTime).subtract(
								1,
								"hour"
							);
							const rdvEnd = moment(rdv.dateTime);
							return (
								rdv.monitor?.id === monitor.id &&
								rdvStart.isBefore(event.end) &&
								rdvEnd.isAfter(event.start)
							);
						}
					);

					return !hasRendezvousSuperposition;
				});
			});

			setEvents(Object.values(mergedEvents));
		}
	};

	useEffect(() => {
		if (monitorsAvailable && rendezvousData) {
			generateAvailabilityForMonth(moment(defaultDate));
		}
	}, [monitorsAvailable, rendezvousData, chosenMonitor, defaultDate, view]);

	const handleEventClick = (event: any) => {
		setSelectedMonitors(event.monitorIds);
		showModal(event);
		const endTime = moment(event.end);

		const exactHourEnd = endTime.minute() === 0 && endTime.second() === 0;
		const date = event.start.toISOString();
		setSelectedDay(date);
		setCreneau(
			moment(event.start).format("HH:m") +
				"h" +
				" - " +
				moment(event.end).format("HH:m") +
				"h"
		);
	};

	const eventStyleGetter = (event) => {
		const currentTime = new Date();
		const endSlots = event.end;
		const isExpired = currentTime > endSlots;
		const noMonitorsAvailable = event.monitorIds.length === 0;
		const singleMonitor = event.monitorIds.length === 1;

		let displayStyle = {};
		let bgColor;

		if (noMonitorsAvailable) {
			bgColor = "bg-gray-400";
			displayStyle = { display: "none" };
		} else if (singleMonitor) {
			bgColor = `bg-green-400`;
		} else {
			bgColor = "bg-green-400"; // Couleur par défaut si plusieurs moniteurs
		}

		if (isExpired) {
			bgColor = "bg-gray-500";
			displayStyle = { display: "none" };
		}

		return {
			className: `${bgColor} border p-1 relative ${
				noMonitorsAvailable
					? "border-gray-500 cursor-default pointer-events-none"
					: ""
			}`,
			style: displayStyle,
		};
	};

	const EventComponent = ({ event }) => (
		<div className="flex justify-between items-center">
			<span className="flex-1">
				{event.monitorIds.length === 0
					? "auncun employer disponible"
					: event.end < new Date()
					? "Expiré"
					: event.title}
			</span>
			<div className="flex flex-row items-center space-x-1 absolute bottom-1 right-1">
				{event.monitorIds.slice(0, 4).map((monitor, index) => (
					<Popover key={index} content={monitor.name} trigger="hover">
						<div
							key={index}
							className={`transform transition duration-500 hover:scale-125 w-2.5 h-2.5 rounded-full`}
							style={{ backgroundColor: monitor.color }}
						></div>
					</Popover>
				))}
				{event.monitorIds.length > 4 && <div className="">+</div>}
			</div>
		</div>
	);
	if (errorMonitorsAvailable || errorRendezvous) {
		return <div>Erreur lors du chargement des données</div>;
	}

	if (!Array.isArray(monitorsAvailable) || !Array.isArray(rendezvousData)) {
		return <div>Chargement...</div>;
	}

	// MODAL HANDLEE//

	const showModal = (event) => {
		setVisible(true);
	};

	const handleOk = () => {
		setVisible(false);
	};

	const handleCancel = () => {
		setVisible(false);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleSelectChange = (value) => {
		setFormData((prevData) => ({
			...prevData,
			role: value,
		}));
	};

	const handleMonitorChange = (value) => {
		setChosenMonitor(value);
	};

	// END MODAL HANDLEE//

	//HANDLE CLIXK//

	const handleViewChange = (newView) => {
		setView(newView);
		setCurrentMonth(moment());
	};

	const handleNavigate = (date, view, action) => {
		let newDate;
		if (view === "week") {
			if (action === "PREV") {
				newDate = moment(defaultDate).subtract(1, "week");
			} else if (action === "NEXT") {
				newDate = moment(defaultDate).add(1, "week");
			} else if (action === "TODAY") {
				newDate = moment();
			}
		} else if (view === "day") {
			if (action === "PREV") {
				newDate = moment(defaultDate).subtract(1, "day");
			} else if (action === "NEXT") {
				newDate = moment(defaultDate).add(1, "day");
			} else if (action === "TODAY") {
				newDate = moment();
			}
		}
		setDefaultDate(newDate);
		setCurrentMonth(newDate);
	};

	const messages = {
		today: "Aujourd'hui",
		previous: "<",
		next: ">",
		month: "Mois",
		week: "Semaine",
		day: "Jour",
		showMore: (total) => `+ ${total} de plus`,
		allDay: "Toute la journée",
		agenda: "Agenda",
		date: "Date",
		time: "Heure",
		event: "Événement",
		noEventsInRange: "Aucun événement dans cette plage",
		monthNames: moment.monthsShort(),
	};

	const sendDataToParent = () => {
		if (selectedDay !== "") {
			const closed = true;
			const monitorToSend =
				selectedMonitors?.length === 1
					? selectedMonitors[0].id
					: formData.role;
			onDataFromChild(monitorToSend, selectedDay, creneau, closed);
		} else {
			message.error("Veuillez sélectionner un creneau");
		}
	};

	const defaultValue =
		selectedMonitors?.length === 1 ? selectedMonitors[0].id : formData.role;

	return (
		<div className="allInOne w-full ">
			{monitorsAvailable.length > 0 ? (
				<div className="mt-4">
					<Select
						placeholder="Select a role"
						style={{ width: "10%", margin: "10px" }}
						onChange={handleMonitorChange}
						value={chosenMonitor}
					>
						<Option key="all" value="">
							tous
						</Option>
						{monitors?.map((monitor) => (
							<Option key={monitor.id} value={monitor.id}>
								{monitor.name}
							</Option>
						))}
					</Select>
					<div className="w-full h-full flex flex-col">
						<Calendar
							className="self-center"
							onView={(view) => setView(view)}
							onNavigate={handleNavigate}
							localizer={localizer}
							// defaultView={view}
							defaultDate={defaultDate}
							view={view}
							format={formats}
							min={
								new Date(
									0,
									0,
									0,
									limiterHours
										? limiterHours
										: smallestNumber
										? smallestNumber ?? -1
										: 0,
									limiterMinutes || 0
								)
							}
							max={
								new Date(
									0,
									0,
									0,
									largestNumber
										? largestNumber + 1 > 23
											? 23
											: largestNumber + 1
										: largestNumber
								)
							}
							events={events || "Rien"}
							culture="fr"
							startAccessor="start"
							endAccessor="end"
							style={{ width: "100%", height: "80%" }}
							onSelectEvent={handleEventClick}
							eventPropGetter={eventStyleGetter}
							dayLayoutAlgorithm="no-overlap"
							components={{ event: EventComponent }}
							step={60}
							timeslots={1}
							views={[Views.WEEK, Views.DAY]}
							messages={messages}
							formats={formats}
						/>
						<div className="w-full flex justify-end mt-4">
							<button
								onClick={sendDataToParent}
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							>
								Confirmer la sélection
							</button>
						</div>
					</div>
				</div>
			) : (
				<div>Pas de collaborateur disponible</div>
			)}
			<Modal
				open={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				footer={[]}
			>
				<div className="min-h-32 flex items-center justify-center flex-col gap-2">
					<label
						htmlFor="employe"
						className="block text-sm font-medium leading-6 text-gray-900"
					>
						Veuillez choisir un employeur
					</label>
					<Select
						style={{ width: "100%" }}
						onChange={handleSelectChange}
						value={defaultValue}
						id="employe"
					>
						{selectedMonitors?.map((monitor) => (
							<Option key={monitor.id} value={monitor.id}>
								{monitor.name}
							</Option>
						))}
					</Select>
				</div>
				<div className="flex items-center gap-3 justify-end">
					<button
						onClick={handleCancel}
						className="bg-gray-50 py-2 px-4 rounded-lg border border-gray-900/10 hover:bg-gray-100"
					>
						Annuler
					</button>
					<button
						onClick={handleOk}
						className="py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
					>
						Confirmer
					</button>
				</div>
			</Modal>
		</div>
	);
}

export default AllInOneCalendar;
