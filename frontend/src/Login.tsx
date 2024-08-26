import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { fetcher } from "./axios";
import { tokenAtom } from "./lib/atoms/auth";
import logo from "./assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignInSide() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const [errorMessage, setErrorMessage] = useState("");

	const handleSuccessfulLogin = (token) => {
		tokenAtom.update(token);
		window.location.href = "/";
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const response = await fetcher.post("/auth/login", formData, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.status === 200) {
				const data = response.data;
				const token = data.token;
				handleSuccessfulLogin(token);
			}
		} catch (error) {
			console.error("error:", (error as AxiosError).request?.data);
			setErrorMessage(
				"E-mail ou mot de passe erroné. Veuillez réessayer."
			);
		}
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navigation = [
		{ title: "Accueil", path: "/" },
		{ title: "À Propos", path: "/presentation/btp" },
		{ title: "Contactez-Nous", path: "/contacteznous" },
	];

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
		<>
			<div>
				<header>
					<div
						className={`md:hidden ${
							isMobileMenuOpen ? "mx-2 pb-5" : "hidden"
						}`}
					>
						<Brand />
					</div>
					<nav
						className={`pb-3 md:text-sm border-b border-gray-900/10 ${
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
											<Link
												to={item.path}
												className="block"
											>
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

				<div className="sm:mx-auto sm:w-full sm:max-w-sm pb-16 pt-6 flex flex-col justify-center min-h-[70vh]">
					<h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-5">
						Connectez-vous à votre compte
					</h2>
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-6 text-gray-900"
							>
								Adresse email
							</label>
							<div className="mt-2">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="block w-full rounded-lg border-1 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									value={formData.email}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium leading-6 text-gray-900"
								>
									Mot de passe
								</label>
								<div className="text-sm">
									<Link
										to="/forgetpassword"
										className="font-semibold text-indigo-600 hover:text-indigo-500"
									>
										Mot de passe oublié?
									</Link>
								</div>
							</div>
							<div className="mt-2 relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									className="block w-full rounded-lg border-1 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
									value={formData.password}
									onChange={handleInputChange}
								/>
								<div
									className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
									onClick={togglePasswordVisibility}
								>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</div>
							</div>
						</div>

						{errorMessage && (
							<p className="mt-2 text-center text-sm text-red-500">
								{errorMessage}
							</p>
						)}

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember_me"
									name="remember_me"
									type="checkbox"
									className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="remember_me"
									className="ml-2 block text-sm text-gray-900"
								>
									Se souvenir de moi
								</label>
							</div>
						</div>

						<button
							type="submit"
							className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Se connecter
						</button>
					</form>

					<p className="mt-8 text-sm text-gray-500 flex flex-col items-center">
						vous n'avez pas de compte?{" "}
						<Link
							to="/contacteznous"
							className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
						>
							Commencez un essai gratuit de 14 jours
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}
export default SignInSide;
