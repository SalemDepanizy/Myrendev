import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { fetcher } from "./axios";
import useSWR from "swr";
import { styledToast } from "./components/ui/toasting";
import { CheckCheck } from "lucide-react";
import Button from "./components/Button";
import { Checkbox } from "antd";
import AddClients from "./addClients";

interface Forfait {
	id: number;
	name: string;
	heure: string;
}

interface Monitor {
	id: number;
	name: string;
	lastname: string;
}

interface StudentData {
	name: string;
	lastname: string;
	phone: string;
	phone2: string;
	phone3: string;
	email: string;
	password: string;
	address: string;
	//heure: string;
	// heuresup: string;
	image: string;
	//forfait: string;
	//monitor: string;
	ville: string;
	codePostal: string;
	userType: "Professionnel" | "Particulier"; // Add userType here
	companyName: ""; // Add companyName here
	etage?: string; // Optional etage field
	code_acces?: string; // Optional code_acces field
	code_acces_supplementaire?: string; // Optional code_acces_supplementaire field
	interphone?: string; // Optional interphone field
}

interface FormErrors {
	name?: string;
	lastname?: string;
	dateOfBirth?: string;
	phone?: string;
	email?: string;
	password?: string;
	address?: string;
	//heure?: string;
	// heuresup?: string;
	image?: string;
	//forfait?: string;
	//monitor?: string;
	ville?: string;
	codePostal?: string;
	userType?: string; // Add userType here
	companyName?: string; // Add companyName here
}

interface AddstudentsProps {
	onUserCreated?: () => void;
	closeIt?: () => void;
}

