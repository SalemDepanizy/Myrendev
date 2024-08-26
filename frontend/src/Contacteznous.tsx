import React, { useState } from "react";
import { Link } from "react-router-dom";
import "tailwindcss/tailwind.css";
import logo from "./assets/logo.png";
import { fetcher } from "./axios";
import { Modal } from "antd";

const contactMethods = [
	{
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
				/>
			</svg>
		),
		contact: "contact@myrendev.com",
	},
	{
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
				/>
			</svg>
		),
		contact: "+33 1 84 80 18 18",
	},
	{
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-6 h-6"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
				/>
			</svg>
		),
		contact: "1/3 Av. de la vla antony, 94410 Saint-Maurice",
	},
];

const Contacteznous: React.FC = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [message, setMessage] = useState("");
	const [subject, setSubject] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const navigation = [
		{ title: "Accueil", path: "/" },
		{ title: "À Propos", path: "/presentation/btp" },
		{ title: "Contactez-Nous", path: "/contacteznous" },
	];

	const handleSubmit = (event: { preventDefault: () => void }) => {
		event.preventDefault();
		setIsSending(true);
		fetcher
			.post("/mailing/contacteznous", {
				subject,
				name,
				email,
				phoneNumber,
				message,
			})
			.then((res) => {
				if (res.status === 200) {
					setIsModalOpen(true);
					setName("");
					setEmail("");
					setSubject("");
					setPhoneNumber("");
					setMessage("");
				} else {
					setIsModalOpen(false);
				}
			})
			.catch((error) => {
				setIsModalOpen(false);
			})
			.finally(() => {
				setIsSending(false);
			});
	};

	const Brand = () => (
		<div className="flex items-center justify-between py-3 md:block">
			<Link to="/">
				<img src={logo} alt="Logo" width={90} height={50} />
			</Link>
			<div className="md:hidden">
				<button
					className="menu-btn text-gray-500 hover:text-gray-800"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				>
					{isMobileMenuOpen ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-6 h-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						</svg>
					)}
				</button>
			</div>
		</div>
	);

	return (
		<div className="w-full text-gray-700 bg-white">
			<header>
				<div
					className={`md:hidden ${
						isMobileMenuOpen ? "mx-2 pb-5" : "hidden"
					}`}
				>
					<Brand />
				</div>
				<nav
					className={`md:text-sm border-b border-gray-900/10 ${
						isMobileMenuOpen
							? "absolute top-0 inset-x-0 bg-white shadow-lg rounded-xl border mx-2 mt-2 md:shadow-none md:border-none md:mx-0 md:mt-0 md:relative md:bg-transparent"
							: ""
					}`}
				>
					<div className="gap-x-14 items-center max-w-screen-xl mx-auto px-4 md:flex md:px-8">
						<Brand />
						<div
							className={`flex-1 items-center mt-8 md:mt-0 md:flex ${
								isMobileMenuOpen ? "block" : "hidden"
							}`}
						>
							<ul className="flex-1 justify-center items-center space-y-6 md:flex md:space-x-6 md:space-y-0">
								{navigation.map((item, idx) => (
									<li
										key={idx}
										className="text-gray-700 hover:text-gray-900"
									>
										<Link to={item.path} className="block">
											{item.title}
										</Link>
									</li>
								))}
							</ul>
							<div className="items-center justify-end mt-6 space-y-6 md:flex md:mt-0">
								<Link
									to="/login"
									className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-blue-600 hover:bg-blue-500  rounded-full md:inline-flex"
								>
									Se connecter
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-5 h-5"
									>
										<path
											fillRule="evenodd"
											d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
							</div>
						</div>
					</div>
				</nav>
			</header>

			<div className="min-h-screen flex flex-col items-center">
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-4xl font-bold text-center mb-3">
						Contactez-nous
					</h1>
					<p className="mb-16 max-w-lg mx-auto text-center">
						Nous serions ravis d'avoir de vos nouvelles. Veuillez
						remplir ce formulaire ou nous envoyer un e-mail.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
						{/* <div>
							<div className="flex items-center mb-4">
								<FontAwesomeIcon
									icon={faEnvelope}
									className="text-blue-500 mr-2"
								/>
								<div>
									<h2 className="font-semibold">Email</h2>
									<p>
										Notre équipe amicale est là pour vous
										aider.
									</p>
									<p>contact@myrendev.com</p>
								</div>
							</div>

							<div className="flex items-center mb-4">
								<FontAwesomeIcon
									icon={faComments}
									className="text-blue-500 mr-2"
								/>
								<div>
									<h2 className="font-semibold">
										Chat en direct
									</h2>
									<p>
										Notre équipe amicale est là pour vous
										aider.
									</p>
								</div>
							</div>

							<div className="flex items-center mb-4">
								<FontAwesomeIcon
									icon={faBuilding}
									className="text-blue-500 mr-2"
								/>
								<div>
									<h2 className="font-semibold">Bureau</h2>
									<p>
										Venez dire bonjour à notre siège social.
									</p>
									<p>
										1/3 Av. de la Vla Antony, 94410
										Saint-Maurice
									</p>
								</div>
							</div>

							<div className="flex items-center mb-4">
								<FontAwesomeIcon
									icon={faPhoneAlt}
									className="text-blue-500 mr-2"
								/>
								<div>
									<h2 className="font-semibold">Téléphone</h2>
									<p>Du lundi au vendredi de 8h à 17h.</p>
									<p>+33 1 84 80 18 18</p>
								</div>
							</div>
						</div> */}
						<div>
							<ul className="mt-6 space-y-8 items-center">
								{contactMethods.map((item, idx) => (
									<li
										key={idx}
										className="flex items-center gap-x-3"
									>
										<div className="flex-none text-blue-600">
											{item.icon}
										</div>
										<p className="text-lg text-gray-600 tracking-wide">
											{item.contact}
										</p>
									</li>
								))}
							</ul>
						</div>

						<div className="container mx-auto px-4 lg:px-0">
							<div className="mx-auto border border-gray-900/10 shadow-md hover:shadow-lg rounded-xl px-8 py-10">
								<form
									onSubmit={handleSubmit}
									className="space-y-5 max-w-lg mx-auto"
								>
									<div>
										<label
											className="font-medium"
											htmlFor="name"
										>
											Nom Complet
										</label>
										<input
											id="name"
											type="text"
											required
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
											className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-gray-800 shadow-sm rounded-lg"
										/>
									</div>
									<div>
										<label
											className="font-medium"
											htmlFor="subject"
										>
											Sujet
										</label>
										<input
											id="subject"
											type="text"
											required
											value={subject}
											onChange={(e) =>
												setSubject(e.target.value)
											}
											className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-gray-800 shadow-sm rounded-lg"
										/>
									</div>
									<div>
										<label
											className="font-medium"
											htmlFor="email"
										>
											Email
										</label>
										<input
											id="email"
											type="email"
											required
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
											className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-gray-800 shadow-sm rounded-lg"
										/>
									</div>
									<div>
										<label
											className="font-medium"
											htmlFor="phone"
										>
											Numéro de téléphone
										</label>
										<input
											id="phone"
											type="text"
											required
											value={phoneNumber}
											onChange={(e) =>
												setPhoneNumber(e.target.value)
											}
											className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-gray-800 shadow-sm rounded-lg"
										/>
									</div>
									<div></div>
									<div>
										<label className="font-medium">
											Message
										</label>
										<textarea
											required
											value={message}
											onChange={(e) =>
												setMessage(e.target.value)
											}
											className="w-full mt-2 h-36 px-3 py-2 resize-none appearance-none bg-transparent outline-none border focus:border-gray-800 shadow-sm rounded-lg"
										></textarea>
									</div>
									<button
										type="submit"
										className="w-full px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-500 rounded-lg duration-150"
									>
										{isSending
											? "Envoi en cours..."
											: "Envoyer"}
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Modal
				title=""
				open={isModalOpen}
				footer={[]}
				centered
				closable={false}
			>
				<div className="py-3 flex flex-col items-center gap-3">
					<div className=" flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-8 h-8 text-green-600"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<h2 className="text-xl">
						Votre message a été bien envoyé ! 🎉🥳
					</h2>
					<p className="pt-1 pb-2 text-center max-w-md text-base text-gray-500">
						Nous avons reçu votre message avec succès. Notre équipe
						vous répondra sous peu. Merci pour votre patience.
					</p>
					<button
						onClick={() => setIsModalOpen(false)}
						className="py-2 px-3 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg"
					>
						Fermer
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default Contacteznous;
