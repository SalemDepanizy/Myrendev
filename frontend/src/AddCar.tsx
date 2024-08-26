import { useEffect, useState } from "react";
import { FaCar } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "./axios";
import {
	Popconfirm,
	message,
	ConfigProvider,
	DatePicker,
	Modal,
	Upload,
} from "antd";
import { CarOutlined } from "@ant-design/icons";
import type { RcFile, UploadProps } from "antd/es/upload";
import Select from "react-select";
import Button from "./components/Button";
import { QuestionCircleOutlined } from "@ant-design/icons";
import CarEdit from "./CarEdit";
import frFR from "antd/es/locale/fr_FR";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
const { Dragger } = Upload;

const { RangePicker } = DatePicker;

dayjs.locale("fr");

export interface Vehicule {
	id: number;
	vehiculeType: string;
	vehicleBrand: string;
	plate: string;
	type: string;
	monitorId: string;
	monitor: {
		id: string;
		name: string | null;
		lastname: string | null;
		phone: string | null;
		email: string;
	};
	startDate: string;
	endDate: string;
	carteGris?: string;
	assurance?: string;
	permis?: string;
	files?: any[];
}
interface FileData {
	filename: string;
	originalFilename: string;
}
interface Monitor {
	id: number;
	name: string;
	lastname: string;
}

const getBase64 = (file: RcFile) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

