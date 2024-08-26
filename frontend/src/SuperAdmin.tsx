import { useState } from "react";
import { FaBriefcase, FaUsers, FaEye } from "react-icons/fa";
import { useModal } from "./components/modal";
import { fetcher } from "./axios";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { Link } from "react-router-dom";
import { styledToast } from "./components/ui/toasting";
import { CheckCheck } from "lucide-react";
import Button from "./components/Button";
import { Popconfirm, message } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Email from "./emailAdmin";
import { Switch } from "@mui/material";
import useSWR, { mutate } from "swr";
export interface Commercial {
	id: string;
	name: string;
	email: string;
	type: string;
	creatorId?: string;
	creator?: any;
}

export interface FormErrors {
	name?: string;
	email?: string;
	password?: string;
	ville?: string;
	codePostal?: string;
}

export interface Entreprise {
	id: string;
	name_entreprise: string;
	name_manager: string;
	phone_entreprise: string;
	phone_manager: string;
	email: string;
	address: string;
	ville: string;
	codePostal: string;
	type: string;
	active: boolean;
	createdAt?: string;
	plan?: "BASIC" | "STARTUP" | "ENTREPRISE";
	creatorId?: string;
	creator?: any;
}

function SuperAdmin() {
	const [data, setData] = useState<{
		name: string;
		email: string;
		password: string;
		id: string | null;
	}>({
		name: "",
		email: "",
		password: "",
		id: null,
	});

	const [data2, setData2] = useState<{
		name_entreprise: string;
		name_manager: string;
		phone_entreprise: string;
		phone_manager: string;
		email: string;
		password: string;
		address: string;
		ville: string;
		codePostal: string;
		id: string | null;
		active: boolean;
	}>({
		name_entreprise: "",
		name_manager: "",
		phone_entreprise: "",
		phone_manager: "",
		email: "",
		password: "",
		address: "",
		ville: "",
		codePostal: "",
		active: true,
		id: null,
	});
	const [selectedCorp, setSelectedCorp] = useState<Entreprise | null>(null);

	const {
		data: commercials,
		isLoading: loadingCommercials,
		error: errorCommercials,
	} = useSWR("/users/get/commercial", async (url) => {
		return (await fetcher.get(url)).data as Commercial[];
	});

	const {
		data: entreprises,
		isLoading: loadingEntreprises,
		error: errorEntreprises,
	} = useSWR("/users/get/entreprise", async (url) => {
		return (await fetcher.get(url)).data as Entreprise[];
	});
	const [errors, setErrors] = useState<FormErrors>({});

	const handleSubmit = (event: { preventDefault: () => void }) => {
		event.preventDefault();

		const newErrors: FormErrors = {};

		if (!data.name) {
			newErrors.name = "Ce champ est obligatoire";
		}
		if (!data.email) {
			newErrors.email = "Ce champ est obligatoire";
		}
		setErrors(newErrors);

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

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			return;
		}
		const randomPassword = Math.random().toString(36).slice(-8); // Example random password generation

		fetcher
			.post("/users/create/commercial", {
				...data,
				password: randomPassword,
			})
			.then((res) => {
				window.location.reload();
			});
	};

	const handleSubmitEdit = (event: { preventDefault: () => void }) => {
		event.preventDefault();

		fetcher
			.patch("/users/update/" + data.id, {
				...data,
			})
			.then((res) => {
				window.location.reload();
			});
	};

	const handleSubmitEditEntreprise = (event: {
		preventDefault: () => void;
	}) => {
		event.preventDefault();
		fetcher
			.patch("/users/update/" + data2.id, {
				...data2,
			})
			.then((res) => {
				window.location.reload();
			});
	};
	const showMessage = (type, content) => {
		message[type](content);
	};

	const handleSubmit2 = (event: { preventDefault: () => void }) => {
		event.preventDefault();
		const randomPassword = Math.random().toString(36).slice(-8); // Example random password generation

		fetcher
			.post("/users/create/entreprise", {
				...data2,
				password: randomPassword,
			})
			.then((res) => {
				window.location.reload();
			});
	};

	const { Modal, openModal, closeModal } = useModal();
	const {
		Modal: ModalView,
		openModal: openModalView,
		closeModal: closeModalView,
	} = useModal();

	const {
		Modal: ModalEdit,
		openModal: openModalEdit,
		closeModal: closeModalEdit,
	} = useModal();
	const {
		Modal: Modal2,
		openModal: OpenModal2,
		closeModal: closeModal2,
	} = useModal();

	const {
		Modal: ModalEditEntreprise,
		openModal: OpenModalEditEntreprise,
		closeModal: closeModalEditEntreprise,
	} = useModal();

	const {
		Modal: ModalEmailEntreprise,
		openModal: OpenModalEmailEntreprise = (entreprises) => {
			setSelectedCorp(entreprises);
		},
		closeModal: closeModalEmailEntreprise,
	} = useModal();

	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleDelete = (id) => {
		fetcher.delete(`/users/delete/${id}`).then((res) => {
			if (res.data.success) {
				showMessage("success", "Supprimée avec succès.");
				setTimeout(() => {
					window.location.reload();
				}, 600);
			} else {
				showMessage("error", "Failed to delete");
			}
		});
	};

	const formatPhoneNumber = (input) => {
		// Remove all non-numeric characters
		let numbers = input.replace(/\D/g, "");

		// Limit length to 11 characters
		numbers = numbers.substring(0, 10);

		// Format the numbers: 1 space after the first digit, then after every 2 digits
		const formatted = numbers.split("").reduce((acc, digit, index) => {
			if (index !== 0 && index % 2 === 0) {
				return acc + " " + digit;
			}
			return acc + digit;
		}, "");

		return formatted;
	};
	const commercialCount = commercials ? commercials.length : 0;
	const entrepriseCount = entreprises ? entreprises.length : 0;

	const handleToggleActive = async (id, active) => {
		try {
			const response = await fetcher.patch(`/users/update-status/${id}`, {
				active,
			});
			if (response.data.success) {
				// Display success message
				message.success(
					`Entreprise ${active ? "activé" : "désactivé"} avec succès`
				);
				// Refresh the list of entreprises to reflect the change
				mutate("/users/get/entreprise");
			} else {
				throw new Error("Failed to update entreprise status");
			}
		} catch (error) {
			// Display error message
			message.error("Error updating entreprise status");
		}
	};
	function formatDate(dateString) {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, "0")}/${(
			date.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")}/${date.getFullYear()}`;
	}
	const [showDetailedModal, setShowDetailedModal] = useState(false);
	const [selectedEntreprise, setSelectedEntreprise] =
		useState<Entreprise | null>(null);

	const openDetailedInfoModal = (entreprise: Entreprise) => {
		setSelectedEntreprise(entreprise);
		setShowDetailedModal(true);
		openModalView();
	};

	const closeDetailedInfoModal = () => {
		setShowDetailedModal(false);
	};
	return (
		<main className="flex-1 overflow-x-hidden overflow-y-auto bg-white h-full">
			<div className="container px-6 py-8 mx-auto">
				<div className="max-w-lg">
					<h3 className="text-gray-600 text-2xl font-bold sm:text-3xl">
						Tableau de bord
					</h3>
					<p className="text-gray-600 mt-2">
						Accédez rapidement à vos données et suivez vos
						performances en un coup d'œil.
					</p>
				</div>

				<div className="mt-4">
					<div className="flex flex-wrap -mx-6">
						<div className="w-full px-6 sm:w-1/2 xl:w-1/3">
							<Link
								to="/commercial"
								className="focus:outline-none"
							>
								<div className="flex items-center px-5 py-6 bg-white rounded-3xl shadow-sm">
									<div className="p-3 bg-indigo-600 bg-opacity-75 rounded-full">
										<FaUsers className="w-8 h-8 text-white" />
									</div>

									<div className="mx-5">
										<h4 className="text-2xl font-semibold text-gray-700">
											{commercialCount}
										</h4>
										<div className="text-gray-500">
											Total Commercial{" "}
										</div>
									</div>
								</div>
							</Link>
						</div>

						<div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
							<div className="flex items-center px-5 py-6 bg-white rounded-3xl shadow-sm">
								<div className="p-3 bg-orange-600 bg-opacity-75 rounded-full">
									<FaBriefcase className="w-8 h-8 text-white" />
								</div>

								<div className="mx-5">
									<h4 className="text-2xl font-semibold text-gray-700">
										{entrepriseCount}
									</h4>
									<div className="text-gray-500">
										Total Entreprises
									</div>
								</div>
							</div>
						</div>

						<div className="w-full px-6 mt-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
							<div className="flex items-center px-5 py-6 bg-white rounded-3xl shadow-sm">
								<div className="p-3 bg-pink-600 bg-opacity-75 rounded-full">
									<FaBriefcase className="w-8 h-8 text-white" />
								</div>

								<div className="mx-5">
									<h4 className="text-2xl font-semibold text-gray-700">
										"à venir"
									</h4>
									<div className="text-gray-500">
										Total BTP
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="container mx-auto py-6 sm:px-6">
					<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
						<div className="flex justify-between">
							<h2 className="text-2xl font-semibold leading-tight">
								Liste Des Commerciaux
							</h2>
							<Button
								onClick={openModal}
								className="btn btn-success"
							>
								Ajouter un commercial
							</Button>
						</div>
					</div>
					<ModalEdit title="Modifier un Commercial">
						<form
							className="w-full h-full"
							onSubmit={handleSubmitEdit}
						>
							<div>
								<div className="mt-4">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="name"
									>
										Nom Complet:
									</label>
									<input
										type="text"
										id="name"
										value={data.name}
										className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										placeholder="Enter name"
										onChange={(e) =>
											setData({
												...data,
												name: e.target.value,
											})
										}
									/>
								</div>
								<div className="mt-4">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="email"
									>
										E-mail:
									</label>
									<input
										type="email"
										value={data.email}
										id="email"
										className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										placeholder="Enter email"
										onChange={(e) =>
											setData({
												...data,
												email: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<Button
									className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover:bg-gray-300"
									onClick={closeModalEdit}
								>
									Annuler
								</Button>
								<Button
									type="submit"
									className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover:bg-teal-400"
								>
									Modifier
								</Button>
							</div>
						</form>
					</ModalEdit>

					<Modal title="Ajouter un Commercial">
						<form className="w-full h-full" onSubmit={handleSubmit}>
							<div>
								<div className="mt-4">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="name"
									>
										Nom Complet:
									</label>
									<input
										type="text"
										id="name"
										className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										placeholder="Enter name"
										onChange={(e) =>
											setData({
												...data,
												name: e.target.value,
											})
										}
									/>
								</div>
								<div className="mt-4">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="email"
									>
										E-mail:
									</label>
									<input
										type="email"
										id="email"
										className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										placeholder="Enter email"
										onChange={(e) =>
											setData({
												...data,
												email: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<Button
									className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover:bg-gray-300"
									onClick={closeModal}
								>
									Annuler
								</Button>
								<Button
									type="submit"
									className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover:bg-teal-400"
								>
									Ajouter
								</Button>
							</div>
						</form>
					</Modal>

					<div className="-mx-4 sm:-mx-6 sm:px-6 overflow-x-auto">
						<div className="py-4 align-middle inline-block min-w-full sm:px-6">
							<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
								<table className="min-w-full divide-y divide-gray-200">
									<thead>
										<tr>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Nom Complet
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Email
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Titre d'emploi
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Créateur du compte
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Action
											</th>
										</tr>
									</thead>
									<tbody>
										{/* Sample table rows */}
										{commercials?.map(
											(commercials, index) => {
												return (
													<tr key={index}>
														<td className="px-6 py-4">
															<div className="text-sm font-medium leading-5 text-gray-900">
																{
																	commercials?.name
																}
															</div>
														</td>
														<td className="px-6 py-4">
															<div className="text-sm font-medium leading-5 text-gray-900">
																{
																	commercials?.email
																}
															</div>
														</td>
														<td className="px-6 py-4">
															<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
																{
																	commercials?.type
																}
															</span>
														</td>
														<td className="px-6 py-4">
															<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
																{commercials?.creator
																	? `${commercials?.creator?.name} ${commercials?.creator?.lastname}`
																	: ""}
															</span>
														</td>
														<td className="px-6 py-4">
															<Stack
																direction="row"
																spacing={1}
															>
																<IconButton
																	onClick={() => {
																		setData(
																			{
																				email: commercials?.email,
																				name: commercials?.name,
																				password:
																					"",
																				id: commercials?.id,
																			}
																		);

																		openModalEdit();
																	}}
																	color="primary"
																	aria-label="add to shopping cart"
																>
																	<ModeEditIcon />
																</IconButton>

																<Popconfirm
																	title="Supprimer"
																	description="Êtes-vous sûr de vouloir le supprimer ?"
																	onConfirm={() =>
																		handleDelete(
																			commercials.id.toString()
																		)
																	}
																	okText={
																		<span className="text-red-500">
																			Oui
																		</span>
																	}
																	icon={
																		<QuestionCircleOutlined
																			style={{
																				color: "red",
																			}}
																		/>
																	}
																	cancelText="Non"
																>
																	<IconButton aria-label="delete">
																		<DeleteIcon />
																	</IconButton>
																</Popconfirm>
															</Stack>
														</td>
													</tr>
												);
											}
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<div className="container mx-auto py-6 sm:px-6">
					<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
						<div className="flex justify-between">
							<h2 className="text-2xl font-semibold leading-tight">
								Liste Des Entreprises
							</h2>
							<Button
								onClick={OpenModal2}
								className="btn btn-success"
							>
								Ajouter une Entreprise
							</Button>

							<ModalEmailEntreprise title="Email">
								<div className="flex">
									<div className="w-auto">
										<Email email={data2.email} />
									</div>
								</div>
							</ModalEmailEntreprise>

							<ModalEditEntreprise title="Modifier une Entreprise">
								<form
									className="w-full h-full"
									onSubmit={handleSubmitEditEntreprise}
								>
									<div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="name"
											>
												Nom De l'Entreprise :
											</label>
											<input
												type="text"
												id="name"
												value={data2.name_entreprise}
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter name"
												onChange={(e) =>
													setData2({
														...data2,
														name_entreprise:
															e.target.value,
													})
												}
											/>
										</div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="name"
											>
												Nom Du Responsable :
											</label>
											<input
												type="text"
												id="name"
												value={data2.name_manager}
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter name"
												onChange={(e) =>
													setData2({
														...data2,
														name_manager:
															e.target.value,
													})
												}
											/>
										</div>

										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="phone"
											>
												Téléphone Entreprise :
											</label>
											<div className="input-group">
												<span className="input-group-text">
													+33
												</span>
												<input
													type="text"
													id="phoneEntreprise"
													className="form-control"
													placeholder="Enter phone number"
													value={
														data2.phone_entreprise
													}
													onChange={(e) =>
														setData2({
															...data2,
															phone_entreprise:
																formatPhoneNumber(
																	e.target
																		.value
																),
														})
													}
												/>
											</div>
										</div>

										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="phone"
											>
												Téléphone Résponsable :
											</label>
											<div className="input-group">
												<span className="input-group-text">
													+33
												</span>
												<input
													type="text"
													className="form-control"
													id="inputPhone"
													placeholder="Entrez le numéro de téléphone"
													autoComplete="off"
													value={data2.phone_manager}
													onChange={(e) =>
														setData2({
															...data2,
															phone_manager:
																formatPhoneNumber(
																	e.target
																		.value
																),
														})
													}
												/>
											</div>
										</div>

										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="email"
											>
												E-mail:
											</label>
											<input
												type="email"
												id="email"
												value={data2.email}
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter email"
												onChange={(e) =>
													setData2({
														...data2,
														email: e.target.value,
													})
												}
											/>
										</div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold"
												htmlFor="adresse"
											>
												Adresse:
											</label>
											<input
												type="text"
												id="adresse"
												value={data2.address}
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-3"
												placeholder="Enter address"
												onChange={(e) =>
													setData2({
														...data2,
														address: e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="col-md-6">
										<label
											htmlFor="inputVille"
											className="form-label"
										>
											Ville
										</label>
										<input
											type="text"
											className="form-control"
											id="inputVille"
											placeholder="Ville"
											value={data2.ville}
											onChange={(e) =>
												setData2({
													...data2,
													ville: e.target.value,
												})
											}
										/>
										{errors.ville && (
											<p className="text-danger">
												{errors.ville}
											</p>
										)}
									</div>

									<div className="col-md-6">
										<label
											htmlFor="inputCodePostal"
											className="form-label"
										>
											Code Postal
										</label>
										<input
											type="text"
											className="form-control"
											id="inputCodePostal"
											placeholder="Code Postal"
											value={data2.codePostal}
											onChange={(e) =>
												setData2({
													...data2,
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
									<div className="flex justify-end pt-2">
										<Button
											className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover:bg-gray-300"
											onClick={closeModalEditEntreprise}
										>
											Annuler
										</Button>
										<Button
											type="submit"
											className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover:bg-teal-400"
										>
											Modifier
										</Button>
									</div>
								</form>
							</ModalEditEntreprise>
							<Modal2 title="Ajouter une entreprise">
								<form
									className="w-full h-full"
									onSubmit={handleSubmit2}
								>
									<div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="name"
											>
												Nom De l'Entreprise :
											</label>
											<input
												type="text"
												id="name"
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter name"
												onChange={(e) =>
													setData2({
														...data2,
														name_entreprise:
															e.target.value,
													})
												}
											/>
										</div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="name"
											>
												Nom Du Responsable :
											</label>
											<input
												type="text"
												id="name"
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter name"
												onChange={(e) =>
													setData2({
														...data2,
														name_manager:
															e.target.value,
													})
												}
											/>
										</div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="phone"
											>
												Téléphone Entreprise :
											</label>
											<div className="input-group">
												<span className="input-group-text">
													+33
												</span>
												<input
													type="text"
													id="phoneEntreprise"
													className="form-control"
													placeholder="Enter phone number"
													value={
														data2.phone_entreprise
													}
													onChange={(e) =>
														setData2({
															...data2,
															phone_entreprise:
																formatPhoneNumber(
																	e.target
																		.value
																),
														})
													}
												/>
											</div>
										</div>

										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="phone"
											>
												Téléphone Résponsable :
											</label>
											<div className="input-group">
												<span className="input-group-text">
													+33
												</span>
												<input
													type="text"
													className="form-control"
													id="inputPhone"
													placeholder="Entrez le numéro de téléphone"
													autoComplete="off"
													value={data2.phone_manager}
													onChange={(e) =>
														setData2({
															...data2,
															phone_manager:
																formatPhoneNumber(
																	e.target
																		.value
																),
														})
													}
												/>
											</div>
										</div>

										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold mb-2"
												htmlFor="email"
											>
												E-mail:
											</label>
											<input
												type="email"
												id="email"
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
												placeholder="Enter email"
												onChange={(e) =>
													setData2({
														...data2,
														email: e.target.value,
													})
												}
											/>
										</div>
										<div className="mt-4">
											<label
												className="block text-gray-700 text-sm font-bold"
												htmlFor="adresse"
											>
												Adresse:
											</label>
											<input
												type="text"
												id="adresse"
												className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-3"
												placeholder="Enter address"
												onChange={(e) =>
													setData2({
														...data2,
														address: e.target.value,
													})
												}
											/>
										</div>
									</div>

									<div className="flex justify-between">
										<div className="w-1/2 mr-2">
											<label
												htmlFor="inputVille"
												className="block text-gray-700 text-sm font-bold mb-2"
											>
												Ville
											</label>
											<input
												type="text"
												className="form-control"
												id="inputVille"
												placeholder="Ville"
												value={data2.ville}
												onChange={(e) =>
													setData2({
														...data2,
														ville: e.target.value,
													})
												}
											/>
										</div>
										<div className="w-1/2 ml-2">
											<label
												htmlFor="inputCodePostal"
												className="block text-gray-700 text-sm font-bold mb-2"
											>
												Code Postal
											</label>
											<input
												type="text"
												className="form-control"
												id="inputCodePostal"
												placeholder="Code Postal"
												value={data2.codePostal}
												onChange={(e) =>
													setData2({
														...data2,
														codePostal:
															e.target.value,
													})
												}
											/>
										</div>
									</div>
									<div className="flex justify-end pt-2">
										<Button
											className="focus:outline-none modal-close px-4 bg-gray-400 p-3 rounded-lg text-black hover:bg-gray-300"
											onClick={closeModal2}
										>
											Annuler
										</Button>
										<Button
											type="submit"
											className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover:bg-teal-400"
										>
											Ajouter
										</Button>
									</div>
								</form>
							</Modal2>
						</div>
					</div>

					<div className="-mx-4 sm:-mx-6 sm:px-6 overflow-x-auto">
						<div className="py-4 align-middle inline-block min-w-full sm:px-6">
							<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
								<table className="min-w-full divide-y divide-gray-200">
									<thead>
										<tr>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Nom de l'entreprise
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Créer
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												email
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												status
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Contacter
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Offre
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Actions
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Voir
											</th>
											<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
												Activer ou desactiver
											</th>
										</tr>
									</thead>
									<tbody>
										{entreprises?.map(
											(entreprises, index) => {
												return (
													<tr key={index}>
														<td className="px-6 py-4">
															{/* Insert the image tag */}
															<div className="text-sm font-medium leading-5 text-gray-900">
																{
																	entreprises?.name_entreprise
																}
															</div>
															<div className="text-sm leading-5 text-gray-500">
																Entreprise
															</div>
														</td>
														<td className="text-sm font-medium leading-5 text-gray-900s">
															<span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
																<span
																	aria-hidden
																	className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
																></span>
																{entreprises?.createdAt
																	? formatDate(
																			entreprises?.createdAt
																	  )
																	: "N/A"}
															</span>
														</td>
														<td className="px-6 py-4">
															<div className="text-sm font-medium leading-5 text-gray-900">
																{
																	entreprises?.email
																}
															</div>
														</td>

														<td className="px-6 py-4">
															<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
																{entreprises?.active
																	? "ACTIVE"
																	: "INACTIVE"}
															</span>
														</td>
														<td className="px-6 py-4 text-center">
															<span className="inline-flex items-center justify-center px-2 text-xs font-semibold leading-5">
																<FontAwesomeIcon
																	style={{
																		color: "#1976d2",
																		cursor: "pointer",
																		fontSize:
																			"25px",
																		padding:
																			"5px",
																	}}
																	icon={
																		faEnvelope
																	}
																	onClick={() => {
																		setData2(
																			{
																				name_entreprise:
																					entreprises.name_entreprise,
																				name_manager:
																					entreprises.name_manager,
																				phone_entreprise:
																					entreprises.phone_entreprise,
																				phone_manager:
																					entreprises.phone_manager,
																				email: entreprises.email,
																				address:
																					entreprises.address,
																				ville: "",
																				codePostal:
																					"",
																				password:
																					"",
																				id: entreprises.id,
																				active: entreprises.active,
																			}
																		);

																		OpenModalEmailEntreprise(
																			entreprises
																		);
																	}}
																/>
															</span>
														</td>
														<td className="text-sm font-medium tracking-wide">
															{entreprises?.plan ===
															"BASIC"
																? "Basic plan"
																: entreprises?.plan ===
																  "STARTUP"
																? "Startup"
																: entreprises?.plan ===
																  "ENTREPRISE"
																? "Entreprise"
																: "Pas choisi"}
														</td>
														<td className="px-6 py-4">
															<Stack
																direction="row"
																spacing={1}
															>
																<IconButton
																	onClick={() => {
																		setData2(
																			{
																				name_entreprise:
																					entreprises?.name_entreprise,
																				name_manager:
																					entreprises?.name_manager,
																				phone_entreprise:
																					entreprises?.phone_entreprise,
																				phone_manager:
																					entreprises?.phone_manager,
																				email: entreprises?.email,
																				address:
																					entreprises?.address,
																				ville: "",
																				codePostal:
																					"",
																				password:
																					"",
																				id: entreprises?.id,
																				active: entreprises?.active,
																			}
																		);

																		OpenModalEditEntreprise();
																	}}
																	color="primary"
																	aria-label="add to shopping cart"
																>
																	<ModeEditIcon />
																</IconButton>

																<Popconfirm
																	title="Supprimer"
																	description="Êtes-vous sûr de vouloir le supprimer ?"
																	onConfirm={() =>
																		handleDelete(
																			entreprises.id.toString()
																		)
																	}
																	okText={
																		<span className="text-red-500">
																			Oui
																		</span>
																	}
																	icon={
																		<QuestionCircleOutlined
																			style={{
																				color: "red",
																			}}
																		/>
																	}
																	cancelText="Non"
																>
																	<IconButton aria-label="delete">
																		<DeleteIcon />
																	</IconButton>
																</Popconfirm>
															</Stack>
														</td>
														<td className="px-6 py-4 text-center">
															<FaEye
																onClick={() =>
																	openDetailedInfoModal(
																		entreprises
																	)
																}
																style={{
																	cursor: "pointer",
																}}
															/>
														</td>
														<td className="px-6 py-4">
															<Switch
																checked={
																	entreprises?.active
																}
																onChange={() =>
																	handleToggleActive(
																		entreprises?.id,
																		!entreprises?.active
																	)
																}
																color="primary"
															/>
														</td>
													</tr>
												);
											}
										)}
									</tbody>
								</table>
							</div>
						</div>
						<ModalView
							open={showDetailedModal}
							onHide={closeDetailedInfoModal}
						>
							<div>
								<p>
									<strong>Nom:</strong>{" "}
									{selectedEntreprise?.name_entreprise}
								</p>
								<p>
									<strong>Nom du manager:</strong>{" "}
									{selectedEntreprise?.name_manager}
								</p>
								<p>
									<strong>téléphone de l'entreprise:</strong>{" "}
									{selectedEntreprise?.phone_entreprise}
								</p>
								<p>
									<strong>téléphone Manager:</strong>{" "}
									{selectedEntreprise?.phone_manager}
								</p>
								<p>
									<strong>address:</strong>{" "}
									{selectedEntreprise?.address}
								</p>
								<p>
									<strong>ville:</strong>{" "}
									{selectedEntreprise?.ville}
								</p>
								<p>
									<strong>Email:</strong>{" "}
									{selectedEntreprise?.email}
								</p>
								<p>
									<strong>titre:</strong>{" "}
									{selectedEntreprise?.type}
								</p>
								<p>
									<strong>Status:</strong>{" "}
									{selectedEntreprise?.active
										? "Active"
										: "Inactive"}
								</p>
								<p className="max-w-[40ch] text-sm">
									<span className="font-bold text-black">
										Créateur du compte:
									</span>{" "}
									{selectedEntreprise?.creator?.name}{" "}
									{selectedEntreprise?.creator?.lastname}
								</p>
							</div>
						</ModalView>
					</div>
				</div>
			</div>
		</main>
	);
}

export default SuperAdmin;
