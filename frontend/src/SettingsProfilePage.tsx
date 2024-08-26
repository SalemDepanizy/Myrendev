import React, { useEffect, useRef, useState } from "react";
import { User } from "./components/auth/protect";
// import logo from "./assets/logo.png";
import { useAuth } from "./lib/hooks/auth";
import Button from "./components/Button";
import { message } from "antd";
import { fetcher } from "./axios";
import { Link } from "react-router-dom";

function SettingsProfilePage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [managerName, setManagerName] = useState("");

	const [email, setEmail] = useState("");
	const [image, setProfileImage] = useState("");
	const [data, setData] = useState({
		name: "",
		lastname: "",
		email: "",
		image: "",
		name_entreprise: "",
		name_manager: "",
	});
	const { user } = useAuth();
	useEffect(() => {
		if (!user) return;
		if (!user.image) return;
		if (data.image.trim().length > 0) return;
		setData((old) => ({
			...old,
			image: user.image ?? old.image,
		}));
	}, [user]);

	const showMessage = (type, content) => {
		message[type](content);
	};
	function toBase64(file: File) {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
			reader.readAsDataURL(file);
		});
	}
	const handleImageChange = async (event) => {
		if (event.target.files && event.target.files[0]) {
			const file: File = event.target.files[0];
			const newImageUrl = await toBase64(file);
			setProfileImage(newImageUrl);
			setData({ ...data, image: newImageUrl });
		}
	};

	const handleSubmit = (event: { preventDefault: () => void }) => {
		event.preventDefault();

		if (user) {
			const payload: {
				name: string;
				lastname?: string;
				email: string;
				image: string;
				name_entreprise?: string;
				name_manager?: string;
			} = {
				name: firstName,
				email: email,
				image: data.image,
			};

			if (lastName) {
				payload.lastname = lastName;
			}

			if (user.type === "ENTREPRISE") {
				payload.name_entreprise = companyName;
				payload.name_manager = managerName;
			}

			fetcher
				.patch(`/users/update/${user.id}`, payload)
				.then((res) => {
					if (res.data.success) {
						showMessage("success", "Mise à jour du profil réussie");
						setTimeout(() => {
							window.location.reload();
						}, 800);
					} else {
						showMessage("error", "Failed to update profile");
					}
				})
				.catch((err) => {
					console.error("Error:", err);
					showMessage(
						"error",
						"An error occurred while updating profile"
					);
				});
		}
	};

	useEffect(() => {
		if (user) {
			setProfileImage(user.image || "");
			setEmail(user.email || "");
			if (user.type === "ENTREPRISE") {
				setCompanyName(user.name_entreprise || "");
				setManagerName(user.name_manager || "");
			} else {
				setFirstName(user.name || "");
				setLastName(user.lastname || "");
			}
		}
	}, [user]);

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12">
			{user && (
				<div className="py-3 sm:max-w-xl sm:mx-auto">
					<div className="bg-white min-w-1xl flex flex-col rounded-xl shadow-lg">
						<div className="px-12 py-5">
							<h2 className="text-2xl text-center font-semibold mb-4">
								Mes informations
							</h2>
							<div className="flex flex-col items-center">
								<img
									src={data.image || user?.image}
									alt=""
									className="w-32 h-32 rounded-full border-4 border-blue-200"
								/>

								<div className="flex flex-col items-center mt-2">
									<Button
										className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
										onClick={handleButtonClick}
									>
										Change Image
									</Button>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleImageChange}
										className="hidden"
									/>
								</div>
							</div>
							<form
								onSubmit={handleSubmit}
								className="space-y-3 mt-4"
							>
								{user.type === "ENTREPRISE" ? (
									<>
										<div>
											<label className="text-sm font-medium text-gray-700">
												Nom Du Responsable
											</label>
											<input
												type="text"
												value={managerName}
												onChange={(e) =>
													setManagerName(
														e.target.value
													)
												}
												className="w-full mt-1 px-4 py-2 border rounded-lg"
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700">
												Nom de l'entreprise
											</label>
											<input
												type="text"
												value={companyName}
												onChange={(e) =>
													setCompanyName(
														e.target.value
													)
												}
												disabled
												className="w-full mt-1 px-4 py-2 border rounded-lg cursor-not-allowed"
											/>
										</div>
									</>
								) : (
									<>
										<div>
											<label className="text-sm font-medium text-gray-700">
												Votre Nom
											</label>
											<input
												type="text"
												value={firstName}
												onChange={(e) =>
													setFirstName(e.target.value)
												}
												className="w-full mt-1 px-4 py-2 border rounded-lg cursor-not-allowed"
											/>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-700">
												Votre Prénom
											</label>
											<input
												type="text"
												value={lastName}
												onChange={(e) =>
													setLastName(e.target.value)
												}
												className="w-full mt-1 px-4 py-2 border rounded-lg"
											/>
										</div>
									</>
								)}
								<div>
									<label className="text-sm font-medium text-gray-700">
										Votre email
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="w-full mt-1 px-4 py-2 border rounded-lg cursor-not-allowed"
										disabled
									/>
								</div>
								<div className="flex justify-center">
									<Button type="submit">Save</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default SettingsProfilePage;