function AddCar() {
	const [selectedDates, setSelectedDates] = useState<any[] | null>([]);
	const [data, setData] = useState({
		vehiculeType: "",
		vehicleBrand: "",
		plate: "",
		type: "",
		monitorId: "",
		startDate: "",
		endDate: "",
		carteGris: "",
		assurance: "",
		permis: "",
		files: [],
	});
	const [carteGris, setCarteGris] = useState<File | null>(null);
	const [assurance, setAssurance] = useState<File | null>(null);
	const [permis, setPermis] = useState<File | null>(null);
	const [files, setFiles] = useState<RcFile[]>([]);
	const [fileList, setFileList] = useState<any[]>([]);
	const [previewOpen, setPreviewOpen] = useState<boolean>(false);
	const [previewImage, setPreviewImage] = useState<string>("");
	const [previewTitle, setPreviewTitle] = useState<string>("");
	const [open, setOpen] = useState<boolean>(false);
	const [selectedVihecule, setSelectedVihecule] = useState<Vehicule | null>(
		null
	);

	const handleCancelPreview = () => {
		setPreviewOpen(false);
	};

	const handlePreview = async (file: any) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}
		setPreviewImage(file.url || file.preview);
		setPreviewOpen(true);
		setPreviewTitle(
			file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
		);
	};

	const beforeUpload = (file: RcFile) => {
		const image = file.type.startsWith("image/");
		const video = file.type.startsWith("video/");

		if (!image && !video) {
			message.error("Le fichier doit être une image ou une vidéo.");
			return false;
		}
		return true;
	};

	const propsDragger: UploadProps = {
		name: "files",
		multiple: true,
		onPreview: handlePreview,
		beforeUpload: beforeUpload,
		maxCount: 5,
		fileList: fileList?.length > 0 ? fileList : undefined,
		listType: "picture",
		customRequest: () => {},
		onChange(info) {
			const { status } = info.file;
			if (info.file.status === "uploading") {
				info.file.status = "done";
			}
			if (info.file.status === "done") {
				let filesImage: RcFile[] = [];
				info.fileList.forEach((item) => {
					if (item?.originFileObj) {
						filesImage.push(item.originFileObj);
					}
				});
				setFiles(filesImage);
				setFileList(info.fileList);
				const allUploaded = info.fileList.every(
					(file) => file.status === "done"
				);
				if (allUploaded) {
					message.success(
						"Toutes les fichers sélectionnées ont été téléchargées avec succès."
					);
				}
			} else if (status === "error") {
				message.error(
					`${info.file.name} l'image n'a pas pu être téléchargée.`
				);
			}
		},
		onDrop(e) {
			console.log("Dropped files", e.dataTransfer.files);
		},
		onRemove(file) {
			const updatedFileList = fileList.filter(
				(item) => item.uid !== file.uid
			);
			setFileList(updatedFileList);
			setFiles(
				updatedFileList
					.map((item: any) => item.originFileObj)
					.filter(Boolean) as RcFile[]
			);
			message.success("Le fichier à été supprimé avec succès.");
		},
		progress: {
			strokeColor: {
				"0%": "#E114E5",
				"100%": "#4F46E5",
			},
			size: 3,
			format: (percent) =>
				percent && `${parseFloat(percent.toFixed(2))}%`,
		},
	};

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	const [selectedVehicleType, setSelectedVehicleType] = useState("");

	const {
		data: vehicules,
		isLoading: loadingVehicules,
		error: errorVehicules,
		mutate: refresh,
	} = useSWR("/vehicule/all", async (url) => {
		const vehicules = (await fetcher.get(url)).data as Vehicule[];
		return vehicules;
	});

	const handleDelete = (id: number) => {
		fetcher.delete(`/vehicule/delete/${id}`).then((res) => {
			if (res.data.success) {
				message.success("Véhicule supprimé avec succès.");
				refresh();
			} else {
				alert("Error");
			}
		});
	};

	const vehiculeCount = vehicules ? vehicules.length : 0;

	const models = [
		"ALFA ROMEO",
		"ALPINE",
		"ALFA ROMEO",
		"ALPINE",
		"ARIEL",
		"AUDI",
		"BMW",
		"CHEVROLET",
		"CHRYSLER",
		"CITROEN",
		"CUPRA",
		"DACIA",
		"DAEWOO",
		"DAIHATSU",
		"DODGE",
		"DS AUTOMOBILES",
		"FIAT",
		"FORD",
		"GMC",
		"HONDA",
		"HYUNDAI",
		"INFINITI",
		"ISUZU",
		"JAGUAR",
		"JEEP",
		"KIA",
		"LANCIA",
		"LAND ROVER",
		"LEXUS",
		"MARUTI SUZUKI",
		"MAZDA",
		"MERCEDES BENZ",
		"Mercedes-AMG",
		"MG",
		"MINI",
		"MITSUBISHI",
		"NISSAN",
		"OPEL",
		"PEUGEOT",
		"RENAULT",
		"SAAB",
		"SEAT",
		"SKODA",
		"SMART",
		"SSANGYONG",
		"SUBARU",
		"SUZUKI",
		"TESLA",
		"TOYOTA",
		"VOLKSWAGEN",
		"VOLVO",
		"AUTRE",
	];

	const vehicleTypes = [
		{ value: "Voiture", label: "Voiture" },
		{ value: "Moto", label: "Moto" },
	];

	const [editVehicule, setEditVehicule] = useState<Vehicule | null>(null);

	const openEditVehiculeModal = (vehicule) => {
		setEditVehicule(vehicule);
	};

	const closeEditVehiculeModal = () => {
		setEditVehicule(null);
	};

	const [searchQuery, setSearchQuery] = useState("");

	const filteredVehicules = vehicules
		? vehicules.filter((vehicule) => {
				const monitorFullName = vehicule.monitor
					? `${vehicule.monitor.name} ${vehicule.monitor.lastname}`
					: "";
				const match =
					vehicule.vehicleBrand
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					vehicule.plate
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					vehicule.type
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					monitorFullName
						.toLowerCase()
						.includes(searchQuery.toLowerCase());

				return match;
		  })
		: [];

	useEffect(() => {
		if (selectedDates && selectedDates.length === 2) {
			const [start, end] = selectedDates;
			setData({
				...data,
				startDate: start.toISOString(),
				endDate: end.toISOString(),
			});
		}
	}, [selectedDates]);

	const handleUpload = async (file: File) => {
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

	const handleUploads = async () => {
		try {
			if (files && files.length > 0) {
				const formData = new FormData();
				files.forEach((file: RcFile) => {
					formData.append("files", file);
				});
				const res = await fetcher.post(`uploads`, formData);
				if (res?.status === 201) {
					return res?.data;
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = async (event: { preventDefault: () => void }) => {
		event.preventDefault();
		try {
			let cartGrisUrl = null;
			let assuranceUrl = null;
			let permisUrl = null;
			let filesUrl = null;
			if (carteGris) {
				cartGrisUrl = await handleUpload(carteGris);
			}
			if (assurance) {
				assuranceUrl = await handleUpload(assurance);
			}
			if (permis) {
				permisUrl = await handleUpload(permis);
			}
			if (files.length > 0) {
				filesUrl = await handleUploads();
			}
			const res = await fetcher.post("/vehicule/create", {
				...data,
				carteGris: cartGrisUrl ? cartGrisUrl : "",
				assurance: assuranceUrl ? assuranceUrl : "",
				permis: permisUrl ? permisUrl : "",
				files: filesUrl ? filesUrl : [],
			});
			window.location.reload();
		} catch (error) {
			console.error("Error creating vehicule:", error);
		}
	};

	return (
		<div className="container px-6 py-8 mx-auto">
			<h3 className="text-3xl font-medium text-gray-700 mb-8">
				Gestion des Véhicules
			</h3>
			<div className="flex items-center p-6 bg-white rounded-3xl shadow-md hover:shadow-lg w-96 border border-gray-900/10">
				<div className="p-3 bg-green-600 bg-opacity-75 rounded-full">
					<FaCar className="w-8 h-8 text-white" />
				</div>

				<div className="mx-5">
					<h4 className="text-2xl font-semibold text-gray-700">
						{vehiculeCount}
					</h4>
					<span className="text-gray-500">Total Véhicule</span>
				</div>
			</div>

			<div className="container mx-auto py-6 sm:px-6">
				<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
					<div className="flex justify-between">
						<h2 className="text-2xl font-semibold leading-tight">
							Liste Des Véhicules
						</h2>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-between">
								<div className="flex bg-gray-50 items-center p-2 gap-3 rounded-lg border border-gray-900/10">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-gray-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										/>
									</svg>
									<input
										className="bg-gray-50 outline-none block"
										type="text"
										name="search"
										placeholder="Recherche..."
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
									/>
								</div>
							</div>
							<Button onClick={() => setOpen(true)}>
								Ajouter un véhicule
							</Button>
						</div>
					</div>
				</div>
				<Modal
					title={
						<span className="text-xl font-bold">
							Ajouter un Véhicule
						</span>
					}
					open={open}
					onCancel={() => setOpen(false)}
					footer={[]}
					width={750}
				>
					<form className="px-3 h-full" onSubmit={handleSubmit}>
						<div className="flex items-center gap-4 mt-3">
							<div
								className={`w-1/2 ${
									selectedVehicleType ? "flex-1" : ""
								}`}
							>
								<label
									className="block text-gray-700 text-sm font-bold mb-2"
									htmlFor="vehicle-type-dropdown"
								>
									Type de véhicule:
								</label>
								<Select
									options={vehicleTypes}
									onChange={(selectedOption) => {
										setSelectedVehicleType(
											selectedOption?.value ?? ""
										);
										setData({
											...data,
											vehiculeType:
												selectedOption?.value ?? "",
										});
									}}
									placeholder="Sélectionnez le type de véhicule"
								/>
							</div>

							{selectedVehicleType === "Voiture" && (
								<div className="flex-1">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="car-brand-dropdown"
									>
										Marque du véhicule:
									</label>
									<Select
										options={models.map((e) => ({
											value: e,
											label: e,
										}))}
										onChange={(selectedOption) =>
											setData({
												...data,
												vehicleBrand:
													selectedOption?.value ?? "",
											})
										}
										placeholder="Sélectionnez la marque du véhicule"
									/>
								</div>
							)}

							{selectedVehicleType === "Moto" && (
								<div className="flex-1">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="moto-brand-dropdown"
									>
										Marque de la moto:
									</label>
									<Select
										options={[
											"HARLEY-DAVIDSON",
											"KTM",
											"BMW",
											"HONDA",
											"YAMAHA",
											"TRIUMPH",
											"KAWASAKI",
											"SUZUKI",
											"DUCATI",
											"AUTRE",
										].map((e) => ({
											value: e,
											label: e,
										}))}
										onChange={(selectedOption) =>
											setData({
												...data,
												vehicleBrand:
													selectedOption?.value ?? "",
											})
										}
										placeholder="Sélectionnez la marque de la moto"
									/>
								</div>
							)}
						</div>

						<label
							className="block text-gray-700 text-sm font-bold mt-4 mb-2 "
							htmlFor="immatriculation-input uppercase"
						>
							Immatriculation:
						</label>
						<div className="flex border bg-white w-full items-center  ">
							<div className="flex items-center justify-center bg-none-800 text-white ">
								<span className="font-bold ">
									<img
										src="Images/plaque_blue_left.png"
										className="w-6 h-auto select-none"
										draggable="false"
									/>
								</span>
							</div>

							<input
								type="text"
								placeholder="AA-123-AA"
								className="flex-grow text-center uppercase tracking-widest border-l pl-2 pr-2 outline-none"
								style={{
									fontFamily: "Oswald, sans-serif",
								}}
								onChange={(e) =>
									setData({
										...data,
										plate: e.target.value,
									})
								}
							/>
							<div className="flex items-center justify-center bg-none-800 text-white ">
								<span className="font-bold ">
									<img
										src="Images/Rectangle_2.png"
										alt="EU Flag"
										className="w-6 h-auto select-none"
										draggable="false"
									/>
								</span>
							</div>
						</div>

						<div className="flex items-center gap-4 mt-4">
							<div className="flex-1">
								<label
									className="block text-gray-700 text-sm font-bold mb-2"
									htmlFor="transmission-type-dropdown"
								>
									Type de transmission:
								</label>
								<Select
									options={[
										{
											value: "AUTOMATIQUE",
											label: "Automatique",
										},
										{
											value: "MANUEL",
											label: "Manuel",
										},
									]}
									onChange={(selectedOption) =>
										setData({
											...data,
											type: selectedOption?.value ?? "",
										})
									}
									placeholder="Sélectionnez le type de transmission"
								/>
							</div>

							<div className="flex-1">
								<label
									htmlFor="monitorDropdown"
									className="block text-gray-700 text-sm font-bold mb-2"
								>
									Sélectionnez un employer:
								</label>
								<select
									id="monitorDropdown"
									className="form-select"
									value={data.monitorId}
									onChange={(e) =>
										setData({
											...data,
											monitorId: e.target.value,
										})
									}
								>
									<option value="" disabled>
										Sélectionner un employer
									</option>
									{monitors?.map((monitor, index) => (
										<option key={index} value={monitor.id}>
											{monitor.name} {monitor.lastname}
										</option>
									))}
									<option value="random">Random</option>
								</select>
							</div>
						</div>
						<div className="mt-4">
							<label
								htmlFor="monitorDropdown"
								className="block text-gray-700 text-sm font-bold mb-2"
							>
								Sélectionnez une durée:
							</label>
							<ConfigProvider locale={frFR}>
								<div>
									<RangePicker
										onChange={(dates) =>
											setSelectedDates(dates)
										}
										format="DD/MM/YYYY"
										size="large"
										className="w-full"
									/>
								</div>
							</ConfigProvider>
						</div>
						<div className="flex items-center gap-4 mt-4">
							<div className="flex-1">
								<label
									htmlFor="inputGroupFile01"
									className="block text-gray-700 text-sm font-bold mb-2"
								>
									Selectionnez votre carte gris
								</label>
								<input
									type="file"
									className="form-control mt-1"
									id="inputGroupFile01"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											setCarteGris(file);
										}
									}}
								/>
							</div>
							<div className="flex-1">
								<label
									htmlFor="inputGroupFile02"
									className="block text-gray-700 text-sm font-bold mb-2"
								>
									Selectionnez votre permis
								</label>
								<input
									type="file"
									className="form-control mt-1"
									id="inputGroupFile02"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) {
											setAssurance(file);
										}
									}}
								/>
							</div>
						</div>

						<div className="mt-4">
							<label
								htmlFor="inputGroupFile03"
								className="block text-gray-700 text-sm font-bold mb-2"
							>
								Selectionnez votre permis
							</label>
							<input
								type="file"
								className="form-control mt-1"
								id="inputGroupFile03"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setPermis(file);
									}
								}}
							/>
						</div>

						<div className="mt-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">
								Photos du véhicule :
							</label>
							<Dragger {...propsDragger} id="photos" height={160}>
								<p className="ant-upload-drag-icon">
									<svg
										className="mx-auto h-12 w-12 text-gray-300"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
											clipRule="evenodd"
										/>
									</svg>
								</p>
								<p className="ant-upload-text">
									Cliquez ou faites glisser le fichier vers
									cette zone pour le télécharger.
								</p>
							</Dragger>
							<Modal
								centered
								open={previewOpen}
								title={previewTitle}
								footer={null}
								onCancel={handleCancelPreview}
							>
								<img
									alt="photo"
									className="w-full"
									src={previewImage}
								/>
							</Modal>
						</div>

						<div className="flex justify-end gap-3 items-center mt-4">
							<button
								className="focus:outline-none modal-close px-4 bg-gray-50 border border-gray-900/10 py-2 rounded-lg text-black hover:bg-gray-100"
								onClick={() => setOpen(false)}
							>
								Annuler
							</button>
							<Button type="submit">Ajouter</Button>
						</div>
					</form>
				</Modal>

				<div className="mt-6 shadow-sm border rounded-lg overflow-x-auto">
					<table className="w-full table-auto text-sm text-left">
						<thead className="bg-gray-50 text-gray-600 font-medium border-b">
							<tr>
								<th className="py-3 px-6">Type</th>
								<th className="py-3 px-6">Marque</th>
								<th className="py-3 px-6">Immatriculation</th>
								<th className="py-3 px-6">
									Type de transmission
								</th>
								<th className="py-3 px-6">Moniteur</th>
								<th className="py-3 px-6">Dates</th>
								<th className="py-3 px-6">Actions</th>
								<th className="py-3 px-6">Dossier</th>
							</tr>
						</thead>
						<tbody className="text-gray-600 divide-y">
							{filteredVehicules?.length > 0 &&
								filteredVehicules?.map((vehicle, idx) => (
									<tr key={idx}>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle?.vehiculeType}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle?.vehicleBrand}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle?.plate}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle?.type}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle.monitor?.name
												? `${vehicle?.monitor?.name} ${vehicle?.monitor?.lastname}`
												: "Non renseigné"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{vehicle.startDate &&
											vehicle.endDate ? (
												<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
													{format(
														new Date(
															vehicle.startDate
														),
														"dd MMMM yyyy",
														{
															locale: fr,
														}
													)}{" "}
													-{" "}
													{format(
														new Date(
															vehicle.endDate
														),
														"dd MMMM yyyy",
														{
															locale: fr,
														}
													)}
												</span>
											) : (
												""
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														openEditVehiculeModal(
															vehicle
														)
													}
													className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
												>
													modifier
												</button>

												<Popconfirm
													title="Supprimer"
													description="Êtes-vous sûr de vouloir le supprimer ?"
													onConfirm={() =>
														handleDelete(vehicle.id)
													}
													okText="Oui"
													okType="danger"
													icon={
														<QuestionCircleOutlined
															style={{
																color: "red",
															}}
														/>
													}
													cancelText="Non"
												>
													<button className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg">
														supprimer
													</button>
												</Popconfirm>
											</div>

											<Modal
												title={
													<span className="text-xl font-bold">
														Modifier un Véhicule
													</span>
												}
												open={
													editVehicule?.id ===
													vehicle?.id
												}
												onCancel={() =>
													setEditVehicule(null)
												}
												footer={[]}
												width={750}
											>
												<CarEdit
													vehicule={vehicle}
													onClose={
														closeEditVehiculeModal
													}
												/>
											</Modal>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												onClick={() =>
													setSelectedVihecule(vehicle)
												}
												className="py-1 px-2 font-medium cursor-pointer text-indigo-600 hover:text-indigo-500 duration-150 rounded-lg"
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
														d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
													/>
												</svg>
											</span>
											<Modal
												title={
													<span className="text-xl">
														Documents du véhicule
													</span>
												}
												open={
													vehicle?.id ===
													selectedVihecule?.id
												}
												onCancel={() =>
													setSelectedVihecule(null)
												}
												footer={null}
												width={700}
											>
												<div className="mt-3 border-t border-gray-100">
													<dl className="divide-y divide-gray-100">
														<div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
															<dt className="text-sm font-medium leading-6 text-gray-900 flex items-center gap-2 h-max">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={
																		1.5
																	}
																	stroke="currentColor"
																	className="size-5"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
																	/>
																</svg>
																Carte gris
															</dt>
															<dd className="text-sm leading-6 text-gray-700 sm:mt-0">
																{selectedVihecule?.carteGris ? (
																	<a
																		href={`http://localhost:3000/api/images/${selectedVihecule?.carteGris}`}
																		className="underline underline-offset-2"
																		target="_blanc"
																	>
																		Voir
																	</a>
																) : (
																	"Pas de carte gris"
																)}
															</dd>
														</div>
														<div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
															<dt className="text-sm font-medium leading-6 text-gray-900 flex items-center gap-2 h-max">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={
																		1.5
																	}
																	stroke="currentColor"
																	className="size-5"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
																	/>
																</svg>
																Attestation
																d'assurance
															</dt>
															<dd className="text-sm leading-6 text-gray-700 sm:mt-0">
																{selectedVihecule?.assurance ? (
																	<a
																		href={`http://localhost:3000/api/images/${selectedVihecule?.assurance}`}
																		className="underline underline-offset-2"
																		target="_blanc"
																	>
																		Voir
																	</a>
																) : (
																	"Pas d'attestation d'assurance"
																)}
															</dd>
														</div>
														<div className="px-4 py-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
															<dt className="text-sm font-medium leading-6 text-gray-900 flex items-center gap-2 h-max">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={
																		1.5
																	}
																	stroke="currentColor"
																	className="size-5"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z"
																	/>
																</svg>
																Permis de
																conduire
															</dt>
															<dd className="text-sm leading-6 text-gray-700 sm:mt-0">
																{selectedVihecule?.permis ? (
																	<a
																		href={`http://localhost:3000/api/images/${selectedVihecule?.permis}`}
																		className="underline underline-offset-2"
																		target="_blanc"
																	>
																		Voir
																	</a>
																) : (
																	"Pas de permis de conduire"
																)}
															</dd>
														</div>
														<div
															className={`px-4 py-4 sm:px-0 ${
																selectedVihecule?.files &&
																selectedVihecule
																	?.files
																	?.length > 0
																	? ""
																	: "sm:grid sm:grid-cols-2 sm:gap-4"
															}`}
														>
															<dt className="text-sm font-medium leading-6 text-gray-900 flex items-center gap-2 h-max">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	fill="none"
																	viewBox="0 0 24 24"
																	strokeWidth={
																		1.5
																	}
																	stroke="currentColor"
																	className="size-5"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
																	/>
																</svg>
																Photo(s)
															</dt>
															{selectedVihecule?.files &&
															selectedVihecule
																?.files
																?.length ? (
																<dd className="text-sm mt-4 leading-6 grid grid-cols-1 md:grid-cols-2 place-items-center text-gray-700 sm:mt-0">
																	{selectedVihecule?.files?.map(
																		(
																			file
																		) => (
																			<img
																				src={`http://localhost:3000/api/images/${file?.filename}`}
																				alt="Photo de véhicule"
																				className="max-h-72 max-w-72 object-cover rounded-xl"
																			/>
																		)
																	)}
																</dd>
															) : (
																<dd className="text-sm leading-6 text-gray-700 sm:mt-0">
																	Pas de
																	photo(s)
																</dd>
															)}
														</div>
													</dl>
												</div>
											</Modal>
										</td>
									</tr>
								))}
						</tbody>
					</table>
					{filteredVehicules?.length === 0 && (
						<div className="min-h-60 w-full flex items-center justify-center gap-3">
							<span className="text-lg text-gray-800 tracking-wide">
								Aucun véhicule
							</span>
							<CarOutlined className="text-3xl" />
						</div>
					)}
				</div>

				{/* <div className="-mx-4 sm:-mx-6 sm:px-6 mt-4 overflow-x-auto">
					<div className="py-4 align-middle inline-block min-w-full sm:px-6">
						<div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Type
										</th>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Marque
										</th>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Immatriculation
										</th>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Type de transmission
										</th>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Moniteur
										</th>
										<th className="px-6 py-3 bg-gray-50 text-center">
											Actions
										</th>
										<th className="px-6 py-3 bg-gray-50 text-center">
											Dates
										</th>
										<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
											Dossier
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredVehicules?.length > 0 &&
										filteredVehicules?.map(
											(vehicle, index) => (
												<tr key={index}>
													<td className="px-6 py-4">
														<div className="text-sm font-medium leading-5 text-gray-900">
															{
																vehicle?.vehiculeType
															}
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="text-sm font-medium leading-5 text-gray-900">
															{
																vehicle?.vehicleBrand
															}
														</div>
														<div className="text-sm leading-5 text-gray-500"></div>
													</td>
													<td className="px-6 py-4">
														<span className="text-sm font-medium leading-5 text-gray-900">
															{vehicle?.plate}
														</span>
													</td>
													<td className="px-6 py-4">
														<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
															{vehicle?.type}
														</span>
													</td>
													<td className="px-6 py-4">
														<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
															{vehicle.monitor
																?.name
																? `${vehicle?.monitor?.name} ${vehicle?.monitor?.lastname}`
																: "Non renseigné"}
														</span>
													</td>
													<td className="px-6 py-4">
														<Stack
															direction="row"
															spacing={1}
														>
															<IconButton
																color="primary"
																aria-label="edit véhicule"
																onClick={() =>
																	openEditVehiculeModal(
																		vehicle.id
																	)
																}
															>
																<ModeEditIcon />
															</IconButton>

															<Popconfirm
																title="Supprimer"
																description="Êtes-vous sûr de vouloir le supprimer ?"
																onConfirm={() =>
																	handleDelete(
																		vehicle.id
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
																<Button className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2 mb-2">
																	Supprimer
																</Button>
															</Popconfirm>
														</Stack>

														<RBModal
															show={
																editVehiculeId ===
																vehicle.id
															}
															onHide={
																closeEditVehiculeModal
															}
														>
															<RBModal.Header>
																<RBModal.Title>
																	Modifier une
																	Intervention
																</RBModal.Title>
																<FontAwesomeIcon
																	icon={
																		faTimes
																	}
																	className="cursor-pointer"
																	onClick={
																		closeEditVehiculeModal
																	}
																/>
															</RBModal.Header>
															<RBModal.Body>
																<CarEdit
																	vehiculeId={
																		vehicle.id
																	}
																	onClose={
																		closeEditVehiculeModal
																	}
																/>
															</RBModal.Body>
														</RBModal>
													</td>
													<td className="text-center">
														{vehicle.startDate &&
														vehicle.endDate ? (
															<span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
																{format(
																	new Date(
																		vehicle.startDate
																	),
																	"dd MMMM yyyy",
																	{
																		locale: fr,
																	}
																)}{" "}
																-{" "}
																{format(
																	new Date(
																		vehicle.endDate
																	),
																	"dd MMMM yyyy",
																	{
																		locale: fr,
																	}
																)}
															</span>
														) : (
															""
														)}
													</td>
													<td className="px-6 py-4">
														<FaFile
															className="cursor-pointer"
															onClick={() =>
																handleViewFiles(
																	vehicle.id
																)
															}
														/>
														<AntModal
															title="Files"
															open={
																isModalVisible
															}
															onCancel={() =>
																setIsModalVisible(
																	false
																)
															}
															footer={null}
														>
															<ul>
																{selectedVehicleFiles.map(
																	(
																		file,
																		index
																	) => (
																		<li
																			key={
																				index
																			}
																		>
																			<button
																				className="text-blue-500 hover:text-blue-700"
																				onClick={() =>
																					handleFileDownload(
																						file.filename
																					)
																				}
																			>
																				{
																					file.originalFilename
																				}
																			</button>
																		</li>
																	)
																)}
															</ul>
														</AntModal>
													</td>
												</tr>
											)
										)}
								</tbody>
							</table>
							{filteredVehicules?.length > 0 ? null : (
								<div className="min-h-60 w-full flex items-center justify-center gap-3">
									<span className="text-lg text-gray-800 tracking-wide">
										Aucun véhicule
									</span>
									<CarOutlined className="text-3xl" />
								</div>
							)}
						</div>
					</div>
				</div> */}
			</div>
		</div>
	);
}

export default AddCar;
