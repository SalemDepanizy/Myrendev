import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetcher } from "./axios";
import { styledToast } from "./components/ui/toasting";
import { CheckCheck } from "lucide-react";
import Button from "./components/Button";
import useSWR from "swr";
import { useNotification } from "./components/NotificationContext"; // Import the notification context
import Select from "react-select";

interface AddForfaitProps {
	onForfaitCreated: () => void;
}

interface ForfaitData {
	name: string;
	heure: string;
	selectMorePeople: boolean;
	numberOfPeople: number;
	monitorId: string;
}
interface Monitor {
	id: number;
	name: string;
	lastname: string;
}
function AddForfait({ onForfaitCreated }: AddForfaitProps) {
	const [data, setData] = useState<ForfaitData>({
		name: "",
		heure: "",
		selectMorePeople: false,
		numberOfPeople: 1,
		monitorId: "",
	});
	const [horaires, setHoraires] = useState<Number>();
	const navigate = useNavigate();
	const { addNotification } = useNotification();
	const [minutes, setMinutes] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setHoraires(parseInt(data.heure) + minutes / 100);
	});

	const handleSubmit = (event: { preventDefault: () => void }) => {
		event.preventDefault();
		setIsSubmitting(true);
		const requestData = {
			...data,
			heure: horaires || 0,
			monitorId: data.monitorId || undefined,
		};

		fetcher
			.post("/forfait/create", requestData)
			.then((res) => {
				navigate("/forfait");
				onForfaitCreated();
				addNotification("Forfait créé avec succès !");
			})
			.catch((err) => {
				console.error("Error during request:", err);
			});
	};
	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	const monitorOptions =
		monitors?.map((monitor) => ({
			value: monitor.id.toString(), // Convert to string
			label: `${monitor.name} ${monitor.lastname}`,
		})) || [];

	// Ajouter une option supplémentaire "Random"
	monitorOptions.push({ value: "random", label: "Random" });

	const handleMonitorChange = (selectedOption) => {
		setData({
			...data,
			monitorId: selectedOption ? selectedOption.value : "",
		});
	};

	return (
		<div className="d-flex flex-column align-items-center mt-2 px-4">
			<form className="row g-3" onSubmit={handleSubmit}>
				<div className="col-12">
					<label htmlFor="inputName" className="form-label">
						Nom de l'intervention
					</label>
					<input
						type="text"
						className="form-control"
						id="inputName"
						autoComplete="off"
						onChange={(e) =>
							setData({ ...data, name: e.target.value })
						}
					/>
				</div>

				<div className="flex items-end gap-4">
					<div className="flex-1">
						<label htmlFor="inputHeure" className="form-label">
							Nombre d'heures
						</label>
						<input
							type="text"
							className="form-control"
							id="inputHeure"
							autoComplete="off"
							onChange={(e) =>
								setData({ ...data, heure: e.target.value })
							}
						/>
					</div>
					<div className="flex-1">
						<label
							htmlFor="inputHeureMinutes"
							className="form-label"
						>
							Minutes
						</label>
						<select
							className="form-control"
							id="inputHeureMinutes"
							value={minutes}
							onChange={(e) =>
								setMinutes(parseInt(e.target.value))
							}
						>
							<option value="0">0</option>
							<option value="15">15</option>
							<option value="30">30</option>
							<option value="45">45</option>
						</select>
					</div>
				</div>

				<div className="mt-4">
					<label
						htmlFor="monitorDropdown"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Sélectionnez un employer:
					</label>
					<Select
						value={monitorOptions.find(
							(option) => option.value === data.monitorId
						)}
						onChange={handleMonitorChange}
						options={monitorOptions}
						placeholder="Sélectionner un employé"
						isClearable
						isSearchable
					/>
				</div>

				<div className="col-12">
					<div className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							id="selectMorePeople"
							onChange={(e) =>
								setData({
									...data,
									selectMorePeople: e.target.checked,
								})
							}
						/>
						<label
							className="form-check-label"
							htmlFor="selectMorePeople"
						>
							De combien de personnes avez-vous besoin ?
						</label>
					</div>
				</div>
				{data.selectMorePeople && (
					<div className="col-12">
						<label htmlFor="numberOfPeople" className="form-label">
							Nombre de personnes à sélectionner
						</label>
						<input
							type="number"
							className="form-control"
							id="numberOfPeople"
							placeholder="Entrer le nombre de personnes"
							value={data.numberOfPeople}
							onChange={(e) =>
								setData({
									...data,
									numberOfPeople:
										parseInt(e.target.value, 10) || 0,
								})
							}
						/>
					</div>
				)}
				<div className="col-12">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="my-3 text-white bg-indigo-600 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2"
						onClick={() => {
							styledToast({
								title: "Ajouté avec succès",
								className: "bg-green-500 text-white",
								icon: <CheckCheck />,
								color: "text-white",
							});
						}}
					>
						{isSubmitting ? "En Cours..." : "Créer"}
					</Button>
				</div>
			</form>
		</div>
	);
}

export default AddForfait;
