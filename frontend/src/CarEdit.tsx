import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "./axios";
import Button from "./components/Button";
import { ConfigProvider, DatePicker, message, Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import { Monitor } from "./Moniteurs";
import frFR from "antd/es/locale/fr_FR";
import Select from "react-select";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Dragger } = Upload;

const getBase64 = (file: RcFile): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});

function CarEdit({ vehicule, onClose }) {
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

			fetcher
				.patch(`/vehicule/update/${vehicule?.id}`, {
					...data,
					carteGris: cartGrisUrl ? cartGrisUrl : data?.carteGris,
					assurance: assuranceUrl ? assuranceUrl : data?.assurance,
					permis: permisUrl ? permisUrl : data?.permis,
					files: filesUrl ? filesUrl : [],
				})
				.then((res) => {
					if (res.data.success) {
						window.location.reload();
					}
				});
		} catch (error) {
			console.log(error);
		}
	};

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

	const transmissionTypes = [
		{ value: "MANUEL", label: "Manuel" },
		{ value: "AUTOMATIQUE", label: "Automatique" },
	];

	const [selectedVehicleType, setSelectedVehicleType] = useState("");

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	useEffect(() => {
		if (vehicule) {
			console.log(vehicule);
			setData(vehicule);
		}
	}, [vehicule]);

	return (
		<div className="d-flex flex-column align-items-center">
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
							options={[
								{ value: "Voiture", label: "Voiture" },
								{ value: "Moto", label: "Moto" },
							]}
							onChange={(selectedOption) => {
								setSelectedVehicleType(
									selectedOption?.value ?? ""
								);
								setData({
									...data,
									vehiculeType: selectedOption?.value ?? "",
								});
							}}
							placeholder="Sélectionnez le type de véhicule"
							value={vehicleTypes.find(
								(option) => option.value === data?.vehiculeType
							)}
						/>
					</div>

					{(selectedVehicleType === "Voiture" ||
						data?.vehiculeType === "Voiture") && (
						<div className="flex-1">
							<label
								className="block text-gray-700 text-sm font-bold mb-2"
								htmlFor="car-brand-dropdown"
							>
								Marque du véhicule:
							</label>
							<Select
								options={models?.map((e) => ({
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
								value={models
									?.map((e) => ({
										value: e,
										label: e,
									}))
									?.find(
										(option) =>
											option.value === data?.vehicleBrand
									)}
							/>
						</div>
					)}

					{(selectedVehicleType === "Moto" ||
						data?.vehiculeType === "Moto") && (
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
								value={[
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
								]
									?.map((e) => ({
										value: e,
										label: e,
									}))
									?.find(
										(option) =>
											option.value === data?.vehicleBrand
									)}
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
						value={data?.plate}
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
							value={[
								{
									value: "AUTOMATIQUE",
									label: "Automatique",
								},
								{
									value: "MANUEL",
									label: "Manuel",
								},
							]?.find((option) => option.value === data?.type)}
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
							// value={data?.monitorId}
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
								<option
									selected={monitor?.id === data?.monitorId}
									key={index}
									value={monitor?.id}
								>
									{monitor?.name} {monitor?.lastname}
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
								onChange={(dates) => setSelectedDates(dates)}
								format="DD/MM/YYYY"
								size="large"
								className="w-full"
								value={[
									dayjs(data?.startDate),
									dayjs(data?.endDate),
								]}
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
							Cliquez ou faites glisser le fichier vers cette zone
							pour le télécharger.
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
					<button className="focus:outline-none modal-close px-4 bg-gray-50 border border-gray-900/10 py-2 rounded-lg text-black hover:bg-gray-100">
						Annuler
					</button>
					<Button type="submit">Modifier</Button>
				</div>
			</form>
		</div>
	);
}

export default CarEdit;
