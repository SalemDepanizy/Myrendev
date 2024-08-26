import { cn } from "../utils";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import "moment/locale/fr";
import { Minus, Plus } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "../axios";
import VisionCalendar from "../visionCalendar";
import { Modal } from "antd";

export type CalendarEvent<T> = {
	title: string;
	date: moment.Moment;
	description?: string;
	payload: T;
	images?: { filename: string; rendezVousId: string }[];
	isActivated: boolean;
	isValid: boolean;
};

export interface Superposition {
	disabledDates: dateTime[];
	selectedOption: string;
	id: string;
	titre: string;
}

type dateTime = string;

type EventListner<T> = (event: CalendarEvent<T>) => void;
type EventsListner<T> = (events: CalendarEvent<T>[]) => void;
type DateListner = (date: moment.Moment) => void;

class CalendarController<T> {
	eventListners: Set<{
		eventListner?: EventListner<T>;
		eventsListner?: EventsListner<T>;
		dateListner?: DateListner;
	}> = new Set();

	private _subscribe(eventListner: {
		eventListner?: EventListner<T>;
		eventsListner?: EventsListner<T>;
		dateListner?: DateListner;
	}) {
		this.eventListners.add(eventListner);

		return () => {
			this.eventListners.delete(eventListner);
		};
	}

	publish(event: CalendarEvent<T>[], date: moment.Moment) {
		this.eventListners.forEach((eventListner) => {
			if (eventListner.eventListner) {
				if (event.length > 0) {
					eventListner.eventListner(event[0]);
				}
			}
			if (eventListner.eventsListner) {
				eventListner.eventsListner(event);
			}

			if (eventListner.dateListner) {
				eventListner.dateListner(date);
			}
		});

		return this;
	}

	subscribe(eventListner: {
		eventListner?: EventListner<T>;
		eventsListner?: EventsListner<T>;
		dateListner?: DateListner;
	}) {
		useEffect(() => {
			const unsub = this._subscribe(eventListner);
			return () => {
				unsub();
			};
		}, []);
	}
}

