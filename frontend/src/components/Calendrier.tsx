import { useEffect, useState } from "react";
import { Modal as AntModal } from "antd";
import { Monitor } from "src/Moniteurs";
import useSWR from "swr";
import { fetcher } from "../axios";

type AvailabiltyResult = {
	success: boolean;
	data: {
		id: string;
		day: string;
		start: string;
		end: string;
		monitorId: string;
		intervals: string[];
	}[];
};

function Calendrier({ days, monitor }: { days: string[]; monitor: Monitor }) {
	const [visible, setVisible] = useState(false);

	const { data, error, isLoading, mutate } = useSWR(
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

	useEffect(() => {
		if (visible) {
			mutate();
		}
	}, [visible]);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error</div>;

	const extractHours = (interval) => {
		const [start, end] = interval.split(" - ");
		return { start, end };
	};

	return (
		<>
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
						d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			</div>
			<AntModal
				title={`Calendrier de ${monitor.name} (${monitor.email})`}
				open={visible}
				onCancel={() => setVisible(false)}
				onOk={() => setVisible(false)}
				footer={null}
				centered
				width={800}
			>
				<div className="grid grid-cols-3 gap-2">
					{days.map((day) => {
						let horaires;
						const isActive = data?.[day] ? true : false;
						if (
							data &&
							data[day] &&
							data[day].intervals &&
							data[day].intervals.length > 1
						) {
							// Your code to handle the case where intervals array exists and has length > 1
							// Place your logic here
							const filteredIntervals =
								data[day].intervals.map(extractHours);
							const startHour = filteredIntervals[0]?.start; // Première heure de début
							const endHour =
								filteredIntervals[filteredIntervals.length - 1]
									?.end;
							horaires = `${startHour} - ${endHour}`;
						} else if (data && data[day] && data[day].intervals) {
							// Handle the case where data[day] or data[day].intervals is undefined or intervals length <= 1
							// You can add additional logic or error handling here
							horaires = `${data[day].intervals} `;
						}

						const rangeString = data?.[day] ? horaires : "";

						return (
							<div
								key={day}
								className={`w-full flex flex-col p-5 rounded-md  items-center justify-center cursor-pointer ${
									isActive
										? "bg-blue-500 text-white"
										: "bg-gray-200"
								}`}
							>
								<span
									className={`${
										isActive
											? "text-white"
											: "text-gray-500"
									} font-bold text-lg`}
								>
									{day}
								</span>
								<div
									className={`${
										isActive
											? "text-white"
											: "text-gray-500"
									} font-bold text-lg`}
								>
									{rangeString}
								</div>
							</div>
						);
					})}
				</div>
			</AntModal>
		</>
	);
}

export default Calendrier;
