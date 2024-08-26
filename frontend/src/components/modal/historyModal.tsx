import React, { useState } from "react";
import useSWR from "swr";

import { Modal, Button, Table, Popover, Space } from "antd"; // Import des composants Ant Design
import "antd/dist/reset.css"; // Import des styles Ant Design
import { format } from "date-fns";
import { fr } from "date-fns/locale"; // Import des paramètres régionaux français
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import { fetcher } from "../../axios";

const HistoryModal = ({ targetId }: { targetId: string }) => {
	const [isModalVisible, setIsModalVisible] = useState(false); // État pour contrôler la visibilité de la modal

	const { data: rendezvousData } = useSWR("/rendezvous/all", async (url) => {
		const rendezvousArray = (await fetcher.get(url)).data as any[];

		return rendezvousArray.filter(
			(rendezVous) => rendezVous.clientId === targetId
		);
	});
	const rendezvousTargeted = rendezvousData?.filter(
		(rendezVous) => rendezVous.clientId === targetId
	);
	const { data: avisNoteData } = useSWR("/rendezvous/all", async (url) => {
		const rendezvousArray = (await fetcher.get(url)).data as any[];
		return rendezvousArray.filter(
			(rendezVous) => rendezVous.userId === targetId
		);
	});

	// Fusionner les données en un seul tableau et formater les dates
	const combinedData = rendezvousTargeted?.map((rendezVous) => {
		// Trouver l'avis correspondant pour ce rendez-vous
		const avisNote = avisNoteData?.find(
			(avis) => avis.rendezVousId === rendezVous.id
		);
		return {
			...rendezVous,
			review: avisNote?.review || "N/A",
			rating: avisNote?.rating || "N/A",
			formattedDateTime: rendezVous.dateTime
				? format(
						new Date(rendezVous.dateTime),
						"dd MMMM yyyy à HH:mm",
						{
							locale: fr,
						}
				  )
				: "N/A",
			statusColor:
				new Date(rendezVous.dateTime) < new Date()
					? "gray"
					: rendezVous.isValid
					? rendezVous.isActivated
						? "green"
						: "red"
					: "orange", // Couleur en fonction de isActivated
			statusText:
				new Date(rendezVous.dateTime) < new Date()
					? "Expiré"
					: rendezVous.isValid
					? rendezVous.isActivated
						? "Activé"
						: "annulé"
					: "En attente",
		};
	});

	// Colonnes du tableau pour Ant Design
	const columns = [
		{ title: "Nom", dataIndex: ["client", "lastname"], key: "lastname" },
		{ title: "Prénom", dataIndex: ["client", "name"], key: "name" },
		{ title: "Adresse", dataIndex: ["client", "address"], key: "address" },
		{
			title: "Date du rendez-vous",
			dataIndex: "formattedDateTime",
			key: "formattedDateTime",
		},
		{
			title: "Intervenant",
			dataIndex: ["monitor", "name"],
			key: "monitor",
		},
		{
			title: "Intervention",
			dataIndex: ["forfait", "name"],
			key: "forfait",
		},
		{ title: "Durée", dataIndex: "duration", key: "duration" },
		{ title: "Note", dataIndex: "notegeneral", key: "notegeneral" },
		{ title: "Fichier", dataIndex: "files", key: "files" },
		{
			title: "Status",
			dataIndex: "statusColor",
			key: "statusColor",
			render: (statusColor: string, record) => (
				<Popover
					className="animate-pulse"
					content={<div>{record.statusText}</div>}
					trigger="hover"
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: "80px",
							textAlign: "center",
							cursor: "pointer",
						}}
					>
						<span
							style={{
								display: "inline-block",
								width: "12px",
								height: "12px",
								borderRadius: "50%",
								backgroundColor: statusColor,
								marginRight: "8px",
							}}
						/>
						<span style={{ color: statusColor }}></span>
					</div>
				</Popover>
			),
		},
	];

	return (
		<div className="">
			<button
				className="hover:text-blue-600"
				onClick={() => setIsModalVisible(true)} // Ouvre la modal
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
</svg>

			</button>

			<Modal
				title="Données des rendez-vous"
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)} // Ferme la modal
				footer={null} // Pas de bouton de pied de page
				width={1200} // Largeur de la modal
				bodyStyle={{ padding: "20px" }} // Style du corps de la modal
			>
				<Table
					columns={columns}
					dataSource={combinedData}
					rowKey={(record) => record.id} // Clé unique pour chaque ligne
					pagination={false} // Pas de pagination
					scroll={{ x: "max-content" }} // Permet le défilement horizontal
				/>
			</Modal>
		</div>
	);
};

export default HistoryModal;
