import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { fetcher } from "./axios";
import useSWR from "swr";
import { FaBriefcase, FaBuffer } from "react-icons/fa";
import { IconButton, Stack } from "@mui/material";
import { DeleteIcon } from "lucide-react";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { message, Popconfirm } from "antd";
import Button from "./components/Button";
import Modal from "react-bootstrap/Modal";
import AddForfait from "./AddForfait";
import ForfaitEdit from "./ForfaitEdit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./lib/hooks/auth";
import { User } from "./components/auth/protect";

const confirm = (e) => {
	// console.log(e);
	message.success("Click on Yes");
};

const cancel = (e) => {
	// console.log(e);
	message.error("Click on No");
};
interface Forfait {
	id: string;
	name: string;
	heure: string;
	selectMorePeople: boolean;
	numberOfPeople: number;
	monitorId: string;
	createdAt?: string;
	monitor?: any;
}
interface Monitor {
	id: number;
	name: string;
	lastname: string;
}
function Forfait() {
	const [searchQuery, setSearchQuery] = useState("");
	//const [data, setData] = useState<Forfait[]>([]);

	// const {
	//   data: forfaits,
	//   isLoading: loadingForfaits,
	//   error: errorForfaits,
	// } = useSWR(
	//   "/forfait/all",
	//   async (url) => {
	//     const forfait = (await fetcher.get(url)).data as Forfait[];
	//     return Object.keys(forfait).reduce((acc, key) => {
	//       acc.push(forfait[key]);
	//       return acc;
	//     }, [] as Forfait[]);
	//   },
	//   { revalidateOnFocus: true }
	// ); // Add revalidateOnFocus to refresh the data when the page gains focus

	// console.log("errors", forfaits);

	const [showAddInterventionModal, setShowAddInterventionModal] =
		useState(false);

	const openAddInterventionModal = () => {
		setShowAddInterventionModal(true);
	};

	const closeAddInterventionModal = () => {
		setShowAddInterventionModal(false);
	};

	const {
		data: forfaits,
		isLoading: loadingForfaits,
		error: errorForfaits,
		mutate: refresh,
	} = useSWR(
		"/forfait/all",
		async (url) => {
			const forfait = (await fetcher.get(url)).data as Forfait[];
			// console.log(forfait);
			return forfait;
		},
		{ revalidateOnFocus: true }
	); // Add revalidateOnFocus to refresh the data when the page gains focus

	const filteredForfaits = forfaits
		? forfaits.filter((forfait) => {
				// const fullName = `${monitor.name} ${monitor.lastname}`;

				return (
					// fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
					forfait.name
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					forfait.monitor?.name
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					forfait.monitor?.lastname
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
		  })
		: [];

	const handleDelete = (id) => {
		fetcher.delete(`/forfait/delete/${id}`).then((res) => {
			if (res.data.success) {
				message.success("Forfait supprimé avec succès.");
				refresh();
			} else {
				alert("Error");
			}
		});
		// .catch((err) => console.log(err));
	};

	const forfaitCount = forfaits ? forfaits.length : 0;

	const [showEditInterventionModal, setShowEditInterventionModal] =
		useState(false);
	const [editInterventionId, setEditInterventionId] = useState(null);

	const openEditInterventionModal = (id) => {
		setEditInterventionId(id);
	};

	const closeEditInterventionModal = () => {
		setEditInterventionId(null);
	};

	const {
		data: monitors,
		isLoading: loadingMonitors,
		error: errorMonitors,
	} = useSWR("/users/get/monitor", async (url) => {
		return (await fetcher.get(url)).data as Monitor[];
	});

	function formatDate(dateString) {
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, "0")}/${(
			date.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")}/${date.getFullYear()}`;
	}

	return (
		<div className="container px-6 py-8 mx-auto">
			<h3 className="text-3xl font-medium text-gray-700 mb-8">
				Gestion des Interventions
			</h3>
			<div className="flex items-center p-6 bg-white rounded-3xl shadow-md hover:shadow-lg w-96 border border-gray-900/10">
				<div className="p-3 bg-pink-600 bg-opacity-75 rounded-full">
					<FaBuffer className="w-8 h-8 text-white" />
				</div>

				<div className="mx-5">
					<h4 className="text-2xl font-semibold text-gray-700">
						{forfaitCount}
					</h4>
					<span className="text-gray-500">
						Nombre d'interventions
					</span>
				</div>
			</div>

			<div className="container mx-auto py-6 sm:px-6">
				<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
					<div className="flex justify-between">
						<h2 className="text-2xl font-semibold leading-tight">
							Liste Des Interventions
						</h2>
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-between">
								<div className="flex bg-gray-50 items-center p-2 gap-3 rounded-lg border border-gray-900/10">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 text-gray-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										/>
									</svg>
									<input
										className="bg-gray-50 outline-none block"
										type="text"
										name="search"
										placeholder="Recherche..."
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
									/>
								</div>
							</div>
							<Button onClick={openAddInterventionModal}>
								Ajouter une Intervention
							</Button>
						</div>
					</div>
				</div>

				<Modal
					show={showAddInterventionModal}
					onHide={closeAddInterventionModal}
					size="lg"
				>
					<Modal.Header>
						<Modal.Title>Ajouter une Intervention</Modal.Title>
						<FontAwesomeIcon
							icon={faTimes}
							className="cursor-pointer"
							onClick={closeAddInterventionModal}
						/>
					</Modal.Header>
					<Modal.Body>
						<AddForfait
							onForfaitCreated={() => {
								closeAddInterventionModal();
								refresh();
							}}
						/>
					</Modal.Body>
				</Modal>

				<div className="shadow-sm border rounded-lg overflow-x-auto mt-3">
					<table className="w-full table-auto text-sm text-left">
						<thead className="bg-gray-50 text-gray-600 font-medium border-b">
							<tr>
								<th className="py-3 px-6">Nom</th>
								<th className="py-3 px-6">Date de création</th>
								<th className="py-3 px-6">N° d'Heure</th>
								<th className="py-3 px-6">Employé</th>
								<th className="py-3 px-6">N° de personnes</th>
								<th className="py-3 px-6">Actions</th>
							</tr>
						</thead>
						<tbody className="text-gray-600 divide-y">
							{filteredForfaits?.map((forfait, idx) => {
								const monitor = monitors?.find(
									(m) => m.id.toString() === forfait.monitorId
								);
								return (
									<tr key={idx}>
										<td className="px-6 py-4 whitespace-nowrap">
											{forfait?.name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{forfait.createdAt
												? formatDate(forfait.createdAt)
												: "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{forfait?.heure}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{" "}
											{monitor
												? `${monitor?.name} ${monitor?.lastname}`
												: "Non Séléctionné"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{forfait?.numberOfPeople}
										</td>
										<td className="px-6 whitespace-nowrap">
											<button
												onClick={() =>
													openEditInterventionModal(
														forfait.id
													)
												}
												className="py-2 px-3 font-medium text-indigo-600 hover:text-indigo-500 duration-150 hover:bg-gray-50 rounded-lg"
											>
												modifier
											</button>
											<Popconfirm
												title="Supprimer"
												description="Êtes-vous sûr de vouloir le supprimer ?"
												onConfirm={() =>
													handleDelete(
														forfait.id.toString()
													)
												}
												okText={<span>Oui</span>}
												okType="danger"
												cancelText="Non"
											>
												<button className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg">
													supprimer
												</button>
											</Popconfirm>
											<Modal
												show={
													editInterventionId ===
													forfait.id
												}
												onHide={
													closeEditInterventionModal
												}
											>
												<Modal.Header>
													<Modal.Title>
														Modifier une
														Intervention
													</Modal.Title>
													<FontAwesomeIcon
														icon={faTimes}
														className="cursor-pointer"
														onClick={
															closeEditInterventionModal
														}
													/>
												</Modal.Header>
												<Modal.Body>
													{/* Pass the forfait.id as a prop */}
													<ForfaitEdit
														forfaitId={forfait.id}
														onClose={
															closeEditInterventionModal
														}
													/>
												</Modal.Body>
											</Modal>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default Forfait;