function Addstudents({ onUserCreated, closeIt }: AddstudentsProps) {
	const [errors, setErrors] = useState<FormErrors>({});
	const [emailFound, setEmailFound] = useState(false);
	const [emailAlreadyHere, setEmailAlreadyHere] = useState(false);
	const [foundItem, setFoundItem] = useState<any>();
	const [isSimilar, setIsSimilar] = useState(false);
	const referenceCode = "test";
	const [file, setFile] = useState<File | null>(null);

	const [data, setData] = useState<StudentData>({
		name: "",
		lastname: "",
		phone: "",
		phone2: "",
		phone3: "",
		email: "",
		password: "",
		address: "",
		ville: "",
		image: "",
		codePostal: "",
		userType: "Particulier",
		companyName: "",
		etage: "",
		code_acces: "",
		code_acces_supplementaire: "",
		interphone: "",
	});

	const {
		data: user,
		isLoading: loadinguser,
		error: erroruser,
	} = useSWR("/users/all", async (url) => {
		return (await fetcher.get(url)).data as any[];
	});
	const {
		data: ownedUsers,
		isLoading: loadingOwnedUsers,
		error: errorOwnedUsers,
	} = useSWR("/users/get/student", async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone: formattedValue });
	};

	const handlePhone2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone2: formattedValue });
	};

	const handlePhone3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone3: formattedValue });
	};

	const checkSimilarity = (text) => {
		const normalizedInput = text.trim().toLowerCase();
		const normalizedReference = referenceCode.trim().toLowerCase();
		const isInputSimilar = normalizedInput === normalizedReference;

		if (ownedUsers) {
			const OwnedUsersWithEmail = ownedUsers?.find(
				(user) => user.email === text
			);
			if (OwnedUsersWithEmail) {
				setEmailAlreadyHere(true);
			} else {
				setEmailAlreadyHere(false);
			}
		}

		if (user && emailAlreadyHere === false) {
			const userWithEmail = user?.find((user) => user.email === text);
			if (userWithEmail) {
				setFoundItem(userWithEmail);
				setEmailFound(true);
			} else {
				setEmailFound(false);
			}
		}

		return isInputSimilar;
	};
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setData({ ...data, [name]: value });
	};

	useEffect(() => {
		const isInputSimilar = checkSimilarity(data.email);
		setIsSimilar(isInputSimilar);
	}, [data.email, user]);

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

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const newErrors: FormErrors = {};
		if (!data.name) {
			newErrors.name = "Ce champ est obligatoire";
		}
		if (!data.lastname) {
			newErrors.lastname = "Ce champ est obligatoire";
		}
		if (!data.phone) {
			newErrors.phone = "Ce champ est obligatoire";
		}
		if (!data.email) {
			newErrors.email = "Ce champ est obligatoire";
		}
		if (!data.address) {
			newErrors.address = "Ce champ est obligatoire";
		}
		if (!data.ville) {
			newErrors.ville = "Ce champ est obligatoire";
		}
		if (!data.codePostal) {
			newErrors.codePostal = "Ce champ est obligatoire";
		}
		if (data.userType === "Professionnel" && !data.companyName) {
			newErrors.companyName = "Ce champ est obligatoire";
		}
		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) {
			return;
		}
		try {
			const randomPassword = Math.random().toString(36).slice(-8);
			let imgUrl = null;
			if (file) {
				imgUrl = await handleUpload();
			}

			fetcher
				.post("/users/create", {
					...data,
					password: randomPassword,
					type: "STUDENTS",
					image: imgUrl ? imgUrl : "",
				})
				.then((res) => {
					if (onUserCreated) {
						onUserCreated();
					}
				});

			if (Object.keys(newErrors).length === 0) {
				styledToast({
					title: "Ajouté avec succès",
					className: "bg-green-500 text-white",
					icon: <CheckCheck />,
					color: "text-white",
				});
			} else {
				styledToast({
					title: "Échec",
					className: "bg-red-500 text-white",
					color: "text-white",
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const close = () => {
		if (closeIt) {
			closeIt();
		}
	};
	const [newView, setNewView] = useState(false);

	const handleClickContinue = () => {
		setNewView(true);
	};

	const [showAdditionalCodeAcces, setShowAdditionalCodeAcces] =
		useState(false);
	const toggleAdditionalCodeAcces = () => {
		setShowAdditionalCodeAcces(!showAdditionalCodeAcces);
	};

	return (
		<div className="container">
			{!newView && (
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="flex items-center gap-3 mt-4">
						<label className="block text-sm font-medium leading-6 text-gray-900">
							Type d'utilisateur:
						</label>
						<div className="flex items-center gap-3">
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
								Professionnel
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
								Particulier
							</Checkbox>
						</div>
						{errors.userType && (
							<div className="text-danger">{errors.userType}</div>
						)}
					</div>
					{data.userType === "Professionnel" && (
						<div className="">
							<label
								htmlFor="companyName"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Nom de l'entreprise
							</label>
							<input
								type="text"
								id="companyName"
								name="companyName"
								className="form-control mt-1"
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
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label
								htmlFor="name"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Nom
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="name"
								autoComplete="off"
								value={data.name}
								onChange={(e) =>
									setData({ ...data, name: e.target.value })
								}
							/>
							{errors.name && (
								<p className="text-danger">{errors.name}</p>
							)}
						</div>
						<div className="flex-1">
							<label
								htmlFor="lastname"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Prénom
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="lastname"
								autoComplete="off"
								value={data.lastname}
								onChange={(e) =>
									setData({
										...data,
										lastname: e.target.value,
									})
								}
							/>
							{errors.lastname && (
								<p className="text-danger">{errors.lastname}</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								E-mail
							</label>
							<input
								type="email"
								className="form-control mt-1"
								id="email"
								autoComplete="off"
								value={data.email}
								onChange={(e) =>
									setData({ ...data, email: e.target.value })
								}
							/>
							{errors.email && (
								<p className="text-danger">{errors.email}</p>
							)}
							{emailFound && !emailAlreadyHere && (
								<p className="text-danger">
									Cet email est déjà utilisé
								</p>
							)}
							{emailAlreadyHere && (
								<p className="text-danger">
									Cet email est déjà dans vos registres
								</p>
							)}
						</div>

						<div className="flex-1">
							<label
								htmlFor="phone"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Numéro de téléphone
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="phone"
								autoComplete="off"
								value={data.phone}
								onChange={handlePhoneChange}
							/>
							{errors.phone && (
								<p className="text-danger">{errors.phone}</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<div className="flex items-center justify-between">
								<label
									htmlFor="phone2"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Numéro de téléphone 2
								</label>
								<span className="text-gray-500">Optionnel</span>
							</div>
							<input
								type="text"
								className="form-control mt-1"
								id="phone2"
								autoComplete="off"
								value={data.phone2}
								onChange={handlePhone2Change}
							/>
						</div>

						<div className="flex-1">
							<div className="flex items-center justify-between">
								<label
									htmlFor="phone3"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Numéro de téléphone 3
								</label>
								<span className="text-gray-500">Optionnel</span>
							</div>
							<input
								type="text"
								className="form-control mt-1"
								id="phone3"
								autoComplete="off"
								value={data.phone3}
								onChange={handlePhone3Change}
							/>
						</div>
					</div>
					<div className="col-12">
						<label
							htmlFor="address"
							className="block text-sm font-medium leading-6 text-gray-900"
						>
							Adresse
						</label>
						<input
							type="text"
							className="form-control mt-1"
							id="address"
							autoComplete="off"
							value={data.address}
							onChange={(e) =>
								setData({ ...data, address: e.target.value })
							}
						/>
						{errors.address && (
							<p className="text-danger">{errors.address}</p>
						)}
					</div>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label
								htmlFor="ville"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Ville
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="ville"
								value={data.ville}
								onChange={(e) =>
									setData({ ...data, ville: e.target.value })
								}
							/>
							{errors.ville && (
								<p className="text-danger">{errors.ville}</p>
							)}
						</div>
						<div className="flex-1">
							<label
								htmlFor="inputCodePostal"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Code Postal
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="inputCodePostal"
								value={data.codePostal}
								onChange={(e) =>
									setData({
										...data,
										codePostal: e.target.value,
									})
								}
							/>
							{errors.codePostal && (
								<p className="text-danger">
									{errors.codePostal}
								</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex-1">
							<label
								htmlFor="etage"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Étage
							</label>
							<input
								type="text"
								id="etage"
								name="etage"
								className="form-control mt-1"
								value={data.etage}
								onChange={(e) =>
									setData({ ...data, etage: e.target.value })
								}
							/>
						</div>
						<div className="flex-1">
							<label
								htmlFor="inter"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Interphone
							</label>
							<input
								type="text"
								className="form-control mt-1"
								id="inter"
								value={data.interphone}
								onChange={(e) =>
									setData({
										...data,
										interphone: e.target.value,
									})
								}
							/>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div
							className={
								showAdditionalCodeAcces
									? "flex-1"
									: "flex-0 w-[310px] mr-8"
							}
						>
							<label
								htmlFor="code_acces"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Code Accès
							</label>
							<div className="input-group">
								<input
									type="text"
									id="code_acces"
									name="code_acces"
									className="form-control mt-1"
									value={data.code_acces}
									onChange={(e) =>
										setData({
											...data,
											code_acces: e.target.value,
										})
									}
								/>
								<button
									type="button"
									className="btn btn-secondary text-base"
									onClick={toggleAdditionalCodeAcces}
								>
									{showAdditionalCodeAcces ? "-" : "+"}
								</button>
							</div>
						</div>
						{showAdditionalCodeAcces && (
							<div className="flex-1">
								<label
									htmlFor="code_acces_supplementaire"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Code Accès Supplémentaire
								</label>
								<input
									type="text"
									id="code_acces_supplementaire"
									name="code_acces_supplementaire"
									className="form-control mt-1"
									value={data.code_acces_supplementaire}
									onChange={(e) =>
										setData({
											...data,
											code_acces_supplementaire:
												e.target.value,
										})
									}
								/>
							</div>
						)}
					</div>
					<div className="">
						<label
							className="block text-sm font-medium leading-6 text-gray-900"
							htmlFor="inputGroupFile01"
						>
							Selectionner une Image
						</label>
						<input
							type="file"
							className="form-control mt-1"
							id="inputGroupFile01"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									setFile(file);
									const reader = new FileReader();
									reader.readAsDataURL(file);
									reader.onload = () => {
										const dataURL = reader.result as string;
										setData({ ...data, image: dataURL });
									};
								} else {
									setData({ ...data, image: "" });
								}
							}}
						/>
					</div>
					<div className="flex items-center gap-3 mt-4">
						<button
							onClick={close}
							className="w-1/3 border border-gray-100 py-2 rounded-lg mb-2 hover:bg-gray-50"
						>
							Annuler
						</button>
						<Button type="submit" className="w-1/3">
							Créer
						</Button>

						{emailFound && !emailAlreadyHere && (
							<button
								onClick={handleClickContinue}
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							>
								<p>Continuer avec ce mail</p>
							</button>
						)}
					</div>
				</form>
			)}

			{newView && <AddClients email={data.email} />}
		</div>
	);
}

export default Addstudents;
