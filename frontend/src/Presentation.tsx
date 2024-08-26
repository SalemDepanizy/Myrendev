import { useState } from "react";
import { cn } from "./utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import logo from "./assets/logo.png";
import { Link, useParams } from "react-router-dom";
function Presentation() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const faqsList: FaqList[] = [
		{
			id: "btp",
			qas: [
				{
					q: "Flexibilité dans la gestion du temps",
					a: "Vous avez la possibilité de définir les créneaux horaires préétablis, adaptés à votre emploi du temps. Vos clients pourront choisir parmi ces options prédéfinies, ce qui réduit les allers-retours et les confusions potentielles.",
				},
				{
					q: "Envoi automatique d'un mail d'avis",
					a: "Une fois l'intervention terminée, notre système envoie automatiquement un mail à vos clients pour recueillir leur avis. Vous pouvez choisir si ce mail doit être envoyé immédiatement après le rendez-vous ou après quelques heures. Cette flexibilité vous permet de gérer l'envoi des demandes d'avis en fonction de votre processus interne et de la durée estimée de l'intervention.",
				},
				{
					q: "Notification préalable par mail et SMS",
					a: "Grâce à notre solution, vous n'avez plus besoin de rappeler vos clients pour les prévenir de votre intervention. La veille de l'intervention, nos systèmes envoient automatiquement un mail et un SMS à vos clients pour leur rappeler l'échéance. Cela garantit que vos clients sont bien informés et préparés pour votre intervention, tout en évitant des rappels manuels fastidieux.",
				},
				{
					q: "Gestion des interventions",
					a: "Notre solution offre également la possibilité de configurer les types d'interventions que vous réalisez à des moments spécifiques de la journée. Par exemple, si vous posez des portes uniquement le matin, vous pouvez le spécifier dans la configuration. Cela assure une gestion plus précise de votre emploi du temps et de vos activités.",
				},
				{
					q: "Choix du planning",
					a: "Vous avez le choix entre un planning détaillé heure par heure pour une gestion minutieuse ou des créneaux horaires plus larges pour une flexibilité accrue. De plus, la possibilité d'ajouter le temps de trajet entre chaque rendez-vous améliore l'efficacité de votre planification.",
				},
				{
					q: "Gestion du nombre de personnes",
					a: "Sur chaque intervention, vous avez la possibilité de choisir le nombre de personnes nécessaires. Vous pouvez également désigner une ou plusieurs personnes pour chaque intervention. Notre solution gère également le planning de chaque ouvrier, facilitant ainsi la répartition des tâches et la coordination de votre équipe.",
				},
				{
					q: "Attribution de véhicules",
					a: "Notre solution offre également la possibilité d'attribuer un véhicule à chaque ouvrier. Cela facilite la gestion des déplacements et l'optimisation des ressources.",
				},
				{
					q: "Gestion des commandes clients",
					a: "En cas de commande spécifique, comme la fabrication d'une clé, vous pouvez définir le délai nécessaire pour recevoir ou créer la clé. Une fois cela fait, notre solution enverra automatiquement un e-mail et un SMS au client pour l'aviser que sa clé est prête, l'invitant ainsi à venir la récupérer et évitant ainsi de perdre du temps à rappeler au client, améliorant ainsi l'efficacité du processus.",
				},
				{
					q: "Gestion des délais d'approvisionnement",
					a: "Lorsque vous avez besoin de commander des éléments, tels qu'une serrure, avec un délai d'approvisionnement, notre solution vous permet de spécifier ce délai. En conséquence, la planification des rendez-vous sera automatiquement ajustée, ne proposant que des créneaux disponibles après la réception de la serrure, par exemple.",
				},
				{
					q: "Accès individuel pour chaque collaborateur",
					a: "Chaque collaborateur disposera d'un accès dédié pour consulter et gérer ses propres rendez-vous, offrant ainsi une visibilité et un contrôle individualisés sur son planning.",
				},
				{
					q: "Ajout de photos et devis",
					a: "Sur chaque intervention, vous avez la possibilité d'ajouter des photos et des devis, permettant une documentation détaillée et une communication efficace avec vos clients. Cela contribue à renforcer la transparence et à faciliter la compréhension mutuelle entre vous et vos clients.",
				},
				{
					q: "Choix de la prise de rendez-vous",
					a: "Que ce soit en ligne par le client ou par votre équipe en fonction de vos disponibilités, notre solution offre une flexibilité totale dans le processus de prise de rendez-vous. Cela permet d'adapter la méthode selon les préférences et les besoins spécifiques de votre entreprise et de vos clients.",
				},
				{
					q: "Publications d'avis positifs sur Google",
					a: "Si l'avis de vos clients est positif, notre système les invite à le publier directement sur votre page Google. Cela contribue à renforcer votre réputation en ligne et à attirer de nouveaux clients. En encourageant les retours positifs, vous améliorez",
				},
			],
		},
		{
			id: "autoecole",
			qas: [
				{
					q: "Flexibilité dans la gestion du temps",
					a: "Vous avez la possibilité de définir les créneaux horaires préétablis, adaptés à votre emploi du temps. Vos clients pourront choisir parmi ces options prédéfinies, ce qui réduit les allers-retours et les confusions potentielles.",
				},
				{
					q: "Envoi automatique d'un mail d'avis",
					a: "Une fois l'intervention terminée, notre système envoie automatiquement un mail à vos clients pour recueillir leur avis. Vous pouvez choisir si ce mail doit être envoyé immédiatement après le rendez-vous ou après quelques heures. Cette flexibilité vous permet de gérer l'envoi des demandes d'avis en fonction de votre processus interne et de la durée estimée de l'intervention.",
				},
				{
					q: "Notification préalable par mail et SMS",
					a: "Grâce à notre solution, vous n'avez plus besoin de rappeler vos clients pour les prévenir de votre intervention. La veille de l'intervention, nos systèmes envoient automatiquement un mail et un SMS à vos clients pour leur rappeler l'échéance. Cela garantit que vos clients sont bien informés et préparés pour votre intervention, tout en évitant des rappels manuels fastidieux.",
				},
				{
					q: "Gestion des interventions",
					a: "Notre solution offre également la possibilité de configurer les types d'interventions que vous réalisez à des moments spécifiques de la journée. Par exemple, si vous posez des portes uniquement le matin, vous pouvez le spécifier dans la configuration. Cela assure une gestion plus précise de votre emploi du temps et de vos activités.",
				},
				{
					q: "Choix du planning",
					a: "Vous avez le choix entre un planning détaillé heure par heure pour une gestion minutieuse ou des créneaux horaires plus larges pour une flexibilité accrue. De plus, la possibilité d'ajouter le temps de trajet entre chaque rendez-vous améliore l'efficacité de votre planification.",
				},
				{
					q: "Gestion du nombre de personnes",
					a: "Sur chaque intervention, vous avez la possibilité de choisir le nombre de personnes nécessaires. Vous pouvez également désigner une ou plusieurs personnes pour chaque intervention. Notre solution gère également le planning de chaque ouvrier, facilitant ainsi la répartition des tâches et la coordination de votre équipe.",
				},
				{
					q: "Attribution de véhicules",
					a: "Notre solution offre également la possibilité d'attribuer un véhicule à chaque ouvrier. Cela facilite la gestion des déplacements et l'optimisation des ressources.",
				},
				{
					q: "Gestion des commandes clients",
					a: "En cas de commande spécifique, comme la fabrication d'une clé, vous pouvez définir le délai nécessaire pour recevoir ou créer la clé. Une fois cela fait, notre solution enverra automatiquement un e-mail et un SMS au client pour l'aviser que sa clé est prête, l'invitant ainsi à venir la récupérer et évitant ainsi de perdre du temps à rappeler au client, améliorant ainsi l'efficacité du processus.",
				},
				{
					q: "Gestion des délais d'approvisionnement",
					a: "Lorsque vous avez besoin de commander des éléments, tels qu'une serrure, avec un délai d'approvisionnement, notre solution vous permet de spécifier ce délai. En conséquence, la planification des rendez-vous sera automatiquement ajustée, ne proposant que des créneaux disponibles après la réception de la serrure, par exemple.",
				},
				{
					q: "Accès individuel pour chaque collaborateur",
					a: "Chaque collaborateur disposera d'un accès dédié pour consulter et gérer ses propres rendez-vous, offrant ainsi une visibilité et un contrôle individualisés sur son planning.",
				},
				{
					q: "Ajout de photos et devis",
					a: "Sur chaque intervention, vous avez la possibilité d'ajouter des photos et des devis, permettant une documentation détaillée et une communication efficace avec vos clients. Cela contribue à renforcer la transparence et à faciliter la compréhension mutuelle entre vous et vos clients.",
				},
				{
					q: "Choix de la prise de rendez-vous",
					a: "Que ce soit en ligne par le client ou par votre équipe en fonction de vos disponibilités, notre solution offre une flexibilité totale dans le processus de prise de rendez-vous. Cela permet d'adapter la méthode selon les préférences et les besoins spécifiques de votre entreprise et de vos clients.",
				},
				{
					q: "Publications d'avis positifs sur Google",
					a: "Si l'avis de vos clients est positif, notre système les invite à le publier directement sur votre page Google. Cela contribue à renforcer votre réputation en ligne et à attirer de nouveaux clients. En encourageant les retours positifs, vous améliorez",
				},
			],
		},
	];

	const navigation = [
		{ title: "Accueil", path: "/" },
		{ title: "À Propos", path: "/presentation/btp" },
		{ title: "Contactez-Nous", path: "/contacteznous" },
	];

	type FaqList = {
		id: string;
		qas: Faq[];
	};

	type Faq = {
		q: string;
		a: string;
	};

	const { id } = useParams();

	if (!id) {
		return <HomePage />;
	}

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
			<section className="pt-8 pb-14">
				{/* <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <img src={logo} alt="" className="w-40" />
      </div> */}
				<div className="max-w-screen-xl mx-auto px-4 md:px-8">
					<div className="max-w-lg">
						<h3 className="mt-3 text-gray-800 text-3xl font-extrabold sm:text-4xl">
							MyRendev est une solution de gestion de rendez-vous
							et de notoriété
						</h3>
					</div>
					<div className=" divide-y sm:mt-5">
						{(
							[
								...([
									faqsList.find((list) => list.id === id),
								].filter(Boolean) || ([] as any)),
							] as FaqList[]
						).map((list, idx) => (
							<div
								key={idx}
								className="py-5 gap-x-12 first:pt-0 sm:flex"
							>
								<div className="max-w-sm pt-8 pb-6 sm:pt-0 lg:flex-grow">
									<h4 className="text-gray-500 text-2xl font-semibold">
										Fonctionnalités
									</h4>
								</div>
								<ul className="flex-1 space-y-6 sm:last:pb-6 sm:space-y-8">
									{list.qas.map((item, idx) => (
										<Accordion
											key={idx}
											q={item.q}
											a={item.a}
										/>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}

export default Presentation;

function Accordion({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<li
			className={cn("duration-200 ease-in-out transition-all")}
			onClick={() => setOpen(!open)}
		>
			<summary className="flex items-center justify-between font-semibold text-gray-700">
				<span>{q}</span> {open ? <ChevronUp /> : <ChevronDown />}
			</summary>
			<div
				className={cn(
					"mt-4  py-2",
					open ? "translate-y-0" : "translate-y-[-100%]"
				)}
			>
				<p
					dangerouslySetInnerHTML={{ __html: a }}
					className={cn(" text-gray-500", open ? "block" : "hidden")}
				></p>
			</div>
		</li>
	);
}

function HomePage() {
	return <div></div>;
}
