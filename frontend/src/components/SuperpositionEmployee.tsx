import { useState, useEffect } from "react";
import { Modal as AntModal, AutoComplete } from "antd";
import { message, UploadFile } from "antd";
import { fetcher } from "../axios";
import { Monitor } from "src/Moniteurs";
import TextArea from "antd/es/input/TextArea";
import Button from "./Button";

const MultipleDayPickerEmployee = ({ monitor }: { monitor: Monitor }) => {
	const [decryptedDates, setDecryptedDates] = useState<any>();
	const [decryptedId, setDecryptedDatesId] = useState<any>();
	const [titre, setTitre] = useState<string>("");
	const [comment, setComment] = useState<string>("");
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		function base64ToUtf8(base64String) {
			return decodeURIComponent(escape(atob(base64String)));
		}

		function decrypt(text) {
			return base64ToUtf8(text);
		}

		const urlParams = new URLSearchParams(window.location.search);
		const encryptedDates = urlParams.get("dates");
		const encryptedId = urlParams.get("id");

		if (encryptedDates) {
			const decryptedDates = decrypt(encryptedDates);
			const decryptedId = decrypt(encryptedId);
			setDecryptedDates(decryptedDates);
			setDecryptedDatesId(decryptedId);
			const decryptedDatesArray = decryptedDates
				.split(",")
				.map((dateStr) => new Date(dateStr));
			setDates(decryptedDatesArray);
			setSelectedDates(decryptedDatesArray);
		}
	}, []);

	const [dates, setDates] = useState<Date[]>([]);
	const defaultSelectedDates = [...dates];
	const [selectedDates, setSelectedDates] =
		useState<Date[]>(defaultSelectedDates);

	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [rangeStart, setRangeStart] = useState<Date | null>(null);
	const [file, setFile] = useState<File | null>(null);

	const handleDateClick = (date: Date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (date < today) {
			message.warning(
				"Vous ne pouvez pas sélectionner une date antérieure à aujourd'hui."
			);
			return;
		}

		if (rangeStart) {
			const newRange = createDateRange(rangeStart, date);
			setSelectedDates([
				...selectedDates.filter(
					(d) => !isDateInRange(d, rangeStart!, date)
				),
				...newRange,
			]);
			setRangeStart(null);
		} else {
			const selectedIndex = selectedDates.findIndex((d) =>
				isSameDay(d, date)
			);

			if (selectedIndex === -1) {
				setSelectedDates([...selectedDates, date]);
			} else {
				const updatedDates = selectedDates.filter(
					(d) => !isSameDay(d, date)
				);
				setSelectedDates(updatedDates);
			}
		}
	};

	const handleDateMouseDown = (date: Date) => {
		setRangeStart(date);
	};

	const handleDateMouseEnter = (date: Date) => {
		if (rangeStart) {
			const newRange = createDateRange(rangeStart, date);
			setSelectedDates([
				...selectedDates.filter(
					(d) => !isDateInRange(d, rangeStart, date)
				),
				...newRange,
			]);
		}
	};

	const handleDateMouseUp = () => {
		setRangeStart(null);
	};

	const handleRemoveDate = (date: Date) => {
		const updatedDates = selectedDates.filter((d) => !isSameDay(d, date));
		setSelectedDates(updatedDates);
	};

	const handleClearAllDates = () => {
		setVisible(false);
		setSelectedDates([]);
		setTitre("");
		setComment("");
	};

	const isSameDay = (date1: Date, date2: Date) => {
		return (
			date1.getDate() === date2.getDate() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getFullYear() === date2.getFullYear()
		);
	};

	const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
		return date >= start && date <= end;
	};

	const createDateRange = (start: Date, end: Date): Date[] => {
		const range: Date[] = [];
		const currentDate = new Date(start);

		while (currentDate <= end) {
			range.push(new Date(currentDate));
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return range;
	};

	const goToPreviousMonth = () => {
		const previousMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() - 1,
			1
		);
		setCurrentMonth(previousMonth);
	};

	const goToNextMonth = () => {
		const nextMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
			1
		);
		setCurrentMonth(nextMonth);
	};

	// const renderCalendarDays = (startDate: Date): JSX.Element[] => {
	// 	const daysInMonth = new Date(
	// 		startDate.getFullYear(),
	// 		startDate.getMonth() + 1,
	// 		0
	// 	).getDate();
	// 	const firstDayOfMonth = new Date(
	// 		startDate.getFullYear(),
	// 		startDate.getMonth(),
	// 		1
	// 	);
	// 	const startingDayOfWeek = firstDayOfMonth.getDay();

	// 	const daysArray: JSX.Element[] = [];

	// 	for (let i = 1; i < startingDayOfWeek; i++) {
	// 		daysArray.push(
	// 			<div key={`empty-${i}`} className="calendar-day empty"></div>
	// 		);
	// 	}

	// 	for (let i = 1; i <= daysInMonth; i++) {
	// 		const currentDate = new Date(
	// 			startDate.getFullYear(),
	// 			startDate.getMonth(),
	// 			i
	// 		);
	// 		const isSelected = selectedDates.some((date) =>
	// 			isSameDay(date, currentDate)
	// 		);

	// 		daysArray.push(
	// 			<div
	// 				key={currentDate.toISOString()}
	// 				className={`p-2 cursor-pointer text-center  rounded-full ${
	// 					isSelected ? "bg-blue-500 text-white" : "bg-white-200"
	// 				}`}
	// 				onClick={() => handleDateClick(currentDate)}
	// 				onMouseDown={() => handleDateMouseDown(currentDate)}
	// 				onMouseEnter={() => handleDateMouseEnter(currentDate)}
	// 				onMouseUp={handleDateMouseUp}
	// 			>
	// 				{i}
	// 			</div>
	// 		);
	// 	}

	// 	return daysArray;
	// };

	const renderCalendarDays = (startDate: Date): JSX.Element[] => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const daysInMonth = new Date(
			startDate.getFullYear(),
			startDate.getMonth() + 1,
			0
		).getDate();
		const firstDayOfMonth = new Date(
			startDate.getFullYear(),
			startDate.getMonth(),
			1
		);
		const startingDayOfWeek = firstDayOfMonth.getDay();

		const daysArray: JSX.Element[] = [];

		for (let i = 1; i < startingDayOfWeek; i++) {
			daysArray.push(
				<div key={`empty-${i}`} className="calendar-day empty"></div>
			);
		}

		for (let i = 1; i <= daysInMonth; i++) {
			const currentDate = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				i
			);
			const isPast = currentDate <= today;
			const isSelected = selectedDates.some((date) =>
				isSameDay(date, currentDate)
			);

			daysArray.push(
				<div
					key={currentDate.toISOString()}
					className={`p-2 text-center rounded-full ${
						isSelected ? "bg-blue-500 text-white" : "bg-white-200"
					} ${
						isPast
							? "text-gray-400 cursor-not-allowed"
							: "cursor-pointer"
					}`}
					onClick={() => !isPast && handleDateClick(currentDate)}
					onMouseDown={() =>
						!isPast && handleDateMouseDown(currentDate)
					}
					onMouseEnter={() =>
						!isPast && handleDateMouseEnter(currentDate)
					}
					onMouseUp={!isPast ? handleDateMouseUp : undefined}
				>
					{i}
				</div>
			);
		}

		return daysArray;
	};

	const renderSelectedDates = (): JSX.Element[] => {
		const maxDisplayedDates = 5;
		const remainingDates = selectedDates.length - maxDisplayedDates;
		const displayedDates = selectedDates.slice(0, maxDisplayedDates);

		const elements: JSX.Element[] = [];

		elements.push(
			...displayedDates.map((date) => (
				<li
					key={date.toISOString()}
					className="flex items-center justify-between mb-1 gap-3"
				>
					<span>
						{date.toLocaleDateString("fr-FR", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
					<button
						className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
						onClick={() => handleRemoveDate(date)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
					</button>
				</li>
			))
		);
		if (remainingDates > 0) {
			elements.push(
				<li key="more" className="text-sm text-gray-600">
					+ {remainingDates} autres dates
				</li>
			);
		}
		return elements;
	};

	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const handleFileUpload = (fileList: UploadFile<any>[]) => {
		const files: File[] = fileList.map((file) => file.originFileObj!);
		setSelectedFiles(files);
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

	const handleSendData = async (event) => {
		event.preventDefault();

		if (selectedDates.length === 0) {
			message.error("Veuillez ajouter au moins une date");
			return;
		}

		const datesToDisable = selectedDates.map((date) => {
			return new Date(date).toISOString();
		});

		try {
			let imgUrl = null;
			if (file) {
				imgUrl = await handleUpload();
			}
			const response = await fetcher.post(
				"disponibilite/create/superposition",
				{
					titre,
					disabledDates: datesToDisable,
					selectedOption: "selectedOption",
					userId: monitor?.id,
					comment,
					file: imgUrl ? imgUrl : "",
				}
			);

			if (response.status === 200) {
				message.success("Dates ajouter avec succées");
				setVisible(false);
			} else {
				console.error("Échec.");
			}
		} catch (error) {
			console.error("Erreur :", error);
			alert(error);
		}
	};

	return (
		<div className="">
			<div
				className="flex items-center text-blue-500 cursor-pointer"
				onClick={() => setVisible(true)}
			>
				Ajouter des congés
			</div>
			<AntModal
				title={
					<span className="text-2xl font-bold text-gray-700">
						Ajouter Une Superposition
					</span>
				}
				open={visible}
				onCancel={() => setVisible(false)}
				footer={[]}
				width={600}
			>
				<div className="font-sans p-3 rounded-md w-full max-w-screen-lg mx-auto flex flex-col">
					<div className="w-full flex items-center flex-col gap-2">
						<div className="mb-3 pt-1">
							<label
								htmlFor="title"
								className="block text-base font-medium leading-6 text-gray-900"
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
								value={titre}
								onChange={(value: string) => setTitre(value)}
								onSelect={(value: string) => setTitre(value)}
								allowClear
							/>
						</div>
						{titre === "Autre" && (
							<div className="mb-3 pt-1">
								<label
									htmlFor="comment"
									className="block text-base font-medium leading-6 text-gray-900"
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
						<div className="mb-3 pt-1">
							<label
								htmlFor="dates"
								className="block text-base font-medium leading-6 text-gray-900"
							>
								Dates
							</label>
							<div className="w-[350px] sm:w-[420px] border p-4 rounded bg-white">
								<div className="flex justify-between items-center mb-4 w-full ">
									<h2 className="text-xl font-bold">
										{currentMonth?.toLocaleDateString(
											"fr-FR",
											{
												year: "numeric",
												month: "long",
											}
										)}
									</h2>
									<div className="flex gap-2">
										<button
											className=" text-black font-bold py-2 px-2 rounded"
											onClick={goToPreviousMonth}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={1.5}
												stroke="currentColor"
												className="w-6 h-6"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M15.75 19.5 8.25 12l7.5-7.5"
												/>
											</svg>
										</button>
										<button
											className="text-black font-bold py-2 px-2 rounded"
											onClick={goToNextMonth}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth={1.5}
												stroke="currentColor"
												className="w-6 h-6"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="m8.25 4.5 7.5 7.5-7.5 7.5"
												/>
											</svg>
										</button>
									</div>
								</div>
								<div className="grid grid-cols-7 gap-2">
									<div className="text-center font-bold text-sm text-gray-600">
										Lun
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Mar
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Mer
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Jeu
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Ven
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Sam
									</div>
									<div className="text-center font-bold text-sm text-gray-600">
										Dim
									</div>
									{renderCalendarDays(currentMonth)}
								</div>
							</div>
						</div>

						{selectedDates?.length > 0 && (
							<div className="w-[350px] sm:w-[420px]">
								<label
									htmlFor="datesselected"
									className="block text-base font-medium leading-6 text-gray-900"
								>
									Dates sélectionnées :
								</label>
								<ul className="list-none p-0">
									{renderSelectedDates()}
								</ul>
							</div>
						)}
						<div>
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
						<div className="w-[350px] sm:w-[420px] mt-4">
							<div className="flex items-center gap-2 justify-end">
								<button
									className="bg-gray-50 hover:bg-gray-100 py-2 px-4 rounded-lg border border-gra-900/10"
									onClick={handleClearAllDates}
								>
									Annuler
								</button>
								<Button onClick={handleSendData}>
									Valider
								</Button>
							</div>
						</div>
					</div>
				</div>
			</AntModal>
		</div>
	);
};

export default MultipleDayPickerEmployee;
