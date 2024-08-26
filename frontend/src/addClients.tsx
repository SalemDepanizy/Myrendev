import { useState, useEffect } from "react";
import { useAuth } from "./lib/hooks/auth";
import { fetcher } from "./axios";
import useSWR from "swr";
import message from "antd/lib/message";

function AddClients({ email }: { email: string }) {
	const { user } = useAuth();
	const [inputValue, setInputValue] = useState("");
	const [verifiedMail, setVerifiedMail] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [showItem, setShowItem] = useState(false);
	const [failed, setFailed] = useState(false);

	const mail = email;
	const corpName = user?.name_entreprise;
	const enterpriseId = user?.id || "";

	const { data: clientAuthorizationData } = useSWR(
		enterpriseId ? `/clientAuthorization/${enterpriseId}` : null,
		async (url) => {
			const result = await fetcher.get(url);
			return result.data;
		}
	);

	const codeSender = async () => {
		try {
			await createInstance();
			setShowItem(true);
		} catch (error) {
			console.error("Error sending code:", error);
			setErrorMessage("Error sending code");
		}
	};

	const mailSender = async () => {
		await fetcher.post("clientAuthorization/authorization-email", {
			clientEmail: mail,
			enterpriseName: corpName,
		});
		message.success("Email envoyé avec succès");
	};

	const createInstance = async () => {
		await fetcher.post("clientAuthorization/create-authorization", {
			enterpriseId,
			clientEmail: mail,
			secretCode: "code",
			enterpriseName: corpName,
		});
	};

	const inputVerifier = (e) => {
		setInputValue(e.target.value);
	};

	const codeVerifier = () => {
		setFailed(false);
		const foundItems = clientAuthorizationData?.filter(
			(item) => item.secretCode === inputValue
		);

		if (foundItems?.length > 0) {
			setVerifiedMail(mail);

			message.success("Code correct");
		} else {
			setErrorMessage("Code incorrect");
			setFailed(true);
		}
	};

	const { data: students, isLoading: loadingStudents } = useSWR(
		verifiedMail ? `/users/student/info/email` : null,
		async (url) => {
			const response = await fetcher.post(url, {
				email: verifiedMail,
			});
			return response.data;
		}
	);

	useEffect(() => {
		if (verifiedMail) {
			setErrorMessage("");
		}
	}, [verifiedMail]);

	useEffect(() => {
		if (students) {
			fetcher
				.post("/users/assign-client", {
					clientId: students.id,
					type: "STUDENTS",
				})
				.then((res) => {
					window.location.reload();
				})
				.catch((error) => {
					console.error("Error assigning client:", error);
				});
		}
	}, [students]);

	return (
		<div className="container mx-auto">
			<div className="main flex items-center flex-col">
				<h1 className="text-xl font-bold underline">
					Associer un email déjà existant
				</h1>
				<div className="content mt-6">
					<p>{mail}</p>
					{!showItem ? (
						<button
							onClick={codeSender}
							className="btn-send bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
						>
							Envoyer un code
						</button>
					) : (
						<div className="code flex flex-col mt-4">
							{!failed && <p>Code envoyé</p>}
							{failed && (
								<button
									onClick={codeSender}
									className="text-red-500 border p-1 rounded-lg hover:bg-gray-50 active:bg-gray-100"
								>
									Renvoyer un code{" "}
								</button>
							)}
							<p>Entrez le code ici</p>
							<div className="verif">
								<input
									type="text"
									onChange={inputVerifier}
									className="code-input border rounded-lg py-1 px-2 mt-1"
								/>
								<button
									className="border rounded-lg py-1 px-2 mt-1 hover:bg-gray-50 active:bg-gray-100"
									onClick={codeVerifier}
								>
									Valider
								</button>
							</div>
						</div>
					)}
					{errorMessage && (
						<p className="text-red-500">{errorMessage}</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default AddClients;
