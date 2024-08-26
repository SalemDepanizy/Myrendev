import { useState, useEffect } from "react";
import { useAuth } from "../lib/hooks/auth";
import { Select, message, UploadFile, AutoComplete } from "antd";
import useSWR from "swr";
import { fetcher } from "../axios";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;

const MultipleDayPicker = ({
	param,
	onDataFromChild,
	toWho,
}: {
	param: boolean;
	onDataFromChild: any;
	toWho: boolean;
}) => {
	const [decryptedDates, setDecryptedDates] = useState<any>();
	const [decryptedId, setDecryptedDatesId] = useState<any>();
	const [decryptedTitle, setDecryptedTitle] = useState<any>();
	const [decryptedToken, setDecryptedToken] = useState<any>();

	const {
		data: superpositions = [],
		isLoading: loadingSuperpositions,
		error: errorSuperpositions,
	} = useSWR("/disponibilite/get/superposition", async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

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
		const encryptedTitle = urlParams.get("title");
		const encryptedToken = urlParams.get("token");

		if (encryptedDates) {
			const decryptedDates = decrypt(encryptedDates);
			const decryptedId = decrypt(encryptedId);
			const decryptedTitle = decrypt(encryptedTitle);
			const decryptedToken = decrypt(encryptedToken);

			setDecryptedDates(decryptedDates);
			setDecryptedDatesId(decryptedId);
			setDecryptedTitle(decryptedTitle);
			setDecryptedToken(decryptedToken);
			const decryptedDatesArray = decryptedDates
				.split(",")
				.map((dateStr) => new Date(dateStr));
			setDates(decryptedDatesArray);
			setSelectedDates(decryptedDatesArray);
		}
	}, []);

	const existingEntry = superpositions.find(
		(entry) => entry.reqToken === decryptedToken
	);

	useEffect(() => {
		if (existingEntry) {
			window.location.href = `/rendezvous/${existingEntry.reqToken}`;
		}
	}, [existingEntry]);

	const [dates, setDates] = useState<Date[]>([]); // Ne pas initialiser avec une fonction
	const defaultSelectedDates = [...dates];
	const [selectedDates, setSelectedDates] =
		useState<Date[]>(defaultSelectedDates);
	const [defaultOption, setDefaultOption] = useState(null);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [rangeStart, setRangeStart] = useState<Date | null>(null);
	const [selectedCompany, setSelectedCompany] = useState("");
	const [dataTitle, setDataTitle] = useState("");
	const [comment, setComment] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const { user } = useAuth();

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
		setSelectedDates([]);
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

	const url = param
		? `/users/get/ownership/${user?.id}`
		: `/users/get/ownership/owner/${user?.id}`;

	const {
		data: ownership,
		isLoading: loadingownership,
		error: errorownership,
	} = useSWR(url, async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const handleFileUpload = (fileList: UploadFile<any>[]) => {
		const files: File[] = fileList.map((file) => file.originFileObj!);
		setSelectedFiles(files);
	};

	const reqToken = Math.random().toString(36).substr(2, 9);

	const handleSendEmail = async () => {
		try {
			const formData = new FormData();
			formData.append("title", dataTitle);
			formData.append("email", selectedCompany);
			formData.append("token", reqToken);
			selectedDates.forEach((date, index) => {
				formData.append(`messages[${index}]`, date.toISOString());
			});
			selectedFiles.forEach((file) => {
				formData.append("files", file);
			});
			const response = await fetcher.post("mailing/users-mail", formData);
			if (response.status === 200) {
				message.success("E-mail envoyé avec succès");
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else {
				message.error("Échec de l'envoi de l'email.");
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		const idToSend = decryptedId || "";
		const titleToSend = decryptedTitle || "";
		const dataFromEncrypted = decryptedDates ? true : false;
		onDataFromChild(
			selectedDates,
			idToSend,
			titleToSend,
			dataFromEncrypted,
			decryptedToken
		);
	}, [selectedDates]);

	const [defaultValue, setDefaultValue] = useState<any>([]);
	const [userOwned, setUserOwned] = useState<any>("");

	useEffect(() => {
		if (dates.length > 0 && ownership) {
			const foundAppointment = ownership.filter(
				(appointment) => appointment.userId === decryptedId
			);
			if (foundAppointment && foundAppointment.length > 0) {
				setDefaultValue(foundAppointment);
			}
		}
	}, [dates, ownership, decryptedId]);

	useEffect(() => {
		defaultValue.forEach((item: any) => {
			setUserOwned(item.user.name);
		});
	});

	const options = param
		? Array.from(
				new Map(
					ownership
						?.filter(
							(appointment) =>
								appointment.owner &&
								appointment.owner.name_entreprise &&
								appointment.owner.email
						)
						.map((appointment) => [
							appointment.owner.email,
							appointment.owner,
						])
				).values()
		  )
		: Array.from(
				new Map(
					ownership
						?.filter(
							(appointment) =>
								appointment.id &&
								appointment.user &&
								appointment.user.type === "MONITOR"
						)
						.map((appointment) => [
							appointment.user.id,
							appointment.user,
						])
				).values()
		  );

	useEffect(() => {
		if (options.length === 1) {
			setDefaultOption(options[0].email || options[0].id);
			setSelectedCompany(options[0].email || options[0].id);
		}
	}, [options]);

	const fromMonitor = options.filter((option) => option.id === decryptedId);
	const monitor = fromMonitor[0];

	return (
		<div className="font-sans rounded-md w-full mx-auto">
			<div className="w-full flex flex-col items-center justify-center gap-2">
				<div className="gap-2">
					<div>
						{toWho ? (
							<div>
								<label
									htmlFor="entreprise"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									Entreprise
								</label>
								<Select
									id="entreprise"
									showSearch
									value={selectedCompany}
									className="w-[360px] sm:w-[420px]"
									disabled={dates.length > 0 ? true : false}
									optionFilterProp="children"
									onChange={(value) =>
										setSelectedCompany(value)
									}
									size="large"
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
									<Option value="">
										{userOwned || "Sélectionner"}
									</Option>
									{param
										? Array.from(
												new Map(
													ownership
														?.filter(
															(appointment) =>
																appointment.owner &&
																appointment
																	.owner
																	.name_entreprise &&
																appointment
																	.owner.email
														)
														.map((appointment) => [
															appointment.owner
																.email,
															appointment.owner,
														])
												).values()
										  ).map((owner) => (
												<Option
													key={owner.email}
													value={owner.email}
												>
													{owner.name_entreprise}
												</Option>
										  ))
										: Array.from(
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
													{user.lastname}
												</Option>
										  ))}
								</Select>
							</div>
						) : (
							<span>
								{monitor
									? `${monitor.name} ${monitor.lastname}`
									: ""}
							</span>
						)}

						{toWho === undefined && (
							<div>
								<label
									htmlFor="entreprise2"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									Entreprise
								</label>
								<Select
									id="entreprise2"
									showSearch
									value={selectedCompany}
									className="w-[360px] sm:w-[420px]"
									disabled={options.length === 1}
									placeholder="Sélectionnez une entreprise"
									optionFilterProp="children"
									onChange={(value) =>
										setSelectedCompany(value)
									}
									size="large"
									filterOption={(
										input: string,
										option: any
									) => {
										if (
											option &&
											typeof option.children === "string"
										) {
											return option.children
												.toLowerCase()
												.includes(input.toLowerCase());
										}
										return false;
									}}
								>
									<Option value="">
										{userOwned || "Sélectionner"}
									</Option>
									{options.map((opt) => (
										<Option
											key={param ? opt.email : opt.id}
											value={param ? opt.email : opt.id}
										>
											{param
												? opt.name_entreprise
												: opt.name}
										</Option>
									))}
								</Select>
							</div>
						)}
						{param === true && (
							<>
								<div className="mt-3">
									<label
										htmlFor="title"
										className="block text-sm font-medium leading-6 text-gray-900 mb-1"
									>
										Titre de congé
									</label>
									<AutoComplete
										options={[
											{ value: "Congé payé" },
											{ value: "Congé non payé" },
											{ value: "RTT" },
											{ value: "Maladie" },
											{ value: "Autre" },
										]}
										className="w-full mt-1"
										id="title"
										size="large"
										value={dataTitle}
										onChange={(value: string) =>
											setDataTitle(value)
										}
										onSelect={(value: string) =>
											setDataTitle(value)
										}
										allowClear
									/>
								</div>
							</>
						)}
						{dataTitle === "Autre" && (
							<div className="mt-3">
								<label
									htmlFor="comment"
									className="block text-sm font-medium leading-6 text-gray-900 mb-1"
								>
									Commentaire
								</label>
								<TextArea
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									rows={4}
								/>
							</div>
						)}
						{toWho === undefined && (
							<>
								{Array.from(
									new Map(
										ownership
											?.filter(
												(appointment) =>
													appointment.owner &&
													appointment.owner
														.name_entreprise &&
													appointment.owner.email
											)
											.map((appointment) => [
												appointment.owner.email,
												appointment.owner,
											])
									).values()
								).map((owner) => (
									<Option
										key={owner.email}
										value={owner.email}
									>
										{owner.name_entreprise}
									</Option>
								))}
							</>
						)}
					</div>
				</div>

				<div className="mt-3">
					<label
						htmlFor="selectDates"
						className="block text-sm font-medium leading-6 text-gray-900 mb-1"
					>
						Séléctionner les dates
					</label>
					<div className="w-[360px] sm:w-[420px] border p-4 rounded">
						<div className="flex justify-between items-center mb-4 w-full ">
							<h2 className="text-xl font-bold">
								{currentMonth.toLocaleDateString("fr-FR", {
									year: "numeric",
									month: "long",
								})}
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
				{selectedDates.length > 0 && param === true && (
					<div className="w-[350px] sm:w-[420px] mt-3 space-y-4">
						<div>
							<label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
								Dates sélectionnées :
							</label>
							<ul className="list-none p-0">
								{renderSelectedDates()}
							</ul>
						</div>
						<div>
							<label
								className="block text-sm font-medium leading-6 text-gray-900"
								htmlFor="inputGroupFile01"
							>
								Séléctionner un fichier
							</label>
							<input
								type="file"
								className="form-control mt-1"
								id="inputGroupFile01"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setFile(file);
									}
								}}
							/>
						</div>
						<div className="flex items-center gap-3 justify-end">
							<button
								className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
								onClick={handleClearAllDates}
							>
								Tout supprimer
							</button>

							<button
								onClick={handleSendEmail}
								className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
							>
								Envoyer
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MultipleDayPicker;
