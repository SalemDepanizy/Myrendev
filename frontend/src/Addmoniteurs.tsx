import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { fetcher } from "./axios";
import "dayjs/locale/zh-cn";
import "dayjs/locale/fr";
import {
	UploadProps,
	message,
	Upload,
	Checkbox,
	ConfigProvider,
	DatePicker,
	Select,
} from "antd";
import Button from "./components/Button";
import useSWR from "swr";
import { Monitor } from "./Moniteurs";
import { InboxOutlined } from "@ant-design/icons";
import { UploadRequestOption } from "rc-upload/lib/interface";
import dayjs from "dayjs";
import fr_FR from "antd/locale/fr_FR";

import "dayjs/locale/fr";

dayjs.locale("fr");

const { Dragger } = Upload;

interface MoniteurData {
	name: string;
	lastname: string;
	title?: string;
	phone: string;
	email: string;
	password: string;
	address: string;
	image: string;
	ville: string;
	codePostal: string;
	userType: "Professionnel" | "Particulier";
	companyName: "";
	startDate: string;
	color: string;
	contratType: string;
}

interface MoniteurErrors {
	name?: string;
	lastname?: string;
	title?: string;
	phone?: string;
	email?: string;
	password?: string;
	address?: string;
	image?: string;
	ville?: string;
	codePostal?: string;
	userType?: "Professionnel" | "Particulier";
	companyName?: "";
}

interface AddMoniteurProps {
	onMoniteurCreated: () => void;
}

