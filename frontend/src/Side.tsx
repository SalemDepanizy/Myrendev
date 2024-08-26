import React, { useEffect, useRef, useState } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import {
	FaBriefcase,
	FaBuffer,
	FaCalendarPlus,
	FaCar,
	FaCalendarDay,
	FaClipboardCheck,
	FaPowerOff,
	FaUser,
	FaWpforms,
} from "react-icons/fa";
import { RequireAuth, User } from "./components/auth/protect";
import Permit from "./lib/hooks/Permit";
import { useAuth } from "./lib/hooks/auth";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { fetcher } from "./axios";
import { Badge, List } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "./assets/logo.png";

interface MenuItem {
	name: string;
	link: string;
	icon: React.ReactNode;
	margin?: boolean;
	roles?: User["type"][];
	submenu?: SubMenuItem[];
}

interface SubMenuItem {
	name: string;
	link: string;
}

interface Notification {
	id: string;
	message: string;
	createdAt: Date;
	ownershipId: string;
	read: boolean;
	userId?: string;
}

const Side: React.FC = () => {
	const menus: MenuItem[] = [
		{
			name: "dashboard",
			link: "/",
			icon: <MdOutlineDashboard />,
			roles: ["ADMIN", "ENTREPRISE", "COMMERCIAL", "STUDENTS", "MONITOR"],
		},
		{
			name: "Super Admin",
			link: "/superadmin",
			icon: <RiAdminFill />,
			roles: ["ADMIN"],
		},
		{
			name: "Commercial",
			link: "/commercial",
			icon: <FiUsers />,
			margin: true,
			roles: ["COMMERCIAL"],
		},
		{
			name: "intervention",
			link: "/forfait",
			icon: <FaBuffer />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Clients",
			link: "/students",
			icon: <FaUser />,
			margin: true,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Employer",
			link: "/moniteurs",
			icon: <FaBriefcase />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Ajouter Véhicule",
			link: "/addcar",
			icon: <FaCar />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Ajouter Rendez-vous",
			link: "/addRendezvous",
			icon: <FaCalendarPlus />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Disponibilités",
			link: "/disponibilite",
			icon: <FaClipboardCheck />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Satisfication",
			link: "/SatisficationForm",
			icon: <FaWpforms />,
			roles: ["ENTREPRISE"],
		},
		{
			name: "Congé",
			link: "/Congé",
			icon: <FaCalendarDay />,
			roles: ["MONITOR"],
		},

		// {
		//   name: "Se déconnecter",
		//   link: "/login",
		//   icon: <FaPowerOff />,
		//   // roles: ["ADMIN", "ENTREPRISE", "COMMERCIAL"],
		// },
	];
	const handleMenuClick = (link: string) => {
		setOpen(!open);
	};

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768) {
				setOpen(false);
			} else {
				setOpen(false);
			}
		};

		const mobileMediaQuery = window.matchMedia("(max-width: 768px)");
		handleResize();
		mobileMediaQuery.addEventListener("change", handleResize);
		return () => {
			mobileMediaQuery.removeEventListener("change", handleResize);
		};
	}, []);
	const { user, isLoading, error, logout } = useAuth();
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [open, setOpen] = useState<boolean>(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	// useEffect(() => {
	//   pollNotifications();
	//   fetchNotifications();
	// }, []);
	// const axiosInstance = axios.create({
	//   baseURL: "/rendezvous/get/notifications", // Remplacez par votre URL de base
	//   timeout: 10000, // Timeout de 10 secondes
	// });

	// const fetchNotifications = async () => {
	//   setLoading(true);
	//   try {
	//     const response = await fetcher("/rendezvous/get/notifications");
	//     const notifications = response.data; // Adjust according to your API response structure

	//     // Sort notifications by createdAt in descending order
	//     notifications.sort(
	//       (a, b) =>
	//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	//     );

	//     setNotifications(notifications);
	//     setUnreadCount(
	//       notifications.filter((notification) => !notification.read).length
	//     );
	//   } catch (error) {
	//     console.error("Error fetching notifications:", error);
	//   } finally {
	//     setLoading(false);
	//   }
	// };

	// const pollNotifications = async () => {
	//   try {
	//     const notifications = await fetchNotifications();
	//     // console.log("Notifications récupérées :", notifications);

	//     // Mettre à jour votre interface avec les nouvelles données ici

	//     // Attendre avant de lancer la prochaine requête de polling
	//     setTimeout(pollNotifications, 5000); // Exemple : polling toutes les 5 secondes (5000 ms)
	//   } catch (error) {
	//     console.error("Erreur lors du polling des notifications :", error);
	//     // Gérer l'erreur ou la renvoyer pour un traitement ultérieur
	//   }
	// };

	const markAsRead = async (id: string) => {
		try {
			await fetcher(`/rendezvous/notifications/${id}/mark-as-read`, {
				method: "POST",
			});
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const handleClickNotification = async (notification: Notification) => {
		if (!notification.read) {
			await markAsRead(notification.id);
			setNotifications((prevNotifications) =>
				prevNotifications.map((n) =>
					n.id === notification.id ? { ...n, read: true } : n
				)
			);
			setUnreadCount((prevCount) => prevCount - 1);
		}
		setShowNotifications(false);
	};

	const handleNotificationIconClick = () => {
		setShowNotifications(!showNotifications);
		notifications.forEach((notification) => {
			if (!notification.read) {
				markAsRead(notification.id);
			}
		});
		setNotifications((prevNotifications) =>
			prevNotifications.map((n) => ({ ...n, read: true }))
		);
		setUnreadCount(0);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
				setDropdownOpen(false);
			}
			if (!event.target.closest("#notification-menu")) {
				setShowNotifications(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	console.log(user);

	return (
		<RequireAuth>
			<div className="fixed top- left- z-60 m-4 bg-blue-600">
				<HiMenuAlt3
					size={32}
					className={`cursor-pointer text-white ${
						open ? "hidden" : "block"
					} block lg:hidden`}
					onClick={() => setOpen(!open)}
				/>
			</div>
			<section className="flex gap-6 h-full">
				<div
					className={`${
						open ? "block" : "hidden"
					} lg:block absolute top-0 left-0 z-10 min-h-screen ${
						open
							? "w-64 overflow-y-auto bg-gradient-to-t from-blue-400 via-blue-500 to-blue-800"
							: "w-16 bg-blue-600"
					} duration-500 text-gray-100 px-4 `}
					style={{ maxHeight: "100vh" }}
					onMouseLeave={() => setOpen(false)}
				>
					<div className="flex items-center justify-center h-16">
						<HiMenuAlt3
							size={2}
							className="cursor-pointer text-white"
							onClick={() => setOpen(!open)}
						/>
					</div>
					<div className="flex flex-col items-center gap-3.5">
						{menus.map((menu, i) => (
							<Permit roles={menu.roles ?? []} key={i}>
								<Link
									to={menu.link}
									onClick={() => handleMenuClick(menu.link)}
									className={`group w-full flex ${
										open
											? "justify-start pl-5"
											: "justify-center"
									} py-2.5 items-center rounded-lg text-sm font-medium hover:bg-white hover:text-blue-700 transition-colors duration-200`}
									onMouseEnter={() => setOpen(true)}
								>
									<div className="text-xl mr-4">
										{menu.icon}
									</div>
									<span
										className={`${
											open ? "block" : "hidden"
										}`}
									>
										{menu.name}
									</span>
								</Link>
							</Permit>
						))}
						<div
							className={`group w-full flex ${
								open ? "justify-start pl-5" : "justify-center"
							} h-12 items-center cursor-pointer rounded-md text-sm font-medium hover:bg-blue-700 hover:text-white transition-colors duration-200`}
							onMouseEnter={() => setOpen(true)}
							onClick={() => logout()}
						>
							<div className="text-xl mr-4">
								<FaPowerOff />
							</div>
							<span className={`${open ? "block" : "hidden"}`}>
								Se déconnecter
							</span>
						</div>
					</div>
					{open && (
						<div className="flex justify-center mt-10">
							<img
								src={Logo}
								alt="Custom Logo"
								className="w-14 h-14"
							/>
						</div>
					)}
				</div>

				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-white h-full">
					<nav className="bg-blue-600 shadow">
						<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
							<div className="flex items-center justify-between h-16">
								<div className="flex-grow"></div>
								<div className="ml-3 relative flex items-center">
									{/* Notification icon and dropdown */}
									<div className="relative">
										<Badge
											count={unreadCount}
											offset={[10, 0]}
										>
											<FontAwesomeIcon
												icon={faBell}
												size="2x"
												onClick={
													handleNotificationIconClick
												}
												style={{
													cursor: "pointer",
													color: "white",
												}}
											/>
										</Badge>
										{showNotifications && (
											<div className="origin-top-right absolute right-0 mt-2 w-64 h-80 rounded-md shadow-lg py-2 bg-white ring-1 ring-black ring-opacity-5 overflow-y-auto custom-scrollbar">
												<List
													itemLayout="horizontal"
													dataSource={notifications}
													renderItem={(
														notification
													) => (
														<List.Item
															key={
																notification.id
															}
															className={`block px-4 py-2 text-sm text-gray-700 ${
																notification.read
																	? "opacity-50"
																	: ""
															}`}
															onClick={() =>
																handleClickNotification(
																	notification
																)
															}
														>
															<List.Item.Meta
																title={
																	notification.message
																}
																description={new Date(
																	notification.createdAt
																).toLocaleDateString()}
															/>
														</List.Item>
													)}
												/>
											</div>
										)}
									</div>
								</div>
								<div className="text-white ml-4">
									<span className="text-base font-medium flex">
										{user?.type === "ENTREPRISE"
											? user?.name_entreprise
											: `${user?.name} ${user?.lastname}`}
									</span>
									<span className="px-2">
										{user?.type === "ENTREPRISE"
											? user?.name_manager
											: user?.type === "MONITOR"
											? user?.name_entreprise
											: "Utilisateur"}
									</span>
								</div>
								<div className="ml-4 relative">
									<div>
										<button
											onClick={() =>
												setDropdownOpen(!isDropdownOpen)
											}
											className="bg-gray-500 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
											id="user-menu"
											aria-haspopup="true"
										>
											<span className="sr-only">
												Open user menu
											</span>
											{user?.image &&
											user?.image !== "" ? (
												<img
													src={`http://localhost:3000/api/images/${user?.image}`}
													alt="photo du client"
													className="h-10 w-10 rounded-full"
												/>
											) : (
												<span className="text-gray-50">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
														className="size-10"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
														/>
													</svg>
												</span>
											)}
										</button>
									</div>
									{isDropdownOpen && (
										<div
											ref={dropdownRef}
											className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
											role="menu"
											aria-orientation="vertical"
											aria-labelledby="user-menu"
										>
											<div className="flex flex-col items-center justify-center">
												<h2 className="text-xs font-medium text-gray-500">
													{user?.type === "ENTREPRISE"
														? `Nom : ${user?.name_manager}`
														: `Type: ${user?.type}`}
												</h2>
											</div>

											<Link
												to="/SettingsProfilePage" // Link to the Profile page
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												role="menuitem"
											>
												Profile
											</Link>
											<Link
												to="/generalSettings" // Link to the Profile page
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												role="menuitem"
											>
												Paramètres
											</Link>
											<Link
												to="/changePassword" // Link to the Change Password page
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												role="menuitem"
											>
												Mot de passe
											</Link>
											{/* Add the "Sign Out" option */}
											<button
												onClick={() => {
													// Handle the logout action here
													logout();
												}}
												className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
												role="menuitem"
											>
												Se déconnecter
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					</nav>
					<div className="flex-1 bg-white">
						<Outlet />
					</div>
				</main>
			</section>
		</RequireAuth>
	);
};

export default Side;