export function createCalendarController<T>() {
	return useMemo(() => new CalendarController<T>(), []);
}
export function Calendar<T = never>({
	className,
	events = [],
	controller,
	date,
	disabledDays = [],
}: {
	className?: string;
	events?: CalendarEvent<T>[];
	controller?: CalendarController<T>;
	date?: moment.Moment;
	disabledDays?: moment.Moment[];
}) {
	function traduireMoisEnFrancais(moisAnglais) {
		const traductionMois = {
			january: "janvier",
			february: "février",
			march: "mars",
			april: "avril",
			may: "mai",
			june: "juin",
			july: "juillet",
			august: "août",
			september: "septembre",
			october: "octobre",
			november: "novembre",
			december: "décembre",
		};

		const moisEnMinuscules = moisAnglais.toLowerCase();

		const moisTraduit = traductionMois[moisEnMinuscules];

		return moisTraduit || moisAnglais;
	}

	// Obtenez les noms des mois en anglais à partir de Moment.js
	const monthsInEnglish = moment.months(); // Obtenez les noms des mois en anglais à partir de Moment.js

	// Mappez les mois anglais aux mois traduits en français
	const months = monthsInEnglish.map((mois) => traduireMoisEnFrancais(mois));

	// Affichez les noms des mois en français

	const years = Array.from(
		{ length: 10 },
		(_, index) => new Date().getFullYear() + index
	);

	const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [daysInMonth, setDaysInMonth] = useState<
		{ number: number; name: string; moment: moment.Moment }[]
	>([]);

	const [emptySlots, setEmptySlots] = useState<number>(0);
	const [weekDays, setWeekDays] = useState<string[]>([]);
	// const specificDate = moment("09-02-2024", "DD-MM-YYYY");

	useEffect(() => {
		const daysArray: {
			number: number;
			name: string;
			moment: moment.Moment;
		}[] = [];
		const daysCount = moment([selectedYear, selectedMonth]).daysInMonth();

		for (let i = 1; i <= daysCount; i++) {
			const currentMoment = moment([selectedYear, selectedMonth, i]);
			currentMoment.locale("fr");
			daysArray.push({
				number: i,
				name: currentMoment.format("ddd"), // Format day names
				moment: currentMoment,
			});
		}
		const getDays = (
			arr: { number: number; name: string; moment: moment.Moment }[]
		) => {
			const days: string[] = [];

			arr.forEach((day) => {
				if (day.moment.weekday() !== 1 && days.length === 0) {
					return;
				}
				if (!days.includes(day.name)) {
					days.push(day.name);
				}
			});

			return days;
		};

		const days = getDays(daysArray).map((day) => day.toLowerCase());
		function traduireJourEnFrancais(jourAnglais) {
			// Objet de traduction des jours
			const traductionJours = {
				mon: "lun",
				tue: "mar",
				wed: "mer",
				thu: "jeu",
				fri: "ven",
				sat: "sam",
				sun: "dim",
			};

			// Vérifier si le jour anglais existe dans le tableau de traduction
			const jourTraduit = traductionJours[jourAnglais.toLowerCase()];

			// Retourner le jour traduit en français ou le jour anglais si la traduction n'est pas disponible
			return jourTraduit || jourAnglais;
		}
		const joursEnFrancais = days.map((jour) =>
			traduireJourEnFrancais(jour)
		);

		const indexLundi = joursEnFrancais.findIndex(
			(jour) => jour.toLowerCase() === "lundi"
		);
		const joursEnFrancaisTries = [
			...joursEnFrancais.slice(indexLundi), // Les jours à partir de "lundi"
			...joursEnFrancais.slice(0, indexLundi), // Les jours avant "lundi"
		];
		setWeekDays(joursEnFrancaisTries);

		const firstDayOfMonth = daysArray[1].name.toLowerCase();

		const emptySlots = days.indexOf(firstDayOfMonth);

		setDaysInMonth(daysArray);
		setEmptySlots(emptySlots);
	}, [selectedMonth, selectedYear]);

	// useEffect(() => {
	//   const todayEvents = events.filter((event) =>
	//     event.date.isSame(new Date(), "day")
	//   );
	//   controller?.publish(todayEvents, moment(new Date()));
	// }, []);

	useEffect(() => {
		const eventsAvailable = events.filter((event) => {
			// Check if 'event.date' exists and is a valid moment object
			return (
				event.date &&
				moment(event.date).isValid() &&
				moment(event.date).isSame(new Date(), "day")
			);
		});

		// Use optional chaining to safely access 'controller' and 'publish' method
		controller?.publish(eventsAvailable, moment(new Date()));
	}, [events.length, controller]); // Listen for changes in 'events.length' and 'controller'

	const [selectedDay, setSelectedDay] = useState<moment.Moment | null>(null);

	const {
		data: superpositions = [],
		isLoading: loadingSuperpositions,
		error: errorSuperpositions,
	} = useSWR("/disponibilite/get/superposition", async (url) => {
		return (await fetcher.get(url)).data as Superposition[];
	});

	// Utilisation de useMemo pour calculer les dates désactivées
	const disabledDates = useMemo(() => {
		const disabledDatesArray: moment.Moment[] = [];
		superpositions?.forEach((superposition, index) => {
			if (superposition.selectedOption === "toute la journée") {
				superposition.disabledDates.forEach((disabledDate: string) => {
					disabledDatesArray.push(moment(disabledDate, "DD-MM-YYYY"));
				});
			}
		});
		return disabledDatesArray;
	}, [superpositions]);

	const [modalAllRdvVisible, setModalAllRdvVisible] = useState(false);

	const handleModalAllRdvVisible = () => {
		setModalAllRdvVisible(false);
	};

	return (
		<div className={cn("w-full h-fit", className)}>
			<div className="flex justify-between p-4">
				<select
					className="rounded-md border border-gray-300 p-2 text-gray-600 font-semibold"
					value={selectedMonth}
					onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
				>
					{months.map((month, index) => (
						<option key={index} value={index}>
							{month}
						</option>
					))}
				</select>
				<div className="flex gap-2 items-center">
					<button
						className="rounded-lg border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500"
						onClick={() => {
							if (selectedMonth === 0) {
								setSelectedMonth(11);
								setSelectedYear(selectedYear - 1);
								return;
							}
							setSelectedMonth(selectedMonth - 1);
						}}
					>
						<Minus size={16} />
					</button>
					<button
						className="rounded-lg  border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500"
						onClick={() => {
							if (selectedMonth === 11) {
								setSelectedMonth(0);
								setSelectedYear(selectedYear + 1);

								return;
							}
							setSelectedMonth(selectedMonth + 1);
						}}
					>
						<Plus size={16} />
					</button>
					<button
						className="rounded-lg border border-gray-300 p-2 text-gray-400 h-8 flex items-center hover:bg-gray-100 hover:text-gray-500"
						onClick={() => {
							setSelectedMonth(new Date().getMonth());
							setSelectedYear(new Date().getFullYear());
						}}
					>
						<span className="text-gray-600 font-semibold text-sm">
							{
								// moment(
								new Date().toLocaleDateString("fr-Fr")
								// ).format("DD MMM YYYY")
							}
						</span>
					</button>
				</div>
				<select
					className="rounded-md border border-gray-300 p-2 text-gray-600 font-semibold"
					value={selectedYear}
					onChange={(e) => setSelectedYear(parseInt(e.target.value))}
				>
					{years.map((year) => (
						<option key={year} value={year}>
							{year}
						</option>
					))}
				</select>
			</div>
			<div className="p-4 grid grid-cols-7 gap-2">
				{weekDays.map((day) => (
					<div
						key={day}
						className="p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm bg-gray-100 font-bold text-gray-500 text-xl capitalize"
					>
						{day}
					</div>
				))}
				{Array.from({ length: emptySlots }).map((_, index) => (
					<div key={index}></div>
				))}

				{daysInMonth.map((day) => {
					const hehe = events.filter(
						(event) =>
							event.date && event.date.isSame(day.moment, "day")
					);

					// const isSpecificDate = day.moment.isSame(specificDate, "day"); // Vérifier si c'est la date spécifique

					const isDisabled = disabledDates.some((disabledDate) =>
						disabledDate.isSame(day.moment, "day")
					); // Vérifie si le jour est désactivé

					const eventsAvailable = hehe.filter(
						(event) =>
							event.date.isSameOrAfter(new Date()) &&
							event.isActivated === true
					);
					return (
						<div
							onClick={
								!isDisabled
									? () => {
											controller?.publish(
												eventsAvailable,
												day.moment
											);
											setSelectedDay(day.moment); // Update the selected day
											setModalAllRdvVisible(true);
									  }
									: undefined
							}
							key={day.number}
							className={cn(
								"p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm relative cursor-pointer",
								isDisabled
									? "bg-gray-300 cursor-not-allowed"
									: "", // Applique les styles de désactivation
								day.moment.isSame(selectedDay, "day")
									? "bg-blue-500 text-white hover:bg-blue-600"
									: "hover:bg-gray-100 hover:text-gray-500",
								day.moment.isSame(new Date(), "day") &&
									!day.moment.isSame(selectedDay, "day")
									? "bg-blue-100"
									: ""
								// isWeekend ? 'bg-gray-200 cursor-not-allowed' : ''
							)}
						>
							{eventsAvailable.length > 0 && !isDisabled && (
								<span
									className={cn(
										"absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold"
									)}
								>
									{eventsAvailable.length}
								</span>
							)}
							<span className={cn("text-sm font-bold")}>
								{day.number}{" "}
							</span>
						</div>
					);
				})}

				{Array.from({
					length: 6 - emptySlots,
				}).map((_, index) => (
					<div key={index}> </div>
				))}
			</div>

			<Modal
				className="modalStyle"
				destroyOnClose={true}
				// open={modalAllRdvVisible}
				onCancel={handleModalAllRdvVisible}
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
					{/* <VisionCalendar data={events} date={selectedDay} /> */}
				</div>
			</Modal>
		</div>
	);
}
