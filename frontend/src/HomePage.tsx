import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "tailwindcss/tailwind.css";
import logo from "./assets/logo.png";
import { FaUsers } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { Badge } from "antd";
import LandingImg from "./assets/landingImg.png";

const HomePage: React.FC = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		document.onclick = (e) => {
			const target = e.target as Element;
			if (!target.closest(".menu-btn")) {
				setIsMobileMenuOpen(false);
			}
		};
		return () => {
			document.onclick = null;
		};
	}, []);

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

	const features = [
		{
			icon: (
				<div>
					<FiCalendar className="w-6 h-6" />
				</div>
			),
			title: "Planification Simplifiée",
			desc: "Avec My Rendev, planifiez vos rendez-vous simplement. Gérez les disponibilités de votre équipe et synchronisez les horaires avec vos clients en toute facilité.",
		},
		{
			icon: (
				<div>
					<FaUsers className="w-6 h-6 text-current" />
				</div>
			),
			title: "Gestion Intuitive",
			desc: "Simplifiez votre emploi du temps. Planifiez, suivez les interactions clients et coordonnez votre équipe sur une seule plateforme intuitive.",
		},
	];

	const plans = [
		{
			name: "Basic plan",
			offres: "14 jours offerts",
			ribbon: "Offre de lancement",
			included: "",
			desc: "Sans engagement",
			people: "Jusqu'à 2 utilisateurs",
			price: 59 + "HT",
			isMostPop: false,
			features: [
				"Un Dashboard qui regroupe toutes les informations. ",
				"Une gestion de tous vos services / interventions.",
				"Une base de données de vos client(e)s. ",
				"Une gestion de vos employé(e)s.",
				"Une gestion de la flotte de vos véhicules.",
				"Un calendrier interactif pour prendre vos Rendez-vous.",
				"Gérer les disponibilités et les congés.",
				"Contrôler la satisfaction de vos client(e)s.",
				"200 sms inclus",
				"Envoie d'e-mail illimité. ",
			],
		},
		{
			name: "Startup",
			offres: "14 jours offerts",
			ribbon: "Offre de lancement",
			included: "Basic plan inclus",
			desc: "Sans engagement",
			price: 79 + "HT",
			people: "De 3 à 5 utilisateurs",
			isMostPop: true,
			features: [
				"Un Dashboard qui regroupe toutes les informations. ",
				"Une gestion de tous vos services / interventions.",
				"Une base de données de vos client(e)s. ",
				"Une gestion de vos employé(e)s.",
				"Une gestion de la flotte de vos véhicules.",
				"Un calendrier interactif pour prendre vos Rendez-vous.",
				"Gérer les disponibilités et les congés.",
				"Contrôler la satisfaction de vos client(e)s.",
				"400 sms inclus",
				"Envoie d'e-mail illimité. ",
			],
		},
		{
			name: "Enterprise",
			offres: "14 jours offerts",
			ribbon: "Offre de lancement",
			included: "Tous les plans inclus",
			desc: "Sans engagement",
			price: 99 + "HT",
			people: "Utilisateurs illimités",
			isMostPop: false,
			features: [
				"Un Dashboard qui regroupe toutes les informations. ",
				"Une gestion de tous vos services / interventions.",
				"Une base de données de vos client(e)s. ",
				"Une gestion de vos employé(e)s.",
				"Une gestion de la flotte de vos véhicules.",
				"Un calendrier interactif pour prendre vos Rendez-vous.",
				"Gérer les disponibilités et les congés.",
				"Contrôler la satisfaction de vos client(e)s.",
				"600 sms inclues",
				"Envoie d'e-mail illimité. ",
			],
		},
	];

	const testimonials = [
		{
			avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
			name: "John escobar",
			title: "Entrepreneur en construction",
			quote: "Une solution qui m'a fait gagner un temps précieux chaque jour. Vraiment géniale !",
		},
		{
			avatar: "https://randomuser.me/api/portraits/men/46.jpg",
			name: "Pierre Dubois",
			title: "Ingénieure en génie civil",
			quote: "Je recommande vivement cette plateforme à tous les professionnels. Une vraie pépite pour la gestion de rendez-vous.",
		},
		{
			avatar: "https://randomuser.me/api/portraits/men/86.jpg",
			name: "Jean-Luc Moreau",
			title: "Serrurier",
			quote: "My Rendev a révolutionné ma façon de gérer les rendez-vous. Simple, efficace, indispensable.",
		},
	];
	const faqsList = [
		{
			q: "Comment puis-je planifier un rendez-vous avec My Rendev ?",
			a: "Pour planifier un rendez-vous avec My Rendev, connectez-vous à votre compte, accédez à l'onglet 'Calendrier' et cliquez sur le créneau horaire souhaité. Vous pouvez ensuite ajouter les détails du rendez-vous et l'envoyer à votre client.",
		},
		{
			q: "Est-ce que My Rendev offre des fonctionnalités de rappel de rendez-vous ?",
			a: "Oui, My Rendev propose des fonctionnalités de rappel de rendez-vous par e-mail et SMS. Vous pouvez configurer ces rappels pour être envoyés automatiquement à vos clients avant leur rendez-vous.",
		},
		{
			q: "Est-il possible de personnaliser les disponibilités de mon équipe sur My Rendev ?",
			a: "Absolument ! Vous pouvez définir les horaires de travail de chaque membre de votre équipe dans les paramètres de My Rendev. Cela vous permet d'adapter les disponibilités en fonction des besoins de votre entreprise.",
		},
		{
			q: "Comment puis-je intégrer My Rendev à mon site web ou ma page Facebook ?",
			a: "My Rendev propose des options d'intégration faciles à utiliser pour votre site web et votre page Facebook. Contactez notre équipe d'assistance pour obtenir de l'aide sur la façon de configurer ces intégrations.",
		},
		{
			q: "Est-ce que My Rendev offre un support client en cas de problème ?",
			a: "Oui, notre équipe d'assistance est disponible pour vous aider en cas de problème ou de question. Vous pouvez nous contacter par e-mail, téléphone ou via notre chat en direct sur le site.",
		},
		{
			q: "Mon entreprise a des besoins spécifiques en matière de gestion de rendez-vous. Est-ce que My Rendev peut les prendre en charge ?",
			a: "Bien sûr ! My Rendev est conçu pour être flexible et adaptable aux besoins spécifiques de chaque entreprise. Contactez-nous pour discuter de vos besoins et voir comment nous pouvons vous aider.",
		},
	];
	const footerNavs = [
		{
			to: "/#",
			name: "Politique de confidentialité ",
		},
		{
			to: "/login",
			name: "Se conneter",
		},
		{
			to: "/contacteznous",
			name: "Contactez-nous",
		},
		{
			to: "/presentation/btp",
			name: "À Propos",
		},
	];

	const scrollToPricing = () => {
		const pricingSection = document.getElementById("pricingSection");
		if (pricingSection !== null) {
			pricingSection.scrollIntoView({ behavior: "smooth" });
		}
	};
	// Initialize state for managing visibility of answers
	const [visibleAnswers, setVisibleAnswers] = useState({});

	// Function to toggle visibility of answer for a given question
	const toggleAnswerVisibility = (idx) => {
		setVisibleAnswers((prevState) => ({
			...prevState,
			[idx]: !prevState[idx], // Toggle visibility
		}));
	};

	return (
		<div className="relative">
			{/* <div
				className="absolute inset-0 blur-xl h-[580px]"
				style={{
					background:
						"linear-gradient(143.6deg, rgba(0, 0, 255, 0) 20.79%, rgba(70, 130, 180, 0.26) 40.92%, rgba(100, 149, 237, 0) 70.35%)",
				}}
			></div> */}
			<div
				className="absolute inset-0 blur-xl h-screen"
				style={{
					background:
						"linear-gradient(143.6deg, rgba(132, 193, 252, 0) 20.79%, rgba(121, 182, 249, 0.26) 40.92%, rgba(171, 204, 238, 0) 70.35%)",
				}}
			></div>

			<div className="relative">
				<header>
					<div
						className={`md:hidden ${
							isMobileMenuOpen ? "mx-2 pb-5" : "hidden"
						}`}
					>
						<Brand />
					</div>
					<nav
						className={`pb-5 md:text-sm ${
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
				<section>
					<div className="max-w-screen-xl mx-auto px-4 py-28 gap-12 text-gray-600 overflow-hidden md:px-8 md:flex">
						<div className="flex-none space-y-5 max-w-xl">
							<Link
								to="/presentation/btp"
								className="inline-flex gap-x-6 items-center rounded-full p-1 pr-6 border text-sm font-medium duration-150 hover:bg-white"
							>
								<span className="inline-block rounded-full px-3 py-1 bg-blue-600 text-white">
									À Propos
								</span>
								<p className="flex items-center">
									Lisez le message de lancement à partir d'ici
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
								</p>
							</Link>
							<h1 className="text-4xl text-gray-800 font-extrabold sm:text-5xl">
								Votre Solution de Rendez-vous Simplifiée
							</h1>
							<p>
								My Rendev est votre solution complète de gestion
								de rendez-vous avec des professionnels.
								Planifiez facilement vos rencontres, gérez vos
								clients et votre personnel, recueillez des avis
								et bien plus encore, le tout sur une plateforme
								conviviale et intuitive.
							</p>
							<div className="flex items-center gap-x-3 sm:text-sm">
								<a
									href="#"
									onClick={scrollToPricing}
									className="flex items-center justify-center gap-x-1 py-2 px-4 text-white font-medium bg-blue-600 duration-150 hover:bg-blue-500 active:bg-gray-900 rounded-full md:inline-flex"
								>
									Commencer
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
								</a>
								<Link
									to="/contacteznous"
									className="flex items-center justify-center gap-x-1 py-2 px-4 text-gray-700 hover:text-gray-900 font-medium duration-150 md:inline-flex"
								>
									Contactez-Nous
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
						<div className="flex-1 hidden md:block">
							<img
								// src="https://raw.githubusercontent.com/sidiDev/remote-assets/c86a7ae02ac188442548f510b5393c04140515d7/undraw_progressive_app_m-9-ms_oftfv5.svg"
								src={LandingImg}
								className="max-w-xl"
							/>
						</div>
					</div>
				</section>
				<div className="py-14">
					<div className="max-w-screen-xl mx-auto px-4 md:px-8">
						<h3 className="font-semibold text-sm text-gray-600 text-center">
							CONFIÉ PAR DES ÉQUIPES DU MONDE ENTIER
						</h3>
						<div className="mt-6">
							<ul className="flex gap-y-6 flex-wrap items-center justify-center [&>*]:px-12 lg:divide-x">
								{/* LOGO 1 */}
								<li className="flex-none">
									<svg
										className="w-28"
										viewBox="0 0 163 48"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M45.0503 14.0131H52.6724C57.5318 14.0131 61.546 16.8247 61.546 23.2442V24.5931C61.546 31.0613 57.7918 33.9704 52.8187 33.9704H45.0503V14.0131ZM49.3083 17.6373V30.33H52.5749C55.3377 30.33 57.1905 28.526 57.1905 24.5118V23.4555C57.1905 19.4412 55.2402 17.6373 52.4287 17.6373H49.3083ZM63.805 17.8323H67.2179L67.7705 21.5865C68.4205 19.0349 70.0782 17.6698 73.0848 17.6698H74.1412V21.9765H72.386C68.9243 21.9765 68.0792 23.1792 68.0792 26.5921V34.0192H63.87V17.8323H63.805ZM74.9863 26.2508V25.7957C74.9863 20.3838 78.448 17.426 83.161 17.426C87.9716 17.426 91.3357 20.3838 91.3357 25.7957V26.2508C91.3357 31.5652 88.0691 34.4255 83.161 34.4255C77.9441 34.3767 74.9863 31.5814 74.9863 26.2508ZM87.029 26.202V25.7957C87.029 22.7891 85.5175 20.9852 83.1123 20.9852C80.7557 20.9852 79.1955 22.6429 79.1955 25.7957V26.202C79.1955 29.1111 80.707 30.7688 83.1123 30.7688C85.5175 30.7201 87.029 29.1111 87.029 26.202ZM93.546 17.8323H97.0564L97.4627 20.8877C98.3078 18.8399 100.112 17.426 102.777 17.426C106.889 17.426 109.603 20.3838 109.603 25.8607V26.3158C109.603 31.6302 106.596 34.4417 102.777 34.4417C100.226 34.4417 98.4703 33.2879 97.6089 31.4351V39.6098H93.4972L93.546 17.8323ZM105.329 26.202V25.8445C105.329 22.6266 103.671 21.0339 101.461 21.0339C99.1041 21.0339 97.5439 22.8379 97.5439 25.8445V26.1533C97.5439 29.0136 99.0554 30.8176 101.412 30.8176C103.833 30.7688 105.329 29.2249 105.329 26.202ZM115.827 31.0288L115.47 33.9867H111.862V12.4204H115.974V20.6926C116.884 18.5799 118.688 17.426 121.239 17.426C125.107 17.4748 127.968 20.1401 127.968 25.5032V26.007C127.968 31.3701 125.253 34.4417 121.142 34.4417C118.428 34.3767 116.672 33.1253 115.827 31.0288ZM123.645 26.007V25.6007C123.645 22.6429 122.036 20.9852 119.777 20.9852C117.469 20.9852 115.86 22.8379 115.86 25.6495V26.007C115.86 29.0136 117.42 30.7688 119.728 30.7688C122.198 30.7688 123.645 29.2249 123.645 26.007ZM129.771 26.2508V25.7957C129.771 20.3838 133.233 17.426 137.946 17.426C142.757 17.426 146.121 20.3838 146.121 25.7957V26.2508C146.121 31.5652 142.806 34.4255 137.946 34.4255C132.729 34.3767 129.771 31.5814 129.771 26.2508ZM141.847 26.202V25.7957C141.847 22.7891 140.335 20.9852 137.93 20.9852C135.573 20.9852 134.013 22.6429 134.013 25.7957V26.202C134.013 29.1111 135.525 30.7688 137.93 30.7688C140.351 30.7201 141.847 29.1111 141.847 26.202ZM151.63 25.6007L145.958 17.8323H150.818L154.084 22.6916L157.4 17.8323H162.21L156.457 25.5519L162.519 33.9867H157.757L154.052 28.6236L150.444 33.9867H145.471L151.63 25.6007Z"
											fill="black"
										/>
										<path
											d="M18.8522 14.0132L9.42611 20.0264L18.8522 26.0396L9.42611 32.0528L0 26.0071L9.42611 19.9939L0 14.0132L9.42611 8L18.8522 14.0132ZM9.37735 33.9868L18.8035 27.9736L28.2296 33.9868L18.8035 40L9.37735 33.9868ZM18.8522 26.0071L28.2783 19.9939L18.8522 14.0132L28.2296 8L37.6557 14.0132L28.2296 20.0264L37.6557 26.0396L28.2296 32.0528L18.8522 26.0071Z"
											fill="#0061FF"
										/>
									</svg>
								</li>

								{/* LOGO 2 */}
								<li className="flex-none">
									<svg
										className="w-28"
										viewBox="0 0 129 48"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M44.9356 34.7749V20.2199H45.1949L55.7896 34.7749H59.1236V13.4006H55.4192V27.919H55.1598L44.5652 13.4006H41.2312V34.7749H44.9356ZM69.6071 35.1049C74.497 35.1049 77.4976 31.9519 77.4976 26.6725C77.4976 21.4297 74.497 18.2401 69.6071 18.2401C64.7543 18.2401 61.7167 21.4297 61.7167 26.6725C61.7537 31.9519 64.7173 35.1049 69.6071 35.1049ZM69.6071 32.0252C67.014 32.0252 65.5322 30.0821 65.5322 26.6725C65.5322 23.2995 67.014 21.3198 69.6071 21.3198C72.2002 21.3198 73.682 23.2995 73.682 26.6725C73.682 30.0821 72.2002 32.0252 69.6071 32.0252ZM80.8686 14.6105V18.68H78.2755V21.6131H80.8686V30.4487C80.8686 33.6017 82.3504 34.8483 86.1289 34.8483C86.8327 34.8483 87.5366 34.7749 88.0922 34.6649V31.8053C87.6477 31.8419 87.3513 31.8786 86.8327 31.8786C85.2769 31.8786 84.573 31.182 84.573 29.5688V21.6131H88.0922V18.68H84.573V14.6105H80.8686ZM90.3149 34.7749H94.0193V18.5701H90.3149V34.7749ZM92.1671 15.8937C93.3896 15.8937 94.3898 14.9038 94.3898 13.6939C94.3898 12.4474 93.3896 11.4575 92.1671 11.4575C90.9446 11.4575 89.9444 12.4474 89.9444 13.6939C89.9444 14.9038 90.9446 15.8937 92.1671 15.8937ZM104.169 35.1049C109.059 35.1049 112.06 31.9519 112.06 26.6725C112.06 21.4297 109.059 18.2401 104.169 18.2401C99.3166 18.2401 96.279 21.4297 96.279 26.6725C96.279 31.9519 99.2426 35.1049 104.169 35.1049ZM104.169 32.0252C101.576 32.0252 100.095 30.0821 100.095 26.6725C100.095 23.2995 101.576 21.3198 104.169 21.3198C106.726 21.3198 108.244 23.2995 108.244 26.6725C108.207 30.0821 106.726 32.0252 104.169 32.0252ZM114.245 34.7749H117.95V25.3526C117.95 22.9696 119.358 21.4664 121.543 21.4664C123.803 21.4664 124.84 22.7129 124.84 25.1693V34.7749H128.545V24.2894C128.545 20.4032 126.544 18.2401 122.914 18.2401C120.469 18.2401 118.839 19.34 118.061 21.1731H117.802V18.5701H114.208C114.245 18.5701 114.245 34.7749 114.245 34.7749Z"
											fill="black"
										/>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M5.71206 12.0326C6.79023 12.9024 7.18021 12.8337 9.19893 12.6964L28.2162 11.5519C28.6291 11.5519 28.285 11.1399 28.1474 11.0941L24.9816 8.82806C24.3852 8.37028 23.5594 7.82093 22.0224 7.95826L3.62452 9.30874C2.95926 9.37741 2.82162 9.72075 3.0969 9.97254L5.71206 12.0326ZM6.85905 16.4502V36.4098C6.85905 37.4857 7.38667 37.8748 8.60249 37.8061L29.5008 36.593C30.7166 36.5243 30.8543 35.7918 30.8543 34.922V15.0998C30.8543 14.23 30.5102 13.7493 29.7761 13.818L7.93723 15.0998C7.13433 15.1684 6.85905 15.5804 6.85905 16.4502ZM27.4821 17.5261C27.6197 18.1212 27.4821 18.7392 26.8857 18.8079L25.8763 19.0139V33.7547C25.0046 34.2125 24.2017 34.4871 23.5135 34.4871C22.4353 34.4871 22.16 34.1438 21.3571 33.1367L14.7733 22.8135V32.7933L16.8609 33.2511C16.8609 33.2511 16.8609 34.4642 15.1863 34.4642L10.5524 34.7389C10.4148 34.4642 10.5524 33.8005 11.0112 33.6631L12.227 33.3198V20.1355L10.5524 19.9981C10.4148 19.403 10.7589 18.5332 11.6994 18.4645L16.6774 18.1212L23.5364 28.5588V19.3343L21.793 19.1283C21.6553 18.3959 22.2059 17.8465 22.8712 17.7778L27.4821 17.5261ZM2.08754 7.47759L21.2424 6.08133C23.5823 5.87532 24.2017 6.01266 25.6698 7.08847L31.7719 11.3688C32.7812 12.1013 33.1253 12.3073 33.1253 13.1084V36.6159C33.1253 38.0808 32.5977 38.9506 30.7166 39.0879L8.48779 40.4384C7.06552 40.5071 6.40026 40.3011 5.66618 39.3626L1.147 33.5258C0.3441 32.45 0 31.6488 0 30.7104V9.81231C0 8.59917 0.550559 7.61492 2.08754 7.47759Z"
											fill="black"
										/>
									</svg>
								</li>

								{/* LOGO 3 */}
								<li className="flex-none">
									<svg
										className="w-28"
										viewBox="0 0 135 48"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M17.43 5C7.79992 5 0 12.7999 0 22.43C0 30.1428 4.98934 36.6572 11.9178 38.9667C12.7893 39.1192 13.1161 38.5963 13.1161 38.1388C13.1161 37.7248 13.0943 36.3522 13.0943 34.8924C8.715 35.6986 7.58205 33.8249 7.23345 32.8444C7.03736 32.3433 6.18765 30.7964 5.44687 30.3824C4.83682 30.0556 3.96532 29.2495 5.42509 29.2277C6.7977 29.2059 7.77814 30.4914 8.10495 31.0143C9.67365 33.6506 12.1792 32.9098 13.1814 32.4522C13.3339 31.3193 13.7915 30.5567 14.2926 30.121C10.4144 29.6852 6.36195 28.1819 6.36195 21.5149C6.36195 19.6194 7.03736 18.0507 8.14852 16.8306C7.97422 16.3949 7.36417 14.6083 8.32282 12.2117C8.32282 12.2117 9.78259 11.7541 13.1161 13.9982C14.5105 13.6061 15.992 13.41 17.4736 13.41C18.9551 13.41 20.4367 13.6061 21.8311 13.9982C25.1646 11.7323 26.6243 12.2117 26.6243 12.2117C27.583 14.6083 26.9729 16.3949 26.7986 16.8306C27.9098 18.0507 28.5852 19.5976 28.5852 21.5149C28.5852 28.2037 24.5109 29.6852 20.6328 30.121C21.2646 30.6657 21.8093 31.7115 21.8093 33.3455C21.8093 35.6768 21.7875 37.5505 21.7875 38.1388C21.7875 38.5963 22.1143 39.141 22.9858 38.9667C26.446 37.7986 29.4527 35.5748 31.5828 32.6083C33.7129 29.6418 34.8591 26.082 34.86 22.43C34.86 12.7999 27.0601 5 17.43 5Z"
											fill="#24292E"
										/>
										<path
											d="M81.2557 30.843H81.2151C81.2334 30.843 81.2456 30.8633 81.2639 30.8654H81.2761L81.2557 30.845V30.843ZM81.2639 30.8654C81.0748 30.8674 80.5989 30.9671 80.0966 30.9671C78.5105 30.9671 77.9615 30.235 77.9615 29.2793V22.9124H81.1947C81.3777 22.9124 81.5201 22.7497 81.5201 22.526V19.0691C81.5201 18.886 81.3574 18.7234 81.1947 18.7234H77.9615V14.4327C77.9615 14.27 77.8598 14.1683 77.6768 14.1683H73.2844C73.1014 14.1683 72.9997 14.27 72.9997 14.4327V18.8454C72.9997 18.8454 70.7832 19.3944 70.6409 19.4147C70.4782 19.4554 70.3765 19.5978 70.3765 19.7604V22.526C70.3765 22.7497 70.5392 22.9124 70.7222 22.9124H72.9794V29.5822C72.9794 34.544 76.4363 35.0524 78.7952 35.0524C79.873 35.0524 81.1744 34.7067 81.3777 34.605C81.4998 34.5643 81.5608 34.422 81.5608 34.2796V31.2294C81.5636 31.1429 81.5351 31.0582 81.4806 30.991C81.426 30.9238 81.3491 30.8785 81.2639 30.8633V30.8654ZM129.45 26.3897C129.45 22.709 127.965 22.221 126.399 22.3837C125.179 22.465 124.203 23.075 124.203 23.075V30.233C124.203 30.233 125.2 30.9244 126.684 30.965C128.779 31.026 129.45 30.2736 129.45 26.3897ZM134.391 26.0643C134.391 33.0392 132.134 35.032 128.189 35.032C124.854 35.032 123.064 33.3442 123.064 33.3442C123.064 33.3442 122.983 34.2796 122.881 34.4016C122.82 34.5236 122.719 34.5643 122.597 34.5643H119.587C119.384 34.5643 119.201 34.4016 119.201 34.2186L119.242 11.6264C119.242 11.4434 119.404 11.2808 119.587 11.2808H123.919C124.102 11.2808 124.264 11.4434 124.264 11.6264V19.2927C124.264 19.2927 125.932 18.215 128.372 18.215L128.352 18.1743C130.792 18.1743 134.391 19.0894 134.391 26.0643ZM116.659 18.7234H112.389C112.165 18.7234 112.043 18.886 112.043 19.1097V30.172C112.043 30.172 110.924 30.965 109.399 30.965C107.874 30.965 107.427 30.2736 107.427 28.7485V19.0894C107.427 18.9064 107.264 18.7437 107.081 18.7437H102.729C102.546 18.7437 102.384 18.9064 102.384 19.0894V29.4806C102.384 33.9543 104.885 35.0727 108.322 35.0727C111.148 35.0727 113.446 33.5069 113.446 33.5069C113.446 33.5069 113.548 34.3 113.609 34.422C113.649 34.5236 113.792 34.605 113.934 34.605H116.659C116.883 34.605 117.005 34.4423 117.005 34.2593L117.045 19.0691C117.045 18.886 116.883 18.7234 116.659 18.7234ZM68.465 18.703H64.1337C63.9507 18.703 63.788 18.886 63.788 19.1097V34.0356C63.788 34.4423 64.0523 34.5847 64.398 34.5847H68.3023C68.709 34.5847 68.8107 34.4016 68.8107 34.0356V19.0487C68.8107 18.8657 68.648 18.703 68.465 18.703ZM66.3298 11.8298C64.7641 11.8298 63.5236 13.0702 63.5236 14.636C63.5236 16.2018 64.7641 17.4423 66.3298 17.4423C67.855 17.4423 69.0954 16.2018 69.0954 14.636C69.0954 13.0702 67.855 11.8298 66.3298 11.8298ZM99.8623 11.3214H95.5716C95.3886 11.3214 95.2259 11.4841 95.2259 11.6671V19.9841H88.495V11.6671C88.495 11.4841 88.3323 11.3214 88.1493 11.3214H83.818C83.6349 11.3214 83.4723 11.4841 83.4723 11.6671V34.2593C83.4723 34.4423 83.6553 34.605 83.818 34.605H88.1493C88.3323 34.605 88.495 34.4423 88.495 34.2593V24.6002H95.2259L95.1852 34.2593C95.1852 34.4423 95.3479 34.605 95.5309 34.605H99.8623C100.045 34.605 100.208 34.4423 100.208 34.2593V11.6671C100.208 11.4841 100.045 11.3214 99.8623 11.3214ZM61.4901 21.3262V32.9985C61.4901 33.0799 61.4698 33.2222 61.3681 33.2629C61.3681 33.2629 58.8262 35.0727 54.6372 35.0727C49.5738 35.0727 43.575 33.4866 43.575 23.0344C43.575 12.5822 48.8214 10.4267 53.9458 10.447C58.3789 10.447 60.1683 11.4434 60.453 11.6264C60.5344 11.7281 60.575 11.8095 60.575 11.9111L59.721 15.5308C59.721 15.7138 59.538 15.9375 59.3143 15.8765C58.5822 15.6528 57.4841 15.2054 54.9016 15.2054C51.9123 15.2054 48.6994 16.0595 48.6994 22.7904C48.6994 29.5212 51.7497 30.3143 53.9458 30.3143C55.8167 30.3143 56.4877 30.0906 56.4877 30.0906V25.4136H53.4985C53.2748 25.4136 53.1121 25.2509 53.1121 25.0679V21.3262C53.1121 21.1432 53.2748 20.9805 53.4985 20.9805H61.1038C61.3274 20.9805 61.4901 21.1432 61.4901 21.3262Z"
											fill="#24292E"
										/>
									</svg>
								</li>

								{/* LOGO 4 */}
								<li className="flex-none">
									<svg
										className="w-28"
										viewBox="0 0 164 48"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M163.858 21.8339V18.9522H160.279V14.4722L160.159 14.5093L156.798 15.5377L156.731 15.5579V18.9523H151.426V17.0613C151.426 16.1808 151.623 15.507 152.011 15.0576C152.396 14.6136 152.948 14.3879 153.65 14.3879C154.156 14.3879 154.679 14.507 155.206 14.7417L155.338 14.8007V11.7659L155.276 11.743C154.784 11.5665 154.116 11.4775 153.288 11.4775C152.244 11.4775 151.296 11.7047 150.469 12.1548C149.641 12.6056 148.99 13.2492 148.534 14.0674C148.08 14.8847 147.849 15.8286 147.849 16.8732V18.9522H145.357V21.8339H147.849V33.9739H151.426V21.8339H156.731V29.5486C156.731 32.726 158.23 34.3361 161.186 34.3361C161.671 34.3361 162.183 34.2792 162.704 34.1677C163.236 34.0533 163.598 33.939 163.811 33.817L163.858 33.7891V30.8807L163.712 30.977C163.518 31.1063 163.276 31.212 162.993 31.2907C162.708 31.3707 162.471 31.4108 162.286 31.4108C161.594 31.4108 161.082 31.2242 160.764 30.856C160.442 30.4845 160.279 29.8348 160.279 28.9259V21.8339H163.858ZM137.369 31.4113C136.071 31.4113 135.047 30.9808 134.326 30.1327C133.6 29.2804 133.232 28.0653 133.232 26.5214C133.232 24.9286 133.6 23.6819 134.326 22.8146C135.048 21.9529 136.062 21.5156 137.34 21.5156C138.58 21.5156 139.568 21.9332 140.275 22.7577C140.986 23.5863 141.346 24.823 141.346 26.4344C141.346 28.0656 141.007 29.3186 140.338 30.1568C139.674 30.9887 138.675 31.4113 137.369 31.4113ZM137.528 18.5903C135.051 18.5903 133.084 19.3161 131.681 20.7476C130.279 22.1793 129.568 24.1605 129.568 26.6367C129.568 28.9886 130.262 30.8804 131.631 32.2587C132.999 33.6374 134.862 34.3358 137.166 34.3358C139.567 34.3358 141.495 33.5998 142.897 32.1485C144.299 30.6988 145.01 28.7363 145.01 26.3179C145.01 23.9292 144.343 22.0233 143.028 20.6542C141.712 19.2846 139.862 18.5903 137.528 18.5903ZM123.801 18.5903C122.116 18.5903 120.722 19.0213 119.658 19.8711C118.586 20.7259 118.043 21.847 118.043 23.2037C118.043 23.9089 118.16 24.5353 118.391 25.0667C118.623 25.5997 118.983 26.0691 119.46 26.463C119.934 26.8537 120.665 27.2629 121.634 27.6793C122.449 28.0146 123.057 28.2982 123.443 28.5217C123.82 28.7407 124.088 28.9609 124.239 29.1754C124.386 29.3852 124.46 29.6724 124.46 30.0269C124.46 31.0361 123.704 31.5271 122.149 31.5271C121.572 31.5271 120.915 31.4067 120.194 31.1692C119.478 30.9354 118.803 30.5929 118.191 30.1538L118.043 30.0473V33.4912L118.097 33.5166C118.603 33.7502 119.241 33.9473 119.994 34.1023C120.744 34.2575 121.426 34.3364 122.019 34.3364C123.847 34.3364 125.32 33.9034 126.394 33.0485C127.475 32.1878 128.023 31.0402 128.023 29.6366C128.023 28.6241 127.728 27.7558 127.147 27.0555C126.569 26.3609 125.567 25.7232 124.169 25.1595C123.055 24.7125 122.342 24.3415 122.048 24.0566C121.764 23.7815 121.62 23.3923 121.62 22.8995C121.62 22.4627 121.798 22.1127 122.163 21.8293C122.531 21.5444 123.043 21.3996 123.685 21.3996C124.281 21.3996 124.891 21.4937 125.497 21.6782C126.103 21.8627 126.636 22.1098 127.08 22.4121L127.226 22.512V19.2451L127.17 19.221C126.76 19.0452 126.219 18.8948 125.563 18.7727C124.909 18.6515 124.317 18.5903 123.801 18.5903ZM108.718 31.4113C107.42 31.4113 106.396 30.9808 105.675 30.1327C104.949 29.2804 104.581 28.0656 104.581 26.5214C104.581 24.9286 104.949 23.6819 105.675 22.8146C106.397 21.9529 107.41 21.5156 108.689 21.5156C109.929 21.5156 110.916 21.9332 111.624 22.7577C112.335 23.5863 112.695 24.823 112.695 26.4344C112.695 28.0656 112.356 29.3186 111.687 30.1568C111.023 30.9887 110.024 31.4113 108.718 31.4113ZM108.877 18.5903C106.4 18.5903 104.432 19.3161 103.03 20.7476C101.628 22.1793 100.917 24.1605 100.917 26.6367C100.917 28.9896 101.611 30.8804 102.98 32.2587C104.348 33.6374 106.211 34.3358 108.515 34.3358C110.916 34.3358 112.844 33.5998 114.247 32.1485C115.648 30.6988 116.359 28.7363 116.359 26.3179C116.359 23.9292 115.692 22.0233 114.377 20.6542C113.061 19.2846 111.21 18.5903 108.877 18.5903ZM95.487 21.5536V18.9522H91.9536V33.9736H95.487V26.2895C95.487 24.983 95.7833 23.9095 96.3679 23.0988C96.945 22.2977 97.7141 21.8917 98.6531 21.8917C98.9714 21.8917 99.3287 21.9442 99.7156 22.048C100.099 22.1512 100.376 22.2633 100.54 22.3812L100.688 22.4888V18.9265L100.631 18.9019C100.302 18.7621 99.8362 18.6916 99.2472 18.6916C98.3592 18.6916 97.5646 18.9769 96.884 19.5387C96.2866 20.0324 95.8548 20.7094 95.5246 21.5536H95.487ZM85.6258 18.5903C84.0047 18.5903 82.5588 18.9379 81.3289 19.6231C80.0965 20.31 79.1434 21.2905 78.4949 22.5373C77.8493 23.7811 77.5215 25.234 77.5215 26.8543C77.5215 28.2736 77.8393 29.5761 78.4675 30.724C79.096 31.8738 79.9855 32.7733 81.1116 33.3972C82.2361 34.0203 83.5357 34.3362 84.9746 34.3362C86.6538 34.3362 88.0876 34.0005 89.2371 33.3384L89.2835 33.3118V30.0746L89.135 30.183C88.6143 30.5623 88.0324 30.8651 87.4063 31.0832C86.7818 31.3011 86.2124 31.4113 85.7131 31.4113C84.3266 31.4113 83.2136 30.9774 82.4057 30.1221C81.596 29.2657 81.1855 28.0631 81.1855 26.5498C81.1855 25.027 81.6136 23.7935 82.4573 22.8834C83.2985 21.9759 84.4136 21.5156 85.7714 21.5156C86.9328 21.5156 88.0646 21.9088 89.1353 22.6855L89.2835 22.7932V19.3822L89.2356 19.3553C88.8327 19.1297 88.2832 18.9435 87.6009 18.8022C86.9216 18.6613 86.2571 18.5903 85.6258 18.5903ZM75.088 18.9523H71.5545V33.9736H75.088V18.9523ZM73.3574 12.5532C72.7758 12.5532 72.2686 12.7512 71.8518 13.1435C71.4334 13.5369 71.2211 14.0322 71.2211 14.6168C71.2211 15.1922 71.4308 15.6785 71.8453 16.0615C72.2571 16.4433 72.766 16.6368 73.3575 16.6368C73.9489 16.6368 74.4596 16.4433 74.8763 16.0621C75.2958 15.6785 75.5085 15.1923 75.5085 14.6168C75.5085 14.0527 75.3015 13.5624 74.8936 13.1593C74.4861 12.757 73.969 12.5532 73.3574 12.5532ZM64.5411 17.844V33.9736H68.1472V13.013H63.1562L56.8124 28.5819L50.6561 13.013H45.4619V33.9734H48.8507V17.8425H48.967L55.4679 33.9736H58.0253L64.4248 17.844H64.5411Z"
											fill="#706D6E"
										/>
										<path
											d="M16.6225 22.6313H0V6.00879H16.6225V22.6313Z"
											fill="#F1511B"
										/>
										<path
											d="M34.9757 22.6313H18.3535V6.00879H34.9757V22.6313Z"
											fill="#80CC28"
										/>
										<path
											d="M16.622 40.991H0V24.3687H16.622V40.991Z"
											fill="#00ADEF"
										/>
										<path
											d="M34.9757 40.991H18.3535V24.3687H34.9757V40.991Z"
											fill="#FBBC09"
										/>
									</svg>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<section className="py-14">
					<div className="max-w-screen-xl mx-auto px-4 text-gray-600 gap-16 justify-between md:px-8 lg:flex">
						<div>
							<div className="max-w-xl space-y-3">
								<h3 className="text-blue-600 font-semibold">
									Fonctionnalités
								</h3>
								<p className="text-gray-800 text-3xl font-semibold sm:text-4xl">
									Facilitez vos rencontres professionnelles
								</p>
								<p>
									Simplifiez vos rendez-vous professionnels en
									quelques clics. Planifiez, gérez et
									fidélisez facilement avec notre plateforme
									intuitive.
								</p>
							</div>
							<div className="mt-12 max-w-lg lg:max-w-none">
								<ul className="space-y-8">
									{features.map((item, idx) => (
										<li key={idx} className="flex gap-x-4">
											<div className="flex-none w-12 h-12 bg-indigo-50 text-blue-600 rounded-lg flex items-center justify-center">
												{item.icon}
											</div>
											<div>
												<h4 className="text-lg text-gray-800 font-semibold">
													{item.title}
												</h4>
												<p className="mt-3">
													{item.desc}
												</p>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div className="mt-12 lg:mt-0">
							<img
								src="/Images/dashboardmyrendev.png"
								className="w-full shadow-lg rounded-lg border"
							/>
						</div>
					</div>
				</section>
				<section
					className="py-28"
					style={{
						background:
							"linear-gradient(143.6deg, rgba(132, 193, 252, 0) 20.79%, rgba(121, 182, 249, 0.26) 40.92%, rgba(171, 204, 238, 0) 70.35%)",
					}}
				>
					<div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
						<div className="max-w-xl space-y-3 md:mx-auto">
							<h3 className="text-blue-600 font-semibold">
								Services Professionnels
							</h3>
							<p className="text-gray-800 text-3xl font-semibold sm:text-4xl">
								Une gestion de rendez-vous professionnelle
							</p>
							<p className="text-gray-600">
								Transformez la façon dont vous planifiez vos
								rendez-vous avec My Rendev. Découvrez une
								gestion simple, efficace et intuitive, conçue
								pour répondre à vos besoins professionnels.
							</p>
						</div>
						<div className="mt-4">
							<a
								href="#"
								onClick={scrollToPricing}
								className="inline-block py-2 px-4 text-white font-medium bg-gray-800 duration-150 hover:bg-gray-700 active:bg-gray-900 rounded-lg shadow-md hover:shadow-none"
							>
								Commencer
							</a>
						</div>
					</div>
				</section>
				<section id="pricingSection" className="py-14">
					<div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
						<div className="relative max-w-xl mx-auto sm:text-center">
							<h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
								Tarifs
							</h3>
							<div className="mt-3 max-w-xl">
								<p>
									Choisissez parmi nos plans tarifaires
									adaptés à votre entreprise. Simplifiez votre
									gestion de rendez-vous dès aujourd'hui avec
									My Rendev.
								</p>
							</div>
						</div>
						<div className="mt-16 justify-center gap-6 sm:grid sm:grid-cols-2 sm:space-y-0 lg:grid-cols-3">
							{plans.map((item, idx) => (
								<Badge.Ribbon text={item.ribbon} key={idx}>
									<div
										key={idx}
										className={`relative flex-1 flex items-stretch flex-col rounded-xl border-2 mt-6 sm:mt-0 ${
											item.isMostPop ? "mt-10" : ""
										}`}
									>
										{item.isMostPop ? (
											<span className="w-32 absolute -top-5 left-0 right-0 mx-auto px-3 py-2 rounded-full border shadow-md bg-white text-center text-gray-700 text-sm font-semibold">
												Plus Populaire
											</span>
										) : (
											""
										)}
										<div className="p-8 space-y-4 border-b relative overflow-hidden">
											<div className="ribbon absolute transform -rotate-45 bg-red-600 text-center text-white font-semibold py-1 left-[-70px] top-[40px] w-[250px]">
												<h2 className="text-sm font-semibold mb-0 h-5">
													{item.offres}
												</h2>
											</div>

											<span className="text-blue-600 font-medium flex justify-center">
												{item.name}
											</span>
											<div className="text-gray-800 text-3xl font-semibold">
												€{item.price}{" "}
												<span className="text-xl text-gray-600 font-normal">
													/mois
												</span>
											</div>
											<p>{item.desc}</p>
											<p>{item.people}</p>
											<button className="px-3 py-3 rounded-lg w-full font-semibold text-sm duration-150 text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700">
												Commencer{" "}
											</button>
										</div>
										<ul className="p-8 space-y-3">
											<li className="pb-2 text-gray-800 font-medium">
												<p>Fonctionnalités</p>
											</li>
											<span className="text-black font-medium text-lg">
												{item.included}
											</span>
											{item.features.map(
												(featureItem, idx) => (
													<div
														className="flex flex-col"
														key={idx}
													>
														<li
															key={idx}
															className="flex items-center gap-5"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																className="h-5 w-5 text-blue-600"
																viewBox="0 0 20 20"
																fill="currentColor"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																></path>
															</svg>
															{featureItem}
														</li>
													</div>
												)
											)}
										</ul>
									</div>
								</Badge.Ribbon>
							))}
						</div>
					</div>
				</section>
				<section className="relative py-14">
					<div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8">
						<div className="max-w-xl sm:text-center md:mx-auto">
							<h3 className="text-gray-800 text-3xl font-semibold sm:text-4xl">
								Témoignages
							</h3>
							<p className="mt-3 text-gray-600">
								Découvrez ce que nos utilisateurs pensent de My
								Rendev. Simplifiez votre gestion de rendez-vous
								dès aujourd'hui.
							</p>
						</div>
						<div className="mt-12">
							<ul className="grid items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{testimonials.map((item, idx) => (
									<li
										key={idx}
										className="bg-white rounded-xl border shadow-md"
									>
										<div className="p-4">
											<svg
												className="w-9 h-9 text-gray-300"
												viewBox="0 0 35 35"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M9.47895 14.5833C9.15374 14.5833 8.84166 14.6329 8.53103 14.6781C8.63166 14.3398 8.7352 13.9956 8.90145 13.6865C9.0677 13.2373 9.32728 12.8479 9.58541 12.4556C9.80124 12.0312 10.1819 11.7439 10.4619 11.3808C10.755 11.0279 11.1546 10.7931 11.471 10.5C11.7817 10.1937 12.1885 10.0406 12.5123 9.82478C12.8506 9.63082 13.1452 9.41645 13.4602 9.31437L14.2462 8.99062L14.9375 8.70332L14.2302 5.87708L13.3596 6.08707C13.081 6.15707 12.7412 6.23874 12.3548 6.33645C11.9596 6.40937 11.5381 6.60916 11.0685 6.79145C10.6048 6.99853 10.0681 7.13853 9.56937 7.47103C9.0677 7.78895 8.48874 8.05437 7.97833 8.4802C7.48395 8.91916 6.88749 9.29978 6.44708 9.85833C5.96583 10.3804 5.49041 10.9287 5.12145 11.5529C4.69416 12.1479 4.40395 12.8012 4.0977 13.4473C3.82062 14.0933 3.59749 14.754 3.4152 15.3956C3.06958 16.6819 2.91499 17.904 2.8552 18.9496C2.80562 19.9967 2.83478 20.8673 2.89603 21.4973C2.91791 21.7948 2.95874 22.0835 2.98791 22.2833L3.02437 22.5283L3.06228 22.5196C3.32167 23.7312 3.91877 24.8446 4.78452 25.7311C5.65028 26.6175 6.7493 27.2408 7.95447 27.5287C9.15963 27.8166 10.4217 27.7575 11.5946 27.3581C12.7676 26.9587 13.8035 26.2354 14.5825 25.2719C15.3616 24.3083 15.8519 23.1439 15.9969 21.9133C16.1418 20.6828 15.9353 19.4363 15.4014 18.3181C14.8675 17.2 14.028 16.2558 12.9799 15.5949C11.9318 14.934 10.718 14.5832 9.47895 14.5833ZM25.5206 14.5833C25.1954 14.5833 24.8833 14.6329 24.5727 14.6781C24.6733 14.3398 24.7769 13.9956 24.9431 13.6865C25.1094 13.2373 25.369 12.8479 25.6271 12.4556C25.8429 12.0312 26.2235 11.7439 26.5035 11.3808C26.7967 11.0279 27.1962 10.7931 27.5127 10.5C27.8233 10.1937 28.2302 10.0406 28.554 9.82478C28.8923 9.63082 29.1869 9.41645 29.5019 9.31437L30.2879 8.99062L30.9792 8.70332L30.2719 5.87708L29.4012 6.08707C29.1227 6.15707 28.7829 6.23874 28.3965 6.33645C28.0012 6.40937 27.5798 6.60916 27.1102 6.79145C26.6479 6.99999 26.1098 7.13853 25.611 7.47249C25.1094 7.79041 24.5304 8.05582 24.02 8.48166C23.5256 8.92062 22.9292 9.30124 22.4887 9.85833C22.0075 10.3804 21.5321 10.9287 21.1631 11.5529C20.7358 12.1479 20.4456 12.8012 20.1394 13.4473C19.8623 14.0933 19.6392 14.754 19.4569 15.3956C19.1112 16.6819 18.9567 17.904 18.8969 18.9496C18.8473 19.9967 18.8765 20.8673 18.9377 21.4973C18.9596 21.7948 19.0004 22.0835 19.0296 22.2833L19.066 22.5283L19.104 22.5196C19.3633 23.7312 19.9604 24.8446 20.8262 25.7311C21.6919 26.6175 22.791 27.2408 23.9961 27.5287C25.2013 27.8166 26.4634 27.7575 27.6363 27.3581C28.8093 26.9587 29.8452 26.2354 30.6242 25.2719C31.4033 24.3083 31.8936 23.1439 32.0385 21.9133C32.1834 20.6828 31.977 19.4363 31.4431 18.3181C30.9092 17.2 30.0697 16.2558 29.0216 15.5949C27.9735 14.934 26.7597 14.5832 25.5206 14.5833Z"
													fill="currentColor"
												/>
											</svg>
										</div>
										<figure>
											<blockquote>
												<p className="text-gray-800 text-lg font-semibold px-4 py-1">
													{item.quote}
												</p>
											</blockquote>
											<div className="flex items-center gap-x-4 p-4 mt-6 bg-blue-50">
												<img
													src={item.avatar}
													className="w-16 h-16 rounded-full border-2 border-blue-500"
												/>
												<div>
													<span className="block text-gray-800 font-semibold">
														{item.name}
													</span>
													<span className="block text-blue-600 text-sm mt-0.5">
														{item.title}
													</span>
												</div>
											</div>
										</figure>
									</li>
								))}
							</ul>
						</div>
					</div>
					<div
						className="absolute top-0 w-full h-[350px]"
						style={{
							background:
								"linear-gradient(143.6deg, rgba(132, 193, 252, 0) 20.79%, rgba(121, 182, 249, 0.26) 40.92%, rgba(171, 204, 238, 0) 70.35%)",
						}}
					></div>
				</section>
				<section className="leading-relaxed max-w-screen-xl mt-12 mx-auto px-4 md:px-8">
					<div className="leading-relaxed mt-12 mx-4 md:mx-8">
						<div className="text-center space-y-3">
							<h1 className="block text-gray-800 text-3xl font-semibold">
								Questions Fréquentes
							</h1>
							<p className="text-gray-500 max-w-lg mx-auto">
								Trouvez des réponses rapides aux questions les
								plus courantes sur My Rendev. Simplifiez votre
								expérience de gestion de rendez-vous avec notre
								FAQ.
							</p>
						</div>
						<div
							className="relative bg-white rounded-md mt-10 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl sm:mx-auto"
							style={{ boxShadow: "0px 7px 20px 7px #F1F1F1" }}
						>
							<div className="grid gap-4 py-8 md:grid-cols-2">
								{faqsList.map((item, idx) => (
									<div
										className="space-y-3 mt-6 px-8"
										key={idx}
									>
										<div
											className="flex justify-between items-center cursor-pointer"
											onClick={() =>
												toggleAnswerVisibility(idx)
											}
										>
											<h4 className="text-gray-800 text-xl font-semibold">
												{item.q}
											</h4>
											<span className="text-xl">
												{visibleAnswers[idx]
													? "-"
													: "+"}
											</span>
										</div>
										{visibleAnswers[idx] && ( // Render answer only if visibility is true
											<div>
												<hr className="border-gray-300 my-2" />
												<p className="text-gray-500">
													{item.a}
												</p>
											</div>
										)}
									</div>
								))}
							</div>
							<span className="w-0.5 h-full bg-gray-200 m-auto absolute top-0 left-0 right-0 hidden md:block"></span>
						</div>
					</div>
				</section>
				<footer className="pt-10">
					<div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
						<div className="space-y-6 sm:max-w-md sm:mx-auto sm:text-center">
							<img src={logo} className="w-32 sm:mx-auto" />
							<p>
								My Rendev - Simplifiez votre gestion de
								rendez-vous
							</p>
							<div className="items-center gap-x-3 space-y-3 sm:flex sm:justify-center sm:space-y-0">
								<a
									href="#"
									onClick={scrollToPricing}
									className="block py-2 px-4 text-center text-white font-medium bg-blue-600 duration-150 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-lg hover:shadow-none"
								>
									Choisissez un forfait
								</a>
								<Link
									to="/login"
									className="flex items-center justify-center gap-x-2 py-2 px-4 text-gray-700 hover:text-gray-500 font-medium duration-150 active:bg-gray-100 border rounded-lg md:inline-flex"
								>
									Obtenir l'accès
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-5 h-5"
									>
										<path
											fillRule="evenodd"
											d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
											clipRule="evenodd"
										/>
									</svg>
								</Link>
							</div>
						</div>
						<div className="mt-10 py-10 border-t items-center justify-between sm:flex">
							<p>© 2024 Tous droits réservés.</p>
							<ul className="flex flex-wrap items-center gap-4 mt-6 sm:text-sm sm:mt-0">
								{footerNavs.map((item, idx) => (
									<li
										className="text-gray-800 hover:text-gray-500 duration-150"
										key={idx}
									>
										<Link to={item.to}>{item.name}</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
};

export default HomePage;
