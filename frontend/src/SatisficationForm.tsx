import { QuestionCircleOutlined } from "@ant-design/icons";
import {
	faBriefcase,
	faCalendarDay,
	faTimes,
	faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { IconButton, Stack } from "@mui/material";
import { Modal, Popconfirm, Rate, message } from "antd";
import { DeleteIcon } from "lucide-react";
import { useEffect, useState } from "react";
import RBModal from "react-bootstrap/Modal";
import { FaFileCirclePlus } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import SatisfactionEdit from "./SatisfactionEdit";
import { fetcher } from "./axios";
import AddSatisfaction from "./components/AddSatisfaction";
import Button from "./components/Button";
import { useAuth } from "./lib/hooks/auth";
import { User } from "./components/auth/protect";
import { faEye } from "@fortawesome/free-solid-svg-icons/faEye";
import { Monitor } from "./Moniteurs";
import Forfait from "./Forfait";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export interface SatisfactionData {
	data: {
		Satisfaction: Satisfaction[];
	};
}

type Satisfaction = {
	id?: string;
	title?: string;
	questions: question[];
	redirect_url?: string;
	redirect_grade?: number;
};

type QuestionNote = {
	questionId: string;
	text: string;
	note: number;
};

type question = {
	id: string;
	text?: string;
	rating?: number;
	satisfactionId: string;
};

export interface SatisfactionResponseData {
	data: SatisfactionResponse[];
}

type rendezvous = {
	id: string;
	dateTime?: any;
	forfait?: Forfait;
	monitor?: Monitor;
};

type SatisfactionResponse = {
	id: string;
	satisfactionId: string;
	comments: string;
	notegeneral: number;
	userId: string;
	rendezVous: rendezvous[];
	satisfaction: Satisfaction;
	user: User;
	QuestionNotes: QuestionNote[];
	createdAt?: string;
};

function SatisfactionForm() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const { id } = useParams();

	const {
		data: satisfactions,
		isLoading: loadingSatisfactions,
		error: errorSatisfactions,
		mutate: refresh,
	} = useSWR("/satisfaction/all", async (url) => {
		const response = await fetcher.get(url);

		const satisfaction = response.data as SatisfactionData;
		return satisfaction;
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

	const handleDelete = (id) => {
		fetcher
			.delete(`/satisfaction/delete/${id}`)
			.then((res) => {
				// if (res.data.success) {
				// message.success("Le formulaire supprimé avec succès.");
				window.location.reload();
				// } else {
				//   message.error("Une erreur s'est produite lors de la suppression.");
				// }
			})
			.catch((error) => {
				console.error("Delete operation failed:", error);
				message.error("Erreur lors de la suppression du formulaire.");
			});
	};

	const handleDelete1 = (id) => {
		fetcher
			.delete(`/satisfactionreponse/delete/${id}`)
			.then((res) => {
				// if (res.data.success) {
				// message.success("Le formulaire supprimé avec succès.");
				window.location.reload();
				// } else {
				//   message.error("Une erreur s'est produite lors de la suppression.");
				// }
			})
			.catch((error) => {
				console.error("Delete operation failed:", error);
				message.error("Erreur lors de la suppression du formulaire.");
			});
	};

	const [showEditSatisfactionModal, setShowEditSatisfactionModal] =
		useState(false);
	const [editSatisfactionId, setEditSatisfactionId] = useState(null);

	const openEditSatisfactionModal = (id) => {
		setEditSatisfactionId(id);
	};

	const closeEditSatisfactionModal = () => {
		setEditSatisfactionId(null);
	};

	const hasRating = satisfactions?.data?.Satisfaction?.some((satisfaction) =>
		satisfaction.questions.some((question) => question.rating !== null)
	);

	function shortenUrl(url, maxLength = 50) {
		if (url.length <= maxLength) return url;
		const partLength = Math.floor((maxLength - 3) / 2);
		return `${url.substring(0, partLength)}...${url.substring(
			url.length - partLength
		)}`;
	}

	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

	const openViewModal = () => {
		setIsViewModalOpen(true);
	};

	const closeViewModal = () => {
		setIsViewModalOpen(false);
	};

	return (
		<main className="flex-1 overflow-x-hidden overflow-y-auto bg-white h-full">
			<div className="container mx-auto py-6 sm:px-6">
				<div className="-mx-4 sm:-mx-6 sm:px-6 mt-4 overflow-x-auto">
					<div className="py-4 align-middle inline-block min-w-full sm:px-6">
						<div className="shadow-md overflow-hidden border border-gray-900/10 rounded-xl p-3">
							<h2 className=" mb-3 ml-4 mt-3 text-2xl font-medium text-gray-900 sm:text-2xl uppercase">
								Formulaire de satisfaction
							</h2>

							<h4 className="mb-6 ml-6 text-sm text-gray-500">
								Gérez depuis cette page les formulaires de
								satisfaction pour votre ou vos entreprises.
							</h4>
							{satisfactions?.data?.Satisfaction &&
								satisfactions?.data?.Satisfaction?.length <
									1 && (
									<div className="container mx-auto p-4">
										<div className="shadow-lg w-3/4 mx-auto">
											<table className="min-w-full divide-y divide-gray-">
												<thead>
													<tr>
														<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
															Nom de l'entreprise
														</th>

														{/* <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        address
                      </th> */}
														<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
															Formulaire de
															satisfaction
														</th>

														<th className="px-6 py-3 bg-gray-50"></th>
													</tr>
												</thead>
												<tbody>
													<tr key={user?.id}>
														<td className="px-6 py-4">
															{/* <div className="text-sm font-medium leading-5 text-gray-900">
                            {entreprise.name_entreprise}
                          </div> */}
															<div className="text-sm leading-5 text-black-00">
																{
																	user?.name_entreprise
																}
															</div>
															<h2 className="text-xs font-medium text-gray-500">
																{user?.type}
															</h2>
														</td>
														<td className="px-6 py-4">
															<PageModal
																satisfactionId={
																	id
																}
															/>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								)}
						</div>
					</div>

					<div className="flex justify-center p-6">
						<div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
							<table className="min-w-full table-auto">
								<thead>
									<tr>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Titre
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Questions
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Redirect URL
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Redirect Grade
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody>
									{Array.isArray(
										satisfactions?.data?.Satisfaction
									) &&
										satisfactions?.data?.Satisfaction?.map(
											(satisfaction) => (
												<tr key={satisfaction.id}>
													<td className="px-3 py-3 whitespace-nowrap">
														{satisfaction.title}
													</td>

													<td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
														{satisfaction.questions.map(
															(question) => (
																<div
																	key={
																		question.id
																	}
																>
																	{
																		question.text
																	}
																</div>
															)
														)}
													</td>

													<td className="text-justify px-5 py-5 text-xs">
														{shortenUrl(
															satisfaction.redirect_url
														)}
													</td>
													<td className="px-5 py-5 ">
														{
															satisfaction.redirect_grade
														}
													</td>

													<td className="px-5 py-5 ">
														<Stack
															direction="row"
															spacing={1}
														>
															<IconButton
																color="primary"
																aria-label="Modifier"
																onClick={() =>
																	openEditSatisfactionModal(
																		satisfaction.id
																	)
																}
															>
																<ModeEditIcon />
															</IconButton>

															<Popconfirm
																title="Supprimer"
																description={`Êtes-vous sûr de vouloir supprimer le formulaire ?`}
																onConfirm={() =>
																	handleDelete(
																		satisfaction.id
																	)
																}
																icon={
																	<QuestionCircleOutlined
																		style={{
																			color: "red",
																		}}
																	/>
																}
																okText={
																	<span className="text-red-500">
																		Oui
																	</span>
																}
																cancelText="Non"
															>
																<IconButton>
																	<DeleteIcon
																		size={
																			20
																		}
																	/>
																</IconButton>
															</Popconfirm>
														</Stack>

														<RBModal
															show={
																editSatisfactionId ===
																satisfaction.id
															}
															onHide={
																closeEditSatisfactionModal
															}
														>
															<RBModal.Header>
																<RBModal.Title>
																	Modifier la
																	Satisfaction
																</RBModal.Title>
																<FontAwesomeIcon
																	icon={
																		faTimes
																	}
																	className="cursor-pointer"
																	onClick={
																		closeEditSatisfactionModal
																	}
																/>
															</RBModal.Header>
															<RBModal.Body>
																<SatisfactionEdit
																	satisfactionId={
																		satisfaction.id
																	}
																	onClose={
																		closeEditSatisfactionModal
																	}
																/>
															</RBModal.Body>
														</RBModal>
													</td>
												</tr>
											)
										)}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex justify-center p-6">
						<h2 className="text-2xl font-semibold leading-tight">
							Retour Des Clients
						</h2>
					</div>
					<div className="flex justify-center p-6">
						<div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
							<table className="min-w-full table-auto">
								<thead>
									<tr>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Date de Soumission
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Client
										</th>
										{/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th> */}
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Note Moyene
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Commentaire
										</th>

										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Note
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Question
										</th>
										<th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Voir
										</th>
									</tr>
								</thead>
								<tbody>
									{Array.isArray(
										satisfactionResponse?.data
									) &&
										satisfactionResponse?.data?.map(
											(response) => (
												<tr key={response.id}>
													<td className="px-3 py-3 whitespace-nowrap">
														{response.createdAt &&
															format(
																parseISO(
																	response.createdAt
																),
																"PP à HH:mm",
																{
																	locale: fr,
																}
															)}
													</td>
													<td className="px-3 py-3 whitespace-nowrap">
														{response?.user?.name}
													</td>
													{/* <td className="px-3 py-3 whitespace-nowrap">
                          {response?.user?.email}
                        </td> */}

													<td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
														<div className="flex items-center space-x-2">
															<Rate
																allowHalf
																value={
																	response?.notegeneral
																}
															/>
															{/* <span>
                              {response?.notegeneral % 1 === 0
                                ? response?.notegeneral
                                : response?.notegeneral.toFixed(1)}
                            </span> */}
															<span>
																{response?.notegeneral.toFixed(
																	1
																)}
															</span>
														</div>
													</td>

													<td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
														{response?.comments}
													</td>

													<td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
														{response.QuestionNotes.map(
															(qn, index) => (
																<div
																	key={index}
																	className="lex items-center space-x-2"
																>
																	<Rate
																		allowHalf
																		value={
																			qn.note
																		}
																	/>
																	<span>
																		{qn.note.toFixed(
																			1
																		)}
																	</span>
																</div>
															)
														)}
													</td>

													{Array.isArray(
														satisfactions?.data
															?.Satisfaction
													) &&
														satisfactions?.data?.Satisfaction?.map(
															(satisfaction) => (
																<tr
																	key={
																		satisfaction.id
																	}
																>
																	<td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
																		{satisfaction.questions.map(
																			(
																				question
																			) => (
																				<div
																					key={
																						question.id
																					}
																				>
																					{
																						question.text
																					}
																				</div>
																			)
																		)}
																	</td>
																</tr>
															)
														)}

													<td className="px-3 py-3 text-gray-500 dark:text-gray-400">
														{/* <span className="relative inline-block px-3 py-1 font-semibold text-blue-500 leading-tight">
                            
                          </span> */}

														<Stack
															direction="row"
															spacing={1}
														>
															<FontAwesomeIcon
																icon={faEye}
																style={{
																	cursor: "pointer",
																	padding:
																		"10px",
																}}
																onClick={
																	openViewModal
																}
															/>

															<Popconfirm
																title="Supprimer"
																description={`Êtes-vous sûr de vouloir supprimer le retour de client ?`}
																onConfirm={() =>
																	handleDelete1(
																		response.id
																	)
																}
																icon={
																	<QuestionCircleOutlined
																		style={{
																			color: "red",
																		}}
																	/>
																}
																okText={
																	<span className="text-red-500">
																		Oui
																	</span>
																}
																cancelText="Non"
															>
																<IconButton>
																	<DeleteIcon
																		size={
																			20
																		}
																	/>
																</IconButton>
															</Popconfirm>
														</Stack>
													</td>
												</tr>
											)
										)}
								</tbody>
							</table>

							<Modal
								title={
									<span
										style={{
											fontSize: "1.25rem",
											fontWeight: "bold",
										}}
									>
										Détails Du Retour
									</span>
								}
								open={isViewModalOpen}
								onCancel={closeViewModal}
								// footer={[
								//   <Button
								//     key="close"
								//     onClick={closeViewModal}
								//     style={{
								//       backgroundColor: "#4CAF50",
								//       color: "white",
								//       borderRadius: "5px",
								//     }}
								//   >
								//     Fermer
								//   </Button>,
								// ]}
								footer={null}
								style={{ top: 20 }}
							>
								{Array.isArray(satisfactionResponse?.data) &&
									satisfactionResponse?.data.map(
										(response) => (
											<tr key={response.id}>
												<div className="flex items-center gap-2">
													<FontAwesomeIcon
														icon={faBriefcase}
														className="mr-2 text-green-500"
													/>
													<span className="font-semibold">
														Intervention :{" "}
													</span>
													<span>
														{
															response.rendezVous
																?.forfait?.name
														}
													</span>
												</div>

												<div className="flex items-center gap-2">
													<FontAwesomeIcon
														icon={faUserTie}
														className="mr-2 text-red-500"
													/>
													<span className="font-semibold">
														Employé :{" "}
													</span>
													<span>
														{
															response.rendezVous
																.monitor?.name
														}
													</span>
												</div>

												<div className="flex items-center gap-2">
													<FontAwesomeIcon
														icon={faCalendarDay}
														className="mr-2 text-blue-500"
													/>
													<span className="font-semibold">
														La Date D'intervention :{" "}
													</span>
													<span>
														{format(
															parseISO(
																response
																	.rendezVous
																	.dateTime
															),
															"dd MMM yyyy",
															{ locale: fr }
														)}
													</span>
												</div>
											</tr>
										)
									)}
							</Modal>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

function PageModal({ satisfactionId }) {
	const [open, setOpen] = useState(false);
	const [isFormCreated, setIsFormCreated] = useState(true);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isFormUpdate, setIsFormUpdate] = useState(false);
	const [modalData, setModalData] = useState<SatisfactionData | null>(null);

	const onSatisfactionCreated = () => {
		setOpen(false); // Fermer le modal après la création du formulaire
		setIsFormCreated(true); // Mettez à jour l'état pour indiquer que le formulaire est créé
	};

	const checkFormExists = async () => {
		try {
			const response = await fetch(`/satisfaction/${satisfactionId}`);
			if (response.ok) {
				setIsFormCreated(true); // Le formulaire existe
				const data = await response.json();
				setModalData(data); // Stockez les données du formulaire pour une utilisation ultérieure
			} else {
				setIsFormCreated(false); // Le formulaire n'existe pas
			}
		} catch (error) {
			console.error(
				"Erreur lors de la vérification de l'existence du formulaire:",
				error
			);
		}
	};

	useEffect(() => {
		if (satisfactionId) {
			checkFormExists();
		}
	}, [satisfactionId]);

	return (
		<div>
			<Button onClick={() => setOpen(true)} className="flex items-center">
				<FaFileCirclePlus className="text-xl leading-none mr-2" />
				<span>Créer le formulaire</span>
			</Button>

			<Modal open={open} onCancel={() => setOpen(false)} footer={null}>
				<AddSatisfaction
					onSatisfactionCreated={onSatisfactionCreated}
				/>
			</Modal>
		</div>
	);
}

export default SatisfactionForm;
