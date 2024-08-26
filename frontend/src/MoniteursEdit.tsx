import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "./axios";
import Button from "./components/Button";
import { ConfigProvider, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import fr_FR from "antd/locale/fr_FR";

import "dayjs/locale/fr";

dayjs.locale("fr");

export interface Monitor {
	title: string;
	name: string;
	lastname: string;
	phone: string;
	email: string;
	address: string;
	ville: string;
	codePostal: string;
	image: string;
	startDate: string;
	color: string;
	contratType: string;
}

function MoniteursEdit({ monitorId, onClose }) {
	const [data, setData] = useState({
		title: "",
		name: "",
		lastname: "",
		email: "",
		address: "",
		phone: "",
		ville: "",
		codePostal: "",
		image: "",
		startDate: "",
		color: "",
		contratType: "",
	});
	const [file, setFile] = useState<File | null>(null);

	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	const { id } = useParams();

	const {
		data: monitor,
		isLoading: loadingMonitor,
		error: errorMonitor,
	} = useSWR(`/users/get/${monitorId ?? id}`, async (url) => {
		if (!id && !monitorId) return null;
		return (await fetcher.get(url)).data as Monitor;
	});

	useEffect(() => {
		if (!monitor) return;

		const modifiedMonitorData = { ...monitor };
		if (modifiedMonitorData.phone) {
			modifiedMonitorData.phone = modifiedMonitorData.phone.slice(-14);
		}

		setData(modifiedMonitorData);
	}, [monitor]);

	const handlePhoneChange = (e) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone: formattedValue });
	};

	const handleInputChange = (fieldName, value) => {
		setData({ ...data, [fieldName]: value });
		setValidationErrors({ ...validationErrors, [fieldName]: "" });
		setShowSuccessMessage(false);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			setFile(file);
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const dataURL = reader.result as string;
				handleInputChange("image", dataURL);
			};
		} else {
			handleInputChange("image", "");
		}
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

	const handleSubmit = async (event: { preventDefault: () => void }) => {
		event.preventDefault();
		let imgUrl = null;
		if (file) {
			imgUrl = await handleUpload();
		}
		const updatedData = {
			...data,
			image: imgUrl ? imgUrl : data?.image ? data?.image : "",
		};
		fetcher
			.patch(`/users/update/monitor/${monitorId ?? id}`, updatedData)
			.then((res) => {
				if (res.data.success) {
					window.location.reload();
				}
			});
	};

	return (
		<div className="d-flex flex-column align-items-center py-2 px-4">
			{showSuccessMessage && (
				<div className="alert alert-success" role="alert">
					Modification réussie
				</div>
			)}
			<form className="row g-3 " onSubmit={handleSubmit}>
				<div className="col-6">
					<label htmlFor="inputName" className="form-label">
						Nom
					</label>
					<input
						type="text"
						className="form-control"
						id="inputName"
						placeholder="Entrer le Nom complet"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("name", e.target.value)
						}
						value={data.name}
					/>
					{validationErrors.name && (
						<span className="text-danger">
							{validationErrors.name}
						</span>
					)}
				</div>
				<div className="col-6">
					<label htmlFor="inputName" className="form-label">
						Prénom
					</label>
					<input
						type="text"
						className="form-control"
						id="inputName"
						placeholder="Entrer le Nom complet"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("lastname", e.target.value)
						}
						value={data.lastname}
					/>
					{validationErrors.lastname && (
						<span className="text-danger">
							{validationErrors.lastname}
						</span>
					)}
				</div>

				<div className="col-md-6">
					<label
						htmlFor="inputTitre"
						className="form-label text-gray-700"
					>
						Titre/spécialisation
					</label>
					<div className="input-group">
						<input
							type="text"
							className="form-control"
							id="inputTitre"
							autoComplete="off"
							value={data.title}
							onChange={(e) =>
								handleInputChange("title", e.target.value)
							}
						/>
					</div>
				</div>

				<div className="col-md-6">
					<label htmlFor="inputPhone" className="form-label">
						Numéro de téléphone
					</label>
					<input
						type="text"
						className="form-control"
						id="inputPhone"
						autoComplete="off"
						value={data.phone}
						onChange={handlePhoneChange}
					/>
					{validationErrors.phone && (
						<div className="text-danger mt-1">
							{validationErrors.phone}
						</div>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputEmail4" className="form-label">
						E-mail
					</label>
					<input
						type="email"
						className="form-control"
						id="inputEmail4"
						placeholder="Enter Email"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("email", e.target.value)
						}
						value={data.email}
					/>
					{validationErrors.email && (
						<span className="text-danger">
							{validationErrors.email}
						</span>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputcontrat" className="form-label">
						Type de contrat
					</label>
					<Select
						id="inputcontrat"
						className="w-full h-9"
						onChange={(value) =>
							setData((prev) => ({ ...prev, contratType: value }))
						}
						options={[
							{ value: "Temps plein", label: "Temps plein" },
							{ value: "Temps partiel", label: "Temps partiel" },
							{ value: "Contrat", label: "Contrat" },
							{
								value: "Travail temporaire",
								label: "Travail temporaire",
							},
							{ value: "Bénévolat", label: "Bénévolat" },
						]}
						value={data?.contratType}
					/>
				</div>

				<div className="col-12">
					<label htmlFor="inputAddress" className="form-label">
						Address
					</label>
					<input
						type="text"
						className="form-control"
						id="inputAddress"
						placeholder="Adresse Complete"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("address", e.target.value)
						}
						value={data.address}
					/>
					{validationErrors.address && (
						<span className="text-danger">
							{validationErrors.address}
						</span>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputHeure" className="form-label">
						Ville
					</label>
					<input
						type="text"
						className="form-control"
						id="inputVille"
						placeholder="Entrer la ville"
						autoComplete="off"
						onChange={(e) =>
							setData({ ...data, ville: e.target.value })
						}
						value={data.ville}
					/>
				</div>

				<div className="col-md-6">
					<label htmlFor="inputHeure" className="form-label">
						Code Postal
					</label>
					<input
						type="text"
						className="form-control"
						id="inputVille"
						placeholder="Entrer la ville"
						autoComplete="off"
						onChange={(e) =>
							setData({ ...data, codePostal: e.target.value })
						}
						value={data.codePostal}
					/>
				</div>

				<div className="col-md-6">
					<label className="form-label" htmlFor="startDate">
						Date d'Entrée
					</label>
					<ConfigProvider locale={fr_FR}>
						<DatePicker
							onChange={(_, dateString) =>
								setData((prev) => ({
									...prev,
									startDate: dateString,
								}))
							}
							className="w-full z-[999999px]"
							size="large"
							id="startDate"
							value={dayjs(data.startDate)}
						/>
					</ConfigProvider>
				</div>
				<div className="col-md-6">
					<label className="form-label" htmlFor="inputGroupFile01">
						Selectionner une Image
					</label>

					<input
						type="file"
						className="form-control"
						id="inputGroupFile01"
						onChange={handleFileChange}
					/>
				</div>

				<div className="col-12">
					<Button type="submit">Modifier</Button>
				</div>
			</form>
		</div>
	);
}

export default MoniteursEdit;
