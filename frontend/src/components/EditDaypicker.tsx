import { useEffect, useState } from "react";
import { Modal as AntModal, AutoComplete, message } from "antd";
import useSWR from "swr";
import { fetcher } from "../axios";
import { Monitor } from "src/Moniteurs";
import TextArea from "antd/es/input/TextArea";

const EditDayPicker = ({ id }: { id: string }) => {
	const {
		data: superpositions,
		isLoading: loadingSuperpositions,
		error: errorSuperpositions,
	} = useSWR(`/disponibilite/get/superposition/${id}`, async (url) => {
		return (await fetcher.get(url)).data as any;
	});

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		const monitors = (await fetcher.get(url)).data as Monitor[];
		const updatedMonitors = monitors?.map((monitor) => ({
			...monitor,
			value: monitor?.id,
			label: `${monitor?.name} ${monitor?.lastname}`,
		}));
		return updatedMonitors;
	});

	const [title, setTitle] = useState<string>("");
	const [comment, setComment] = useState<string>("");
	const [visible, setVisible] = useState(false);
	const [selectedDates, setSelectedDates] = useState<Date[]>([]);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [rangeStart, setRangeStart] = useState<Date | null>(null);
	const [selectedEmploye, setSelectedEmploye] = useState<{
		value: string;
		label: string;
	}>({ value: "tous", label: "Tous" });
	const [file, setFile] = useState<File | null>(null);
	const [oldFile, setOldFile] = useState<string>("");

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

	const renderCalendarDays = (startDate: Date): JSX.Element[] => {
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
			const isSelected = selectedDates.some((date) =>
				isSameDay(date, currentDate)
			);

			daysArray.push(
				<div
					key={currentDate.toISOString()}
					className={`p-2 cursor-pointer text-center  rounded-full ${
						isSelected ? "bg-blue-500 text-white" : "bg-white-200"
					}`}
					onClick={() => handleDateClick(currentDate)}
					onMouseDown={() => handleDateMouseDown(currentDate)}
					onMouseEnter={() => handleDateMouseEnter(currentDate)}
					onMouseUp={handleDateMouseUp}
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
			const response = await fetcher.patch(
				`disponibilite/update/superposition/${id}`,
				{
					titre: title,
					newDates: selectedDates,
					userId: selectedEmploye?.value,
					comment,
					file: imgUrl ? imgUrl : oldFile,
				}
			);

			if (response.status === 200) {
				message.success("Dates ajouter avec succès");
				setVisible(false);
				window.location.reload();
			} else {
				console.error("Échec.");
			}
		} catch (error) {
			console.error("Erreur :", error);
			alert(error);
		}
	};

	useEffect(() => {
		if (visible && superpositions?.id) {
			setTitle(superpositions?.titre);
			setSelectedEmploye(
				superpositions?.user?.type === "ENTREPRISE"
					? { value: "tous", label: "Tous" }
					: {
							value: superpositions?.user?.id,
							label: `${superpositions?.user?.name} ${superpositions?.user?.lastname}`,
					  }
			);
			setComment(superpositions?.comment);
			const defaultDates = (superpositions?.disabledDates || []).map(
				(d: string) => new Date(d)
			);
			setOldFile(superpositions?.file);
			const defaultSelectedDates = [...defaultDates];
			setSelectedDates(defaultSelectedDates);
		}
	}, [superpositions, visible]);

	return (
		<div className="">
			<div
				className="flex items-center text-blue-500 cursor-pointer justify-center"
				onClick={() => setVisible(true)}
			>
				<button className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg">
					modifier
				</button>
			</div>
			<AntModal
				title={
					<span className="text-2xl font-bold text-gray-700">
						Modifier Une Superposition
					</span>
				}
				open={visible}
				onCancel={() => setVisible(false)}
				footer={[]}
			>
				<div className="font-sans p-3 rounded-md w-full max-w-screen-lg mx-auto flex justify-center items-center flex-col gap-3">
					<div className="w-full flex flex-col">
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
								className="w-full mt-1"
								id="title"
								size="large"
								value={title}
								onChange={(value: string) => setTitle(value)}
								onSelect={(value: string) => setTitle(value)}
								allowClear
							/>
						</div>
						{title === "Autre" && (
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
								/>
							</div>
						)}
						<div className="mb-3">
							<label
								htmlFor="employe"
								className="block text-base font-medium leading-6 text-gray-900"
							>
								Employe
							</label>
							<AutoComplete
								options={[
									{ value: "tous", label: "Tous" },
								]?.concat(monitors!)}
								className="w-full mt-1"
								id="employe"
								size="large"
								value={selectedEmploye?.label}
								onChange={(value: string, option: any) =>
									setSelectedEmploye({
										value,
										label: option?.label,
									})
								}
								onSelect={(value: string, option: any) =>
									setSelectedEmploye({
										value,
										label: option?.label,
									})
								}
								allowClear
							/>
						</div>
						<div className="w-full border p-4 rounded bg-white">
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

						<div className="flex gap-4 w-full">
							<div className="px-4 w-full">
								<h3 className="text-lg font-bold mt-4 mb-2">
									Dates sélectionnées :
								</h3>
								<ul className="list-none p-0">
									{renderSelectedDates()}
								</ul>
							</div>
						</div>
						<div>
							<label
								className="block text-sm font-medium leading-6 text-gray-900"
								htmlFor="inputGroupFile01"
							>
								Selectionner un fichier
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
						<div className="w-full">
							<div className="flex  gap-2 justify-end">
								<button
									className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
									onClick={handleClearAllDates}
								>
									Tout supprimer
								</button>
								<button
									onClick={handleSendData}
									className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
								>
									Confirmer la modification
								</button>
							</div>
						</div>
					</div>
				</div>
			</AntModal>
		</div>
	);
};

export default EditDayPicker;
