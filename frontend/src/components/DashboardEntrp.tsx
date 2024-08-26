import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserFriends, FaUsers, FaBuffer } from "react-icons/fa";
import useSWR from "swr";
import { fetcher } from "../axios";
import { Student } from "../Students";
import { Monitor } from "../Moniteurs";
import Forfait from "../Forfait";
import "chart.js/auto";
import Planing from "./Planing";
import AvisDashboard from "./dashboardComp/AvisDashboard";

interface StarRatingProps {
	rating: number;
}
interface User {
	name: string;
	lastname: string;
	email: string;
	image: string;
}

interface SatisfactionResponse {
	id: string;
	user: User;
	createdAt: string;
	notegeneral: number;
	comments: string;
}

interface SatisfactionResponseData {
	data: SatisfactionResponse[];
}

type Rendezvous = {
	creneau: string;
	id: string;
	title: string;
	dateTime: string;
	description: string | null;
	client: User;
	forfait?: Forfait;
	monitor?: Monitor;
	images?: { filename: string; rendezVousId: string }[];
	count?: number; // Ajout de la propriété count
	status?: string;
	isActivated?: boolean;
	isValid?: boolean;
};

function StarRating({ rating }: StarRatingProps): JSX.Element {
	const stars: JSX.Element[] = [];
	const totalStars = 5;
	const filledStars = Math.round(rating);
	for (let i = 0; i < totalStars; i++) {
		if (i < filledStars) {
			stars.push(
				<svg
					key={i}
					className="w-4 h-4 fill-current text-yellow-500 inline-block"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M10 0l2.76 6.64 6.86.5c.56.05.79.76.37 1.14l-5.28 4.61 1.56 6.8c.16.68-.55 1.22-1.14.86L10 16.36 4.48 18.45c-.59.36-1.3-.18-1.14-.86l1.56-6.8-5.28-4.61c-.42-.37-.19-1.09.37-1.14l6.86-.5L10 0z"
					/>
				</svg>
			);
		} else {
			stars.push(
				<svg
					key={i}
					className="w-4 h-4 fill-current text-gray-400 inline-block"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
				>
					<path
						fillRule="evenodd"
						d="M10 0l2.76 6.64 6.86.5c.56.05.79.76.37 1.14l-5.28 4.61 1.56 6.8c.16.68-.55 1.22-1.14.86L10 16.36 4.48 18.45c-.59.36-1.3-.18-1.14-.86l1.56-6.8-5.28-4.61c-.42-.37-.19-1.09.37-1.14l6.86-.5L10 0z"
					/>
				</svg>
			);
		}
	}
	return <div className="flex">{stars}</div>;
}

const today = new Date();
const daysInFrench = [
	"Dimanche",
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi",
];
const todayInFrench = daysInFrench[today.getDay()];

function DashboardEntrp() {
	const [satisfactionStats, setSatisfactionStats] = useState({
		insatisfait: 0,
		satisfait: 0,
		tresSatisfait: 0,
	});

	const {
		data: students,
		isLoading: loadingStudents,
		error: errorStudents,
	} = useSWR("/users/get/student", async (url) => {
		return (await fetcher.get(url)).data as Student[];
	});

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	const { data: forfaits } = useSWR("/forfait/all", async (url) => {
		return (await fetcher.get(url)).data as Forfait[];
	});

	const {
		data: satisfactionResponse,
		isLoading: loadingSatisfactionResponse,
		error: errorSatisfactionResponse,
	} = useSWR("/satisfactionreponse/all", async (url) => {
		const response = await fetcher.get(url);
		const satisfaction = response.data as SatisfactionResponseData;
		return satisfaction;
	});

	useEffect(() => {
		if (satisfactionResponse?.data) {
			const total = satisfactionResponse.data.length;
			const counts = satisfactionResponse.data.reduce(
				(acc, cur) => {
					if (cur.notegeneral < 2.5) acc.insatisfait++;
					else if (cur.notegeneral <= 3.5) acc.satisfait++;
					else acc.tresSatisfait++;
					return acc;
				},
				{ insatisfait: 0, satisfait: 0, tresSatisfait: 0 }
			);

			setSatisfactionStats({
				insatisfait: (counts.insatisfait / total) * 100,
				satisfait: (counts.satisfait / total) * 100,
				tresSatisfait: (counts.tresSatisfait / total) * 100,
			});
		}
	}, [satisfactionResponse]);

	return (
		<main className="flex-1 overflow-x-hidden overflow-y-auto bg-white min-h-screen">
			<div className="container px-6 py-8 mx-auto ">
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
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 my-8 px-4 md:px-8 place-items-center">
						<Link
							to="/students"
							className="h-28 w-full rounded-xl bg-white p-3 md:p-4 flex items-center gap-3 shadow-md hover:shadow-lg border border-gray-900/10"
						>
							<div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#fdf4ff]">
								<FaUsers className="w-8 h-8 text-[#e879f9]" />
							</div>
							<div className="flex flex-col justify-center gap-1">
								<span className="text-2xl font-semibold text-[#555]">
									{students?.length || 0}
								</span>
								<span className="text-[15px] text-gray-600 font-semibold">
									Total Clients
								</span>
							</div>
						</Link>
						<div className="w-full rounded-xl bg-white p-3 md:p-4 flex items-center gap-3 shadow-md hover:shadow-lg border border-gray-900/10">
							<div className="flex flex-col items-center gap-1.5 border-r pr-5">
								<div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#fdf4ff]">
									<FaUserFriends className="w-8 h-8 text-[#e879f9]" />
								</div>
								<span className="text-base font-medium">
									Employés
								</span>
							</div>
							<div className="w-full flex items-center justify-around">
								<Link
									to="/moniteurs"
									className="flex flex-col items-center"
								>
									<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#e0f2fe] font-bold">
										<span className="text-[#0284c7]">
											<p className="text-2xl">
												{monitors?.length || 0}
											</p>
										</span>
									</div>
									<span className="text-gray-600 italic font-medium">
										total
									</span>
								</Link>
								<Link
									to="/moniteurs?active=true"
									className="flex flex-col items-center"
								>
									<div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#ecfdf5] font-bold">
										<span className="text-[#34d399]">
											<p className="text-2xl">
												{
													monitors?.filter(
														(monitor) =>
															monitor?.availabilities?.some(
																(item) =>
																	item?.day?.toLocaleLowerCase() ===
																	todayInFrench.toLocaleLowerCase()
															)
													)?.length
												}
											</p>
										</span>
									</div>
									<span className="text-gray-600 italic font-medium">
										disponible(s)
									</span>
								</Link>
							</div>
						</div>
						<Link
							to="/forfait"
							className="h-28 w-full rounded-xl bg-white p-3 flex items-center gap-3 shadow-md hover:shadow-lg border border-gray-900/10"
						>
							<div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#fdf4ff]">
								<FaBuffer className="w-8 h-8 text-[#e879f9]" />
							</div>
							<div className="flex flex-col justify-center">
								<span className="text-2xl font-semibold text-[#555]">
									{forfaits?.length || 0}
								</span>
								<span className="text-[15px] text-gray-600 font-semibold">
									Nombre d'interventions
								</span>
							</div>
						</Link>
					</div>
					<div className="grid grid-cols-1 gap-5 my-8 md:px-8 place-items-center shadow-md hover:shadow-lg border border-gray-900/10 rounded-xl">
						<Planing />
					</div>
					<AvisDashboard
						satisfactionResponse={satisfactionResponse}
					/>
				</div>
			</div>
		</main>
	);
}

export default DashboardEntrp;
