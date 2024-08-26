import React, { useEffect, useState } from "react";
import { Select, message, InputNumber, Switch } from "antd";
import { fetcher } from "./axios";
import { useAuth } from "./lib/hooks/auth";
import useSWR from "swr";

export interface CorpSetting {
	id: string;
	corpData: number;
	dayMoment: string;
	maxSlots: number;
	confirmationChoice: boolean;
	numberDays: number;
	numberWeeks: number;
}

function SettingsPage() {
	const [isCustomChecked, setIsCustomChecked] = useState(false);
	const [customNumber, setCustomNumber] = useState(0);
	const [predefinedNumber, setPredefinedNumber] = useState(false);
	const [predefinedNumber2, setPredefinedNumber2] = useState(false);
	const [settingToSend, setSettingToSend] = useState(0);
	const { Option } = Select;
	const [timePairs, setTimePairs] = useState<
		{ startTime: string; endTime: string }[]
	>([]);
	const [momentValue, setMomentValue] = useState<string>("");
	const [inputValue, setInputValue] = useState<number>(0);
	const [switchValue, setSwitchValue] = useState<boolean>(false);
	const [inputValueDay, setInputValueDay] = useState<number>(0);
	const [inputValueWeek, setInputValueWeek] = useState<number>(0);

	const { user } = useAuth();

	const {
		data: settings,
		isLoading: loadingSettings,
		error: errorSettings,
		mutate: refreshSettings,
	} = useSWR("/CorpSetting/get/corpsetting", async (url) => {
		const SettingData = (await fetcher.get(url)).data as CorpSetting[];

		return SettingData;
	});

	const [threeByThree, setThreeByThree] = useState(false);
	const [oneByOne, setOneByOne] = useState(false);

	const corpDataV = settings?.[0]?.corpData;

	let threeOneThree = corpDataV === 3;
	let oneOnOne = corpDataV === 1;

	useEffect(() => {
		if (threeOneThree) {
			setThreeByThree(true);
		} else {
			setThreeByThree(false);
		}
	}, [threeOneThree]);

	useEffect(() => {
		if (oneOnOne) {
			setOneByOne(true);
		} else {
			setOneByOne(false);
		}
	}, [oneOnOne]);

	useEffect(() => {
		console.log(settings);
	}, [settings]);

	const handlePredefinedCheckboxChange = (checkbox: string) => {
		if (checkbox === "predefinedNumber") {
			setPredefinedNumber(true);
			setPredefinedNumber2(false);
			setIsCustomChecked(false);
			setCustomNumber(0);
			setSliderValues([]);
			setThreeByThree(false);
			setOneByOne(false);
		} else if (checkbox === "predefinedNumber2") {
			setPredefinedNumber(false);
			setPredefinedNumber2(true);
			setIsCustomChecked(false);
			setCustomNumber(0);
			setSliderValues([]);
			setThreeByThree(false);
			setOneByOne(false);
		}
	};

	useEffect(() => {
		if (predefinedNumber) {
			setSettingToSend(3);
		}
	}, [predefinedNumber]);

	useEffect(() => {
		if (predefinedNumber2) {
			setSettingToSend(1);
		}
	}, [predefinedNumber2]);

	useEffect(() => {
		if (customNumber > 0) {
			setSettingToSend(customNumber);
		}
	}, [customNumber]);

	const handleCustomCheckboxChange = () => {
		setIsCustomChecked(!isCustomChecked);
		setPredefinedNumber(false);
		setPredefinedNumber2(false);
		setCustomNumber(0);
		setSettingToSend(0);
	};

	const corpData = settingToSend;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = parseInt(e.target.value);
		if (value > 5) {
			value = 5;
		}
		if (value < 0) {
			value = 0;
		}
		setCustomNumber(value);
		setPredefinedNumber(false);
		setPredefinedNumber2(false);
		setIsCustomChecked(false);
	};

	const addTimePair = () => {
		setTimePairs([...timePairs, { startTime: "", endTime: "" }]);
	};

	const handleTimeChange = (
		index: number,
		type: "startTime" | "endTime",
		value: string
	) => {
		const newTimePairs = [...timePairs];
		newTimePairs[index][type] = value;
		setTimePairs(newTimePairs);
	};

	const customTimeslots = timePairs.map(
		(tp) => `${tp.startTime} - ${tp.endTime}`
	);

	const numComportment = () => {
		setPredefinedNumber(false);
		setPredefinedNumber2(false);
		setIsCustomChecked(false);
		setSliderValues([]);
	};

	const [sliderData, setSliderData] = useState<string[]>([]);
	const handleDataFromSliderChild = (sliderData: string[]) => {
		setSliderData(sliderData);
	};

	const defaultSliderValues = [0, 10];

	const [sliderValues, setSliderValues] = useState(defaultSliderValues);
	const [selectedSliderValues, setSelectedSliderValues] =
		useState(defaultSliderValues);

	const handleSliderChange = (values: number[]) => {
		setSelectedSliderValues(values);
		setSliderValues(values);
	};

	const handleAddHandleClick = () => {
		const updatedValues = [...sliderValues];
		if (updatedValues.length + 2 <= 10) {
			// Limite à 6 handles au total (3 paires)
			const handle1 = Math.floor(Math.random() * 24);
			const handle2 = handle1 + 1;
			updatedValues.push(handle1, handle2);
			updatedValues.sort((a, b) => a - b); // Trie pour maintenir l'ordre
			setSliderValues(updatedValues);
		}
	};

	const handleRemoveHandleClick = () => {
		const updatedValues = [...sliderValues];
		if (updatedValues.length - 2 >= 2) {
			// Vérifie s'il reste au moins une paire de handles
			updatedValues.splice(-2, 2); // Supprime les deux dernières valeurs du tableau
			setSliderValues(updatedValues);
		}
	};

	const pairsToStringArray = () => {
		const pairs: string[] = [];
		for (let i = 0; i < sliderValues.length; i += 2) {
			pairs.push(`${sliderValues[i]}-${sliderValues[i + 1]}`);
		}
		return pairs;
	};

	const sliderValuesStringArray = pairsToStringArray();

	//   const sliderData = sliderValuesStringArray;

	//   const sendDataToParent = () => {
	//     // const corpData = settingToSend;
	//     onDataFromSliderChild(sliderData);
	//   };
	const onChange = (value) => {
		setInputValue(value);
	};

	const onChangeSwitch = (checked: boolean) => {
		setSwitchValue(checked);
	};

	const onChangeDay = (value) => {
		setInputValueDay(value);
	};

	const onChangeWeek = (value) => {
		setInputValueWeek(value);
	};
	//////////////   SUBMIT     ////////////////////

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await fetcher.post("CorpSetting/create", {
				...(corpData > 0 && { corpData: corpData }),
				dayMoment: momentValue,
				maxSlots: inputValue,
				corpId: user?.id,
				confirmationChoice: switchValue,
				numberDays: inputValueDay,
				numberWeeks: inputValueWeek,
			});

			if (response.status === 200) {
				message.success("Modifié avec succès");
				// Appeler la fonction de rappel lorsque l'e-mail est envoyé avec succès
			} else {
				message.error("Échec de l'envoi de l'e-mail.");
			}
		} catch (error) {
			console.error("Erreur lors de l'envoi de l'e-mail:", error);
			message.error("Échec de l'envoi de l'e-mail.");
		}
	};

	return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<form onSubmit={handleSubmit} className="w-full max-w-4xl">
				<div className="bg-white p-8 rounded-lg shadow-lg space-y-6">
					<h1 className="text-3xl font-bold text-center text-gray-900">
						Paramètres
					</h1>
					<div className="setting">
						<label className="block mb-2">
							Créneau horaire d'activité :{" "}
						</label>
						<div className="wrapper flex flex-col justify-center">
							<div className="flex flex-row items-center gap-2 mt-2">
								<label htmlFor="setting">
									3 heures/3 heures
								</label>

								<div>{sliderData}</div>

								<input
									id="checkbox"
									type="checkbox"
									value=""
									className="w-5 h-4 text-blue-500 bg-gray-100 border-blue-300 rounded
                  focus:ring-orange-500 dark:focus:ring-blue-500 dark:ring-offset-blue-400 focus:ring-2
                  dark:bg-yellow-700 dark:border-gray-600"
									onChange={() =>
										handlePredefinedCheckboxChange(
											"predefinedNumber"
										)
									}
									checked={threeByThree || predefinedNumber}
									// onClick={enableInputNum}
								/>
							</div>

							<div className="flex flex-row items-center gap-2 mt-2">
								<label htmlFor="setting">heures/heures</label>
								<input
									id="checkbox"
									type="checkbox"
									value=""
									className="w-5 h-4 text-blue-500 bg-gray-100 border-blue-300 rounded
                  focus:ring-orange-500 dark:focus:ring-blue-500 dark:ring-offset-blue-400 focus:ring-2
                   dark:bg-yellow-700 dark:border-gray-600"
									onChange={() =>
										handlePredefinedCheckboxChange(
											"predefinedNumber2"
										)
									}
									checked={oneByOne || predefinedNumber2}
									// onClick={enableInputNum}
								/>
							</div>

							<label className="block mt-2">
								Choisissez votre propre tranche d'heures :
							</label>
							<input
								className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
								type="number"
								min="0"
								max="5"
								value={customNumber}
								onChange={handleInputChange}
								onClick={numComportment}
								id="iNumber"
							/>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<label>
							A quel moment de la journé souhaite vous afficher
							les disponibilite ?
						</label>
						<Select
							className="w-24"
							showSearch
							onChange={(value) => setMomentValue(value)}
							placeholder="Sélectionner"
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
							defaultValue="tous" // Ajout de cette ligne pour définir la valeur par défaut
						>
							<Option value="all">{"Tous"}</Option>
							<Option value="morning">{"Matin"}</Option>
							<Option value="post-morning">{"Après-midi"}</Option>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<span>Nombre de créneau autorisé</span>
						<InputNumber
							className="w-24"
							min={1}
							max={10}
							defaultValue={0}
							onChange={onChange}
						/>
					</div>
					<div className="flex flex-col gap-2 ">
						<span>Par approbation ou automatiquement </span>
						<Switch className="w-3" onChange={onChangeSwitch} />
					</div>
					<div className="flex flex-col gap-2 ">
						<span>Combien de journé seront affichés </span>
						<InputNumber
							className="w-24"
							min={1}
							max={10}
							defaultValue={0}
							onChange={onChangeDay}
						/>
					</div>
					<div className="flex flex-col gap-2 ">
						<span>Combien de semaines seront disponibles </span>
						<InputNumber
							className="w-24"
							min={1}
							max={10}
							defaultValue={0}
							onChange={onChangeWeek}
						/>
					</div>

					<button
						type="submit"
						className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-700"
					>
						Enregistré
					</button>
				</div>
			</form>
		</div>
	);
}

export default SettingsPage;