function Addmoniteurs({ onMoniteurCreated }: AddMoniteurProps) {
	const {
		data: monitors,
		error: errorMonitors,
		mutate: refresh,
	} = useSWR<Monitor[]>("/users/get/monitor", (url) =>
		fetcher.get(url).then((response) => response.data)
	);
	const [data, setData] = useState<MoniteurData>({
		name: "",
		lastname: "",
		title: "",
		phone: "",
		email: "",
		password: "",
		address: "",
		ville: "",
		image: "",
		codePostal: "",
		userType: "Professionnel",
		companyName: "",
		startDate: "",
		color: "",
		contratType: "",
	});
	const [file, setFile] = useState<File | null>(null);

	const navigate = useNavigate();

	const generateRandomColor = (monitors) => {
		const randomColor =
			"#" + Math.floor(Math.random() * 16777215).toString(16);

		const isSameColorExists = monitors?.some(
			(monitor) => monitor.color === randomColor
		);

		if (isSameColorExists) {
			return generateRandomColor(monitors);
		}

		return randomColor;
	};

	const von = generateRandomColor(monitors);

	const [errors, setErrors] = useState<MoniteurErrors>({
		name: "",
		lastname: "",
		title: "",
		phone: "",
		email: "",
		password: "",
		address: "",
		ville: "",
		image: "",
		codePostal: "",
	});

	const handleInputChange = (
		fieldName: keyof MoniteurData,
		value: string
	) => {
		setData({ ...data, [fieldName]: value });
		setErrors({ ...errors, [fieldName]: "" });
	};
	const handleTitleChange = (
		fieldName: keyof MoniteurData,
		value: string
	) => {
		setData({ ...data, [fieldName]: value });
		setErrors({ ...errors, [fieldName]: "" });
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setData({ ...data, [name]: value });
	};

	const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		handleInputChange("phone", formattedValue);
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			setFile(file);
		}
	};

	const [draggedFile, setDraggedFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleDraggerFileChange = (info: any) => {
		const { status } = info.file;
		if (status !== "uploading") {
		}
		if (status === "done") {
			setDraggedFile(info.file.originFileObj);
			message.success(`${info.file.name} file uploaded successfully.`);
		} else if (status === "error") {
			message.error(`${info.file.name} file upload failed.`);
		}
	};
	const draggerProps: UploadProps = {
		name: "file",
		multiple: false,
		onChange: handleDraggerFileChange,
		customRequest: (options: UploadRequestOption) => {
			const { file, onSuccess, onError } = options;
			setTimeout(() => {
				onSuccess?.("ok");
			}, 0);
		},
		onDrop(e) {
			console.log("Dropped files", e.dataTransfer.files);
		},
	};

	const handleUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!draggedFile) return false;

		const formData = new FormData();
		formData.append("file", draggedFile);

		try {
			const res = await fetcher.post(
				"http://localhost:3000/upload",
				formData
			);
			return res?.data;
		} catch (err) {
			console.error("Error uploading file", err);
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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newErrors: MoniteurErrors = {};

		if (!data.name) newErrors.name = "Le champ nom est requis.";
		if (!data.lastname) newErrors.lastname = "Le champ prénom est requis.";
		if (!data.phone)
			newErrors.phone = "Le champ numéro de téléphone est requis.";
		if (!data.email) newErrors.email = "Le champ email est requis.";
		const existingEmail = monitors?.some(
			(monitor) => monitor.email === data.email
		);
		if (existingEmail) newErrors.email = "Ce moniteur existe de déjà.";
		if (!data.address) newErrors.address = "Le champ adresse est requis.";
		if (!data.ville) newErrors.ville = "Le champ mot de passe est requis.";
		if (!data.codePostal)
			newErrors.codePostal = "Le champ adresse est requis.";

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			setIsSubmitting(true);
			const fileUrl = await handleUploadFile(event);

			const randomPassword = Math.random().toString(36).slice(-8);
			const titre = data.title ? data.title : "";

			try {
				let imgUrl = null;
				if (file) {
					imgUrl = await handleUpload();
				}
				await fetcher.post("/users/create/monitor", {
					...data,
					password: randomPassword,
					image: imgUrl ? imgUrl : "",
					title: titre,
				});
				if (onMoniteurCreated) onMoniteurCreated();
				message.success("Moniteur créé avec succès");
				navigate("/moniteurs");
			} catch (error) {
				console.error("Error creating monitor:", error);
				message.error("Échec de la création du moniteur");
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const uploadProps: UploadProps = {
		name: "file",
		action: "https://api.myrendev.com/upload",
		headers: {
			authorization: "authorization-text",
		},
		onChange(info) {
			if (info.file.status !== "uploading") {
				console.log(info.file, info.fileList);
			}
			if (info.file.status === "done") {
				message.success(
					`${info.file.name} file uploaded successfully.`
				);
			} else if (info.file.status === "error") {
				message.error(`${info.file.name} file upload failed.`);
			}
		},
	};

	return (
		<div className="d-flex flex-column align-items-center pt-2 px-4">
			<form className="row g-3" onSubmit={handleSubmit}>
				<div className="flex">
					<div className="col-md-6">
						<label className="mb-1">Type d'utilisateur:</label>
						<div>
							<Checkbox
								onChange={(e) =>
									setData({
										...data,
										userType: e.target.checked
											? "Professionnel"
											: "Particulier",
									})
								}
								checked={data.userType === "Professionnel"}
							>
								Employer
							</Checkbox>
							<Checkbox
								onChange={(e) =>
									setData({
										...data,
										userType: e.target.checked
											? "Particulier"
											: "Professionnel",
									})
								}
								checked={data.userType === "Particulier"}
							>
								Externe
							</Checkbox>
						</div>
						{errors.userType && (
							<div className="text-danger">{errors.userType}</div>
						)}
					</div>
					{data.userType === "Particulier" && (
						<div className="col-md-6">
							<label htmlFor="companyName" className="form-label">
								Nom de l'entreprise
							</label>
							<input
								type="text"
								id="companyName"
								name="companyName"
								className="form-control"
								value={data.companyName}
								onChange={handleChange}
							/>
							{errors.companyName && (
								<div className="text-danger">
									{errors.companyName}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputName" className="form-label">
						Nom
					</label>
					<input
						type="text"
						className="form-control"
						id="inputName"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("name", e.target.value)
						}
					/>
					{errors.name && (
						<span className="text-danger">{errors.name}</span>
					)}
				</div>
				<div className="col-md-6">
					<label htmlFor="inputLastName" className="form-label">
						Prénom
					</label>
					<input
						type="text"
						className="form-control"
						id="inputLastName"
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("lastname", e.target.value)
						}
					/>
					{errors.lastname && (
						<span className="text-danger">{errors.lastname}</span>
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
					{errors.phone && (
						<div className="text-danger mt-1">{errors.phone}</div>
					)}
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
					{errors.phone && (
						<div className="text-danger mt-1">{errors.phone}</div>
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
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("email", e.target.value)
						}
					/>
					{errors.email && (
						<span className="text-danger">{errors.email}</span>
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
						autoComplete="off"
						onChange={(e) =>
							handleInputChange("address", e.target.value)
						}
					/>
					{errors.address && (
						<span className="text-danger">{errors.address}</span>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputVille" className="form-label">
						Ville
					</label>
					<input
						type="text"
						className="form-control"
						id="inputVille"
						value={data.ville}
						onChange={(e) =>
							setData({ ...data, ville: e.target.value })
						}
					/>
					{errors.ville && (
						<p className="text-danger">{errors.ville}</p>
					)}
				</div>

				<div className="col-md-6">
					<label htmlFor="inputCodePostal" className="form-label">
						Code Postal
					</label>
					<input
						type="text"
						className="form-control"
						id="inputCodePostal"
						value={data.codePostal}
						onChange={(e) =>
							setData({ ...data, codePostal: e.target.value })
						}
					/>
					{errors.codePostal && (
						<p className="text-danger">{errors.codePostal}</p>
					)}
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
						/>
					</ConfigProvider>
				</div>
				<div className="col-md-6">
					<label className="form-label" htmlFor="inputGroupFile01">
						Sélectionner une Image
					</label>

					<input
						type="file"
						className="form-control"
						id="inputGroupFile01"
						onChange={handleFileChange}
					/>
					{errors.image && (
						<span className="text-danger">{errors.image}</span>
					)}
				</div>
				<div className="mt-4 col-md-12">
					<Dragger {...draggerProps} height={150}>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">
							Cliquez ou faites glisser le fichier dans cette zone
							pour le télécharger
						</p>
					</Dragger>
				</div>
				<div className="col-12 mt-5">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "En Cours..." : "Créer"}
					</Button>
				</div>
			</form>
		</div>
	);
}

export default Addmoniteurs;
