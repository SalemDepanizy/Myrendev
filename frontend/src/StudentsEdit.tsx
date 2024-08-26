import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetcher } from "./axios";
import useSWR from "swr";
import { Loader } from "lucide-react";
import Button from "./components/Button";

export interface Student {
	name: string;
	lastname: string;
	phone: string;
	phone2: string;
	phone3: string;
	email: string;
	address: string;
	heure: number;
	ville: string;
	codePostal: string;
	image: string;
}

function StudentsEdit({ studentId, onClose }) {
	const [data, setData] = useState({
		name: "",
		lastname: "",
		email: "",
		address: "",
		heure: 0,
		phone: "",
		phone2: "",
		phone3: "",
		ville: "",
		codePostal: "",
		image: "",
	});
	const [file, setFile] = useState<File | null>(null);

	const { id } = useParams();

	const {
		data: student,
		isLoading: loadingStudent,
		error: errorStudent,
		mutate: refresh,
	} = useSWR(`/users/get/${studentId ?? id}`, async (url) => {
		if (!id && !studentId) return null;
		return (await fetcher.get(url)).data as Student;
	});

	useEffect(() => {
		if (!student) return;
		setData(student);
	}, [student]);

	const handlePhoneChange = (e) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone: formattedValue });
	};

	const handlePhone2Change = (e) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone2: formattedValue });
	};

	const handlePhone3Change = (e) => {
		const numericValue = e.target.value.replace(/\D/g, "");
		const limitedNumericValue = numericValue.slice(0, 10);
		const formattedValue = limitedNumericValue.replace(
			/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
			"$1 $2 $3 $4 $5"
		);
		setData({ ...data, phone3: formattedValue });
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
		const payload = {
			name: data.name,
			lastname: data.lastname,
			phone: data.phone,
			phone2: data.phone2,
			phone3: data.phone3,
			email: data.email,
			address: data.address,
			ville: data.ville,
			codePostal: data.codePostal,
			image: imgUrl ? imgUrl : data.image,
		};
		fetcher
			.patch(`/users/update/${studentId ?? id}`, payload)
			.then((res) => {
				if (res.data.success) {
					window.location.reload();
				}
			});
	};

	if (loadingStudent) {
		return (
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Loader className="spin" />
			</div>
		);
	}

	return (
		<div className="container py-2">
			<div>
				<div>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<label
									htmlFor="inputName"
									className="form-label"
								>
									Nom
								</label>
								<input
									type="text"
									className="form-control"
									id="inputName"
									autoComplete="off"
									onChange={(e) =>
										setData({
											...data,
											name: e.target.value,
										})
									}
									value={data.name}
								/>
							</div>
							<div className="flex-1">
								<label
									htmlFor="inputName"
									className="form-label"
								>
									Prénom
								</label>
								<input
									type="text"
									className="form-control"
									id="inputName"
									autoComplete="off"
									onChange={(e) =>
										setData({
											...data,
											lastname: e.target.value,
										})
									}
									value={data.lastname}
								/>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<label
									htmlFor="inputEmail4"
									className="form-label"
								>
									E-mail
								</label>
								<input
									type="email"
									className="form-control"
									id="inputEmail4"
									placeholder="Enter Email"
									autoComplete="off"
									onChange={(e) =>
										setData({
											...data,
											email: e.target.value,
										})
									}
									value={data.email}
								/>
							</div>
							<div className="flex-1">
								<label
									htmlFor="inputPhone1"
									className="form-label"
								>
									Numéro de téléphone
								</label>
								<input
									type="text"
									className="form-control"
									id="inputPhone1"
									autoComplete="off"
									onChange={handlePhoneChange}
									value={data.phone}
								/>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<label
										htmlFor="inputPhone2"
										className="form-label"
									>
										Numéro de téléphone 2
									</label>
									<span className="text-gray-500 text-sm">
										Optionnel
									</span>
								</div>
								<input
									type="text"
									className="form-control"
									id="inputPhone2"
									autoComplete="off"
									onChange={handlePhone2Change}
									value={data.phone2}
								/>
							</div>
							<div className="flex-1">
								<div className="flex items-center justify-between">
									<label
										htmlFor="inputPhone3"
										className="form-label"
									>
										Numéro de téléphone 3
									</label>
									<span className="text-gray-500 text-sm">
										Optionnel
									</span>
								</div>
								<input
									type="text"
									className="form-control"
									id="inputPhone3"
									autoComplete="off"
									onChange={handlePhone3Change}
									value={data.phone3}
								/>
							</div>
						</div>
						<div className="col-12">
							<label
								htmlFor="inputAddress"
								className="form-label"
							>
								Address
							</label>
							<input
								type="text"
								className="form-control"
								id="inputAddress"
								placeholder="Adresse Complete"
								autoComplete="off"
								onChange={(e) =>
									setData({
										...data,
										address: e.target.value,
									})
								}
								value={data.address}
							/>
						</div>
						<div className="flex items-center gap-4">
							<div className="flex-1">
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
									placeholder="Entrer la ville"
									autoComplete="off"
									onChange={(e) =>
										setData({
											...data,
											ville: e.target.value,
										})
									}
									value={data.ville}
								/>
							</div>

							<div className="flex-1">
								<label htmlFor="inputCp" className="form-label">
									Code Postal
								</label>
								<input
									type="text"
									className="form-control"
									id="inputCp"
									placeholder="Entrer la ville"
									autoComplete="off"
									onChange={(e) =>
										setData({
											...data,
											codePostal: e.target.value,
										})
									}
									value={data.codePostal}
								/>
							</div>
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
											const dataURL =
												reader.result as string;
											setData({
												...data,
												image: dataURL,
											});
										};
									} else {
										setData({ ...data, image: "" });
									}
								}}
							/>
						</div>
						<div>
							<Button className="mt-4" type="submit">
								Modifier
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default StudentsEdit;
