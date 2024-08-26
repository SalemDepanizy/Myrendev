import { useEffect, useState } from "react";
import { Modal as AntModal } from "antd";
import { Monitor } from "src/Moniteurs";
import { fetcher } from "../axios/index";
import useSWR from "swr";
import ScheduleSelector from "../ScheduleSelector";
import Calendrier from "./Calendrier";

export type AvailabiltyResult = {
	success: boolean;
	data: {
		jour: any;
		id: string;
		day: string;
		start: string;
		end: string;
		monitorId: string;
		intervals: string[];
	}[];
};

function Availabilty({ days, monitor }: { days: string[]; monitor: Monitor }) {
	const [selectedDays, setSelectedDays] = useState<string[]>([]);
	const [schedules, setSchedules] = useState<{ [key: string]: any[] }>({});
	const [care, setCare] = useState<any[]>([]);
	const [intervalsToSend, setIntervalsToSend] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [selectedCell, setSelectedCell] = useState(false);

	const { data, error, isLoading } = useSWR(
		`/users/availability/${monitor.id}`,
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

	const jours: string[] = Object.keys(data || {});

	const daysOfWeek: string[] = [
		"Lundi",
		"Mardi",
		"Mercredi",
		"Jeudi",
		"Vendredi",
		"Samedi",
		"Dimanche",
	];

	const [kem, setKem] = useState<{
		[day: string]: { interval: string[] } | undefined;
	}>({});

	const handleDayClick = (day: string) => {
		if (selectedDays.includes(day)) {
			setSelectedDays(
				selectedDays.filter((selectedDay) => selectedDay !== day)
			);
			const { [day]: omit, ...updatedSchedules } = schedules;
			setSchedules(updatedSchedules);
		} else {
			setSelectedDays([...selectedDays, day]);
			const updatedSchedules: { [key: string]: any[] } = {
				...schedules,
				[day]: [],
			};
			setSchedules(updatedSchedules);
			setKem((prevKem) => ({ ...prevKem, [day]: { interval: [] } }));
		}
	};

	const handleScheduleChange = (day: string, updatedIntervals: any[]) => {
		const updatedSchedules = { ...schedules, [day]: updatedIntervals };
		setSchedules(updatedSchedules);
	};

	const handleDataFromChildAutocompleteMonitor = (
		day: string,
		intervals: any
	) => {
		setKem((prevKem) => ({
			...prevKem,
			[day]: {
				interval: intervals.map(
					(interval) => `${interval.start} - ${interval.end}`
				),
			},
		}));
	};

	async function saveAvailabilities() {
		try {
			const dataToSend = {
				monitorId: monitor.id,
				days: {},
			};

			Object.keys(kem).forEach((day) => {
				const intervals = kem[day]?.interval || [];
				dataToSend.days[day] = { interval: intervals };
			});

			const result = await fetcher.post(
				"/users/availability",
				dataToSend
			);

			if (result.data && result.data.success) {
				setVisible(false);
			}
		} catch (error) {
			console.error("Error sending data to backend:", error);
		}
	}

	useEffect(() => {
		const updatedCare = Object.keys(kem).map((day) => {
			const intervals = kem[day]?.interval || [];

			const formattedIntervals = intervals.map((intervalString) => {
				const [start, end] = intervalString.split(" - ");
				return {
					start: start.trim(),
					end: end.trim(),
				};
			});

			return formattedIntervals;
		});

		if (updatedCare.length > 0) {
			const allIntervals = updatedCare.flat();

			setCare(allIntervals);
		}
	}, [kem]);

	const handleAutoComplete = () => {
		setIntervalsToSend(care);
	};

	const handleSelectionColor = () => {
		console.log("hehe");
		setSelectedCell(!selectedCell);
	};

	return (
		<div className="">
			<div
				className="flex items-center text-blue-500 cursor-pointer"
				onClick={() => setVisible(true)}
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
						d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
					/>
				</svg>
			</div>
			<AntModal
				open={visible}
				okButtonProps={{
					className: "bg-indigo-600 hover:!bg-indigo-500 text-white",
				}}
				onCancel={() => setVisible(false)}
				cancelText="Annuler"
				okText="Sauvegarder"
				onOk={() => {
					saveAvailabilities();
				}}
			>
				<h2 className="text-xl font-bold">
					Sélectionnez un ou plusieurs jours :
				</h2>

				<div className="min-h-44 mt-5">
					<div className="flex flex-wrap justify-center gap-4">
						{daysOfWeek.map((day) => {
							return (
								<button
									key={day}
									onClick={() => {
										handleDayClick(day);
									}}
									className={`px-4 py-2 rounded-md  ${
										jours.includes(day)
											? "bg-blue-500 text-white"
											: "bg-gray-200 text-gray-800"
									} 
                `}
								>
									{day}
								</button>
							);
						})}
					</div>

					{selectedDays.map((day) => (
						<div key={day} className="mt-8">
							<h3 className="text-lg font-bold">{day}</h3>
							<ScheduleSelector
								day={day}
								schedule={schedules[day] || []}
								onScheduleChange={(updatedIntervals) =>
									handleScheduleChange(day, updatedIntervals)
								}
								onDataFromChild={
									handleDataFromChildAutocompleteMonitor
								}
								style="mt-4"
								auto={intervalsToSend ?? []}
								data={data}
							/>
						</div>
					))}
				</div>
				<Calendrier days={daysOfWeek} monitor={monitor} />
			</AntModal>
		</div>
	);
}

export default Availabilty;
