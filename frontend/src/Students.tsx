import { useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { fetcher } from "./axios";
import useSWR from "swr";
import { FaUsers } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faEnvelope,
	faEye,
	faTimes,
	faTrash,
} from "@fortawesome/free-solid-svg-icons"; // Import the eye icon
import Modal from "react-bootstrap/Modal";
import Addstudents from "./Addstudents";
import AddExistingStudents from "./existingStudent";
import Button from "./components/Button";
import StudentsEdit from "./StudentsEdit";
import { Popconfirm, message } from "antd";
import Email from "./email";
import HistoryModal from "./components/modal/historyModal";
import { Modal as ModalAntd } from "antd";

export interface Student {
	id: string;
	name: string;
	lastname: string;
	phone: string;
	phone2: string;
	phone3: string;
	email: string;
	address: string;
	forfait?: {
		id: string;
		name: string;
	};
	heure: string;
	heuresup: string;
	image: string;
	ville: string;
	codePostal: string;
	active: boolean;
	createdAt?: string;
	userType?: string;
	companyName?: string;
	etage?: string;
	code_acces?: string;
	code_acces_supplementaire?: string;
	interphone?: string;
	creatorId?: string;
	creator?: any;
}

function Students() {
	const [showModal, setShowModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(
		null
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const studentsPerPage = 5;

	const [showAddStudentModal, setShowAddStudentModal] = useState(false);
	const [showExistingStudentModal, setShowExistingStudentModal] =
		useState(false);
	const [showEmailModal, setShowEmailModal] = useState(false);

	const [sortAlphabeticallyAz, setSortAlphabeticallyAz] = useState(false);
	const [sortAlphabeticallyZa, setSortAlphabeticallyZa] = useState(false);
	const [sortByCreationDate, setSortByCreationDate] = useState(false);

	const openAddStudentModal = () => {
		setShowAddStudentModal(true);
	};

	const openAddExistingStudentModal = () => {
		setShowExistingStudentModal(true);
	};

	const closeAddStudentModal = () => {
		setShowAddStudentModal(false);
	};
	const closeAddExistingStudentModal = () => {
		setShowExistingStudentModal(false);
	};

	const closeEmailModal = () => {
		setShowEmailModal(false);
	};
	const openEmailModal = (student) => {
		setSelectedStudent(student);
		setShowEmailModal(true);
	};

	const [isDeleted, setIsDeleted] = useState(false);

	const {
		data: students,
		isLoading: loadingStudents,
		error: errorStudents,
		mutate: refresh,
	} = useSWR("/users/get/student", async (url) => {
		const students = (await fetcher.get(url)).data as Student[];
		return students;
	});

	const {
		data: ownership,
		isLoading: loadingownership,
		error: errorownership,
	} = useSWR("/users/get/ownership", async (url) => {
		return (await fetcher.get(url)).data as any[];
	});

	const handleDelete = (id) => {
		fetcher.delete(`/users/delete/${id}`).then((res) => {
			if (res.data.success) {
				setIsDeleted(true);
				message.success("Client supprimé avec succès.");
				closeModal();
				refresh();
			} else {
				message.error("Erreur lors de la suppression.");
			}
		});
	};

	const handleSortByAlphabetAz = () => {
		setSortAlphabeticallyZa(false);
		setSortAlphabeticallyAz(!sortAlphabeticallyAz);
	};
	const handleSortByAlphabetZa = () => {
		setSortAlphabeticallyAz(false);
		setSortAlphabeticallyZa(!sortAlphabeticallyZa);
	};
	const handleSorByDate = () => {
		setSortByCreationDate(!sortByCreationDate);
	};

	const openModal = (student) => {
		setSelectedStudent(student);
		setShowModal(true);
	};

	const closeModal = () => {
		setSelectedStudent(null);
		setShowModal(false);

		if (isDeleted) {
			setIsDeleted(false);
		}
	};

	const studentCount = students ? students.length : 0;

	// Function to filter students based on the search query
	const filteredStudents = students
		? students.filter((student) => {
				const fullName = `${student.name} ${student.lastname}`;
				return (
					fullName
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					student.email
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					student.address
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					student.phone
						.replace(/\s+/g, "")
						.includes(searchQuery.replace(/\s+/g, "").trim()) ||
					student.codePostal
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					student.ville
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
		  })
		: [];

	const indexOfLastStudent = currentPage * studentsPerPage;
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
	const currentStudents = filteredStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent
	);

	const sortCurrentMonitors = () => {
		let sortedStudents = [...currentStudents]; // Copier l'original pour éviter de le modifier directement.

		// Tri par ordre alphabétique
		if (sortAlphabeticallyAz) {
			console.log("Sorting A-Z:", sortAlphabeticallyAz);
			sortedStudents.sort((a, b) => {
				if (a.name && b.name) {
					return a.name.localeCompare(b.name);
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		} else if (sortAlphabeticallyZa) {
			console.log("Sorting Z-A:", sortAlphabeticallyZa);
			sortedStudents.sort((a, b) => {
				if (a.name && b.name) {
					return b.name.localeCompare(a.name);
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		}

		// Tri par date de création
		if (sortByCreationDate) {
			console.log("Sorting by creation date:", sortByCreationDate);
			sortedStudents.sort((a, b) => {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return dateA - dateB;
			});
		}

		// Tri combiné (alphabetique puis par date)
		if (sortAlphabeticallyAz && sortByCreationDate) {
			console.log(
				"Sorting A-Z and by creation date:",
				sortAlphabeticallyAz,
				sortByCreationDate
			);
			sortedStudents.sort((a, b) => {
				if (a.name && b.name) {
					const nameComparison = a.name.localeCompare(b.name);
					if (nameComparison !== 0) {
						return nameComparison;
					} else {
						const dateA = a.createdAt
							? new Date(a.createdAt).getTime()
							: 0;
						const dateB = b.createdAt
							? new Date(b.createdAt).getTime()
							: 0;
						return dateA - dateB;
					}
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		} else if (sortAlphabeticallyZa && sortByCreationDate) {
			console.log(
				"Sorting Z-A and by creation date:",
				sortAlphabeticallyZa,
				sortByCreationDate
			);
			sortedStudents.sort((a, b) => {
				if (a.name && b.name) {
					const nameComparison = b.name.localeCompare(a.name);
					if (nameComparison !== 0) {
						return nameComparison;
					} else {
						const dateA = a.createdAt
							? new Date(a.createdAt).getTime()
							: 0;
						const dateB = b.createdAt
							? new Date(b.createdAt).getTime()
							: 0;
						return dateA - dateB;
					}
				} else {
					console.error("Missing name property on an element:", a, b);
					return 0;
				}
			});
		}

		return sortedStudents;
	};
	const sortedStudents = sortCurrentMonitors();

	const handleNextClick = () => {
		if (
			currentPage < Math.ceil(filteredStudents.length / studentsPerPage)
		) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevClick = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const [editStudentId, setEditStudentId] = useState(null);

	const openEditStudentModal = (id) => {
		setEditStudentId(id);
	};

	const closeEditStudentModal = () => {
		setEditStudentId(null);
	};

	const closeModalAndRefresh = () => {
		setShowEmailModal(false);
		refresh();
	};

	const handleToggleActive = async (id, active) => {
		try {
			// Assuming your API expects a PATCH request to update the student's status
			const response = await fetcher.patch(`/users/update-status/${id}`, {
				active,
			});

			if (response.status === 200) {
				message.success(
					`Client ${active ? "activé" : "désactivé"} avec succès`
				);
				// Optionally, refresh the list of students to reflect the change
				refresh();
			} else {
				throw new Error("Failed to update student status");
			}
		} catch (error) {
			message.error("Error updating student status");
		}
	};

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
				Gestion des Clients
			</h3>
			<div className="flex items-center p-6 bg-white rounded-3xl shadow-md hover:shadow-lg w-96 border border-gray-900/10">
				<div className="p-3 bg-blue-600 bg-opacity-75 rounded-full">
					<FaUsers className="w-8 h-8 text-white" />
				</div>

				<div className="mx-5">
					<h4 className="text-2xl font-semibold text-gray-700">
						{studentCount}
					</h4>
					<span className="text-gray-500">Total Clients</span>
				</div>
			</div>
			<div className="mt-4">
				<div className="container mx-auto py-6 sm:px-6">
					<div className="px-4 py-4 -mx-4 sm:-mx-6 sm:px-6">
						<div className="flex justify-between">
							<h2 className="text-2xl font-semibold leading-tight">
								Liste Des Clients
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
								<Button onClick={openAddStudentModal}>
									Ajouter un client
								</Button>
							</div>
						</div>
					</div>
					<ModalAntd
						title={
							<span className="text-2xl font-bold text-gray-800">
								Ajouter un client
							</span>
						}
						open={showAddStudentModal}
						onCancel={closeAddStudentModal}
						footer={[]}
						width={750}
					>
						<Addstudents
							onUserCreated={() => {
								closeAddStudentModal();
								refresh();
							}}
							closeIt={() => {
								closeAddStudentModal();
							}}
						/>
					</ModalAntd>

					<Modal
						show={showExistingStudentModal}
						onHide={closeAddExistingStudentModal}
					>
						<Modal.Header>
							<Modal.Title>
								Ajouter un clients déja existant
							</Modal.Title>
							<FontAwesomeIcon
								icon={faTimes}
								className="cursor-pointer"
								onClick={closeAddExistingStudentModal}
							/>
						</Modal.Header>
						<Modal.Body>
							<AddExistingStudents
								onUserCreated={() => {
									closeAddExistingStudentModal();
									refresh();
								}}
							/>
						</Modal.Body>
					</Modal>

					<Modal show={showEmailModal} onHide={closeEmailModal}>
						<Modal.Body>
							<div className="flex">
								<Email
									email={
										selectedStudent && selectedStudent.email
									}
									student={selectedStudent}
									onEmailSent={closeModalAndRefresh} // Pass the function as a prop
								/>
								<div className="w-auto">
									<FontAwesomeIcon
										icon={faTimes}
										className="cursor-pointer w-15 "
										onClick={closeEmailModal}
									/>
								</div>
							</div>
						</Modal.Body>
					</Modal>

					<div className="mt-6 shadow-sm border rounded-lg overflow-x-auto">
						<table className="w-full table-auto text-sm text-left">
							<thead className="bg-gray-50 text-gray-600 font-medium border-b">
								<tr>
									<th className="py-3 px-6">Client</th>
									<th className="py-3 px-6">Type</th>
									<th className="py-3 px-6">
										Date de création
									</th>
									<th className="py-3 px-6">Voir</th>
									<th className="py-3 px-6">Email</th>
									<th className="py-3 px-6">historique</th>
								</tr>
							</thead>
							<tbody className="text-gray-600 divide-y">
								{sortedStudents?.map((student, idx) => (
									<tr key={idx}>
										<td className="flex flex-col items-center w-28 gap-x-3 py-3 px-6 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 w-10 h-10">
													{student?.image &&
													student?.image !== "" ? (
														<img
															src={`http://localhost:3000/api/images/${student?.image}`}
															alt="photo du client"
															className="students_image"
														/>
													) : (
														<span className="text-gray-600">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
																strokeWidth={
																	1.5
																}
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
												</div>
											</div>
											<div className="ml-3">
												<p className="text-gray-900 whitespace-no-wrap">
													{student?.name}{" "}
													{student?.lastname}
												</p>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{student?.userType}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{student?.createdAt
												? formatDate(student?.createdAt)
												: "N/A"}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												onClick={() =>
													openModal(student)
												}
												className="px-3 py-1 font-semibold text-blue-500 leading-tight cursor-pointer"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													className="size-6"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
													/>
												</svg>
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												onClick={() =>
													openEmailModal(student)
												}
												className="px-3 py-1 font-semibold text-blue-500 leading-tight cursor-pointer"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													strokeWidth={1.5}
													stroke="currentColor"
													className="size-6"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
													/>
												</svg>
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="px-3 py-1 font-semibold text-blue-500 leading-tight cursor-pointer">
												<HistoryModal
													targetId={student?.id}
												/>
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<div className="px-5 py-3 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
							<span className="text-xs xs:text-sm text-gray-900">
								Affichage {indexOfFirstStudent + 1} à{" "}
								{Math.min(indexOfLastStudent, studentCount)} de{" "}
								{studentCount} Entrées
							</span>
							<div className="inline-flex mt-3 xs:mt-0">
								<button
									className="px-2.5 py-1 border text-sm rounded-lg duration-150 hover:bg-gray-50"
									onClick={handlePrevClick}
								>
									Précedent
								</button>
								&nbsp; &nbsp;
								<button
									className="px-2.5 py-1 border text-sm rounded-lg duration-150 hover:bg-gray-50"
									onClick={handleNextClick}
								>
									Suivant
								</button>
							</div>
						</div>
					</div>
				</div>

				<Modal show={showModal} onHide={closeModal}>
					<Modal.Body>
						<div className="flex gap-4">
							<div className="mt-2">
								{selectedStudent && (
									<div>
										<span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
										<div className="sm:flex sm:justify-between sm:gap-4">
											<div>
												<h3 className="text-lg font-bold text-gray-900 sm:text-xl">
													{selectedStudent.name}{" "}
													{selectedStudent.lastname}
												</h3>
												<p className="mt-1 text-xs font-medium text-gray-600">
													Email:{" "}
													{selectedStudent.email}
												</p>
											</div>
											<div className="hidden sm:block sm:shrink-0">
												<img
													alt={selectedStudent.name}
													src={`http://localhost:3000/api/images/${selectedStudent.image}`}
													className="h-16 w-16 rounded-lg object-cover shadow-sm"
												/>
											</div>
										</div>
										<div className="mt-4 space-y-2">
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Nom:
												</span>{" "}
												{selectedStudent.name}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Prénom:
												</span>{" "}
												{selectedStudent.lastname}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Type:
												</span>{" "}
												{selectedStudent.userType}
											</p>
											{selectedStudent.userType ===
												"Professionnel" && (
												<p className="max-w-[40ch] text-sm">
													<span className="font-bold text-black">
														Nom de l'entreprise:
													</span>{" "}
													{
														selectedStudent.companyName
													}
												</p>
											)}
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Numéro Tél:
												</span>{" "}
												<a
													href={`tel:+33${selectedStudent.phone}`}
												>
													{selectedStudent.phone}
												</a>
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Numéro Tél 2:
												</span>{" "}
												<a
													href={`tel:+33${selectedStudent.phone2}`}
												>
													{selectedStudent.phone2}
												</a>
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Numéro Tél 3:
												</span>{" "}
												<a
													href={`tel:+33${selectedStudent.phone3}`}
												>
													{selectedStudent.phone3}
												</a>
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Email:
												</span>{" "}
												<a
													href={`mailto:${selectedStudent.email}`}
												>
													{selectedStudent.email}
												</a>
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Address:
												</span>{" "}
												{selectedStudent.address}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Ville:
												</span>{" "}
												{selectedStudent.ville}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Code postal:{" "}
												</span>{" "}
												{selectedStudent.codePostal}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Étage:{" "}
												</span>{" "}
												{selectedStudent.etage}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Code Accée:{" "}
												</span>{" "}
												{selectedStudent.code_acces}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Code Accée Supplementaire:{" "}
												</span>{" "}
												{
													selectedStudent.code_acces_supplementaire
												}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Interphone:{" "}
												</span>{" "}
												{selectedStudent.interphone}
											</p>
											<p className="max-w-[40ch] text-sm">
												<span className="font-bold text-black">
													Créateur du compte:
												</span>{" "}
												{selectedStudent?.creator?.name}{" "}
												{
													selectedStudent?.creator
														?.lastname
												}
											</p>
										</div>
										<div className="mt-4">
											<div className="flex justify-center gap-4">
												<Button
													onClick={() =>
														openEditStudentModal(
															selectedStudent.id
														)
													}
												>
													<FontAwesomeIcon
														icon={faEdit}
													/>{" "}
													Modifier
												</Button>
												<Button
													onClick={() =>
														openEmailModal(
															selectedStudent
														)
													}
												>
													<FontAwesomeIcon
														icon={faEnvelope}
													/>{" "}
													Contacter
												</Button>
												<Popconfirm
													title="Supprimer"
													description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
													onConfirm={() =>
														handleDelete(
															selectedStudent.id
														)
													}
													okText="Oui"
													okType="danger"
													icon={
														<QuestionCircleOutlined
															style={{
																color: "red",
															}}
														/>
													}
													cancelText="Non"
												>
													<button className="text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg flex items-center gap-2">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="size-5"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
															/>
														</svg>
														Supprimer
													</button>
												</Popconfirm>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</Modal.Body>
				</Modal>

				<Modal
					show={editStudentId === selectedStudent?.id}
					onHide={closeEditStudentModal}
					size="lg"
				>
					<Modal.Header>
						<Modal.Title>Modifier un client</Modal.Title>
						<FontAwesomeIcon
							icon={faTimes}
							className="cursor-pointer"
							onClick={closeEditStudentModal}
						/>
					</Modal.Header>
					<Modal.Body>
						{selectedStudent && (
							<StudentsEdit
								studentId={selectedStudent.id}
								onClose={closeEditStudentModal}
							/>
						)}
					</Modal.Body>
				</Modal>
			</div>
		</div>
	);
}

export default Students;

{
	/* <div>
						<div>
							<div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
								<div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
									<div className="flex justify-evenly">
										<span className="text-gray-700 font-semibold uppercase px-2">
											filtre :
										</span>{" "}
										<svg
											id="Alphabetical_Sorting_24"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											// xmlns:xlink="http://www.w3.org/1999/xlink"
											className={`cursor-pointer`}
											onClick={handleSortByAlphabetAz}
											fill={
												sortAlphabeticallyAz
													? "blue"
													: "#000000"
											}
										>
											<rect
												width="24"
												height="24"
												stroke="none"
												fill="#ffffff"
												opacity="0"
											/>
											<g transform="matrix(0.77 0 0 0.77 12 12)">
												<path
													className="stroke: none; stroke-width: 1; stroke-dasharray: none; strokeLinecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter;
                           stroke-miterlimit: 4; fill: rgb(0,0,0); fillRule: nonzero; opacity: 1;"
													transform=" translate(-13.08, -13)"
													d="M 3.625 0 C 3.550781 0 3.488281 0.0546875 3.46875 0.125 L 0.21875 10.78125 C 0.203125 10.832031 0.21875 10.898438 0.25 10.9375 C 0.28125 10.980469 0.324219 11 0.375 11 L 2.875 11 C 2.949219 11 3.011719 10.945313 3.03125 10.875 L 3.75 8.25 L 6.5625 8.25 L 7.34375 10.875 C 7.367188 10.945313 7.425781 11 7.5 11 L 10.125 11 C 10.214844 11 10.28125 10.933594 10.28125 10.84375 C 10.28125 10.808594 10.269531 10.777344 10.25 10.75 L 6.96875 0.125 C 6.945313 0.0546875 6.882813 0 6.8125 0 Z M 5.125 2.59375 C 5.246094 3.085938 5.398438 3.613281 5.53125 4.0625 L 6.125 6.125 L 4.1875 6.125 L 4.78125 4.0625 C 4.886719 3.6875 4.964844 3.242188 5.0625 2.8125 C 5.078125 2.738281 5.109375 2.664063 5.125 2.59375 Z M 21.5 6.15625 C 20.925781 6.15625 20.214844 6.355469 20 6.65625 C 19.855469 6.859375 19.804688 13.816406 19.59375 15.0625 L 17.59375 15.0625 C 17.382813 15.0625 17.195313 15.1875 17.09375 15.375 C 16.992188 15.5625 17.007813 15.792969 17.125 15.96875 C 18.652344 18.238281 21.023438 20.261719 21.125 20.34375 C 21.226563 20.425781 21.375 20.46875 21.5 20.46875 C 21.625 20.46875 21.738281 20.425781 21.84375 20.34375 C 21.945313 20.261719 24.316406 18.238281 25.84375 15.96875 C 25.960938 15.792969 25.972656 15.5625 25.875 15.375 C 25.773438 15.1875 25.585938 15.0625 25.375 15.0625 L 23.375 15.0625 C 23.164063 13.816406 23.019531 6.859375 22.875 6.65625 C 22.664063 6.355469 22.070313 6.15625 21.5 6.15625 Z M 1.5625 15 C 1.472656 15 1.40625 15.0625 1.40625 15.15625 L 1.40625 17.15625 C 1.40625 17.25 1.46875 17.3125 1.5625 17.3125 L 5.90625 17.3125 L 0.96875 24.4375 C 0.949219 24.464844 0.9375 24.5 0.9375 24.53125 L 0.9375 25.84375 C 0.9375 25.933594 1.003906 26 1.09375 26 L 9.40625 26 C 9.496094 26 9.5625 25.933594 9.5625 25.84375 L 9.5625 23.84375 C 9.5625 23.75 9.496094 23.6875 9.40625 23.6875 L 4.625 23.6875 L 9.4375 16.65625 C 9.457031 16.628906 9.46875 16.59375 9.46875 16.5625 L 9.46875 15.15625 C 9.46875 15.0625 9.402344 15 9.3125 15 Z"
													strokeLinecap="round"
												/>
											</g>
										</svg>
										<svg
											id="Alphabetical_Sorting_2_24"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											// xmlns:xlink="http://www.w3.org/1999/xlink"
											className="cursor-pointer"
											onClick={handleSortByAlphabetZa}
											fill={
												sortAlphabeticallyZa
													? "blue"
													: "#000000"
											}
										>
											<rect
												width="24"
												height="24"
												stroke="none"
												fill="#000000"
												opacity="0"
											/>

											<g transform="matrix(0.77 0 0 0.77 12 12)">
												<path
													className="stroke: none; stroke-width: 1; stroke-dasharray: none; strokeLinecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fillRule: nonzero; opacity: 1;"
													transform=" translate(-13.08, -13)"
													d="M 1.5625 0 C 1.472656 0 1.40625 0.0625 1.40625 0.15625 L 1.40625 2.15625 C 1.40625 2.25 1.46875 2.3125 1.5625 2.3125 L 5.90625 2.3125 L 0.96875 9.4375 C 0.949219 9.464844 0.9375 9.5 0.9375 9.53125 L 0.9375 10.84375 C 0.9375 10.933594 1.003906 11 1.09375 11 L 9.40625 11 C 9.496094 11 9.5625 10.933594 9.5625 10.84375 L 9.5625 8.84375 C 9.5625 8.75 9.496094 8.6875 9.40625 8.6875 L 4.625 8.6875 L 9.4375 1.65625 C 9.457031 1.628906 9.46875 1.59375 9.46875 1.5625 L 9.46875 0.15625 C 9.46875 0.0625 9.402344 0 9.3125 0 Z M 21.5 6.15625 C 20.925781 6.15625 20.214844 6.355469 20 6.65625 C 19.855469 6.859375 19.804688 13.816406 19.59375 15.0625 L 17.59375 15.0625 C 17.382813 15.0625 17.195313 15.1875 17.09375 15.375 C 16.992188 15.5625 17.007813 15.792969 17.125 15.96875 C 18.652344 18.238281 21.023438 20.261719 21.125 20.34375 C 21.226563 20.425781 21.375 20.46875 21.5 20.46875 C 21.625 20.46875 21.738281 20.425781 21.84375 20.34375 C 21.945313 20.261719 24.316406 18.238281 25.84375 15.96875 C 25.960938 15.792969 25.972656 15.5625 25.875 15.375 C 25.773438 15.1875 25.585938 15.0625 25.375 15.0625 L 23.375 15.0625 C 23.164063 13.816406 23.019531 6.859375 22.875 6.65625 C 22.664063 6.355469 22.070313 6.15625 21.5 6.15625 Z M 3.625 15 C 3.550781 15 3.488281 15.054688 3.46875 15.125 L 0.21875 25.78125 C 0.203125 25.832031 0.21875 25.898438 0.25 25.9375 C 0.28125 25.980469 0.324219 26 0.375 26 L 2.875 26 C 2.949219 26 3.011719 25.945313 3.03125 25.875 L 3.75 23.25 L 6.5625 23.25 L 7.34375 25.875 C 7.367188 25.945313 7.425781 26 7.5 26 L 10.125 26 C 10.214844 26 10.28125 25.933594 10.28125 25.84375 C 10.28125 25.808594 10.269531 25.777344 10.25 25.75 L 6.96875 15.125 C 6.945313 15.054688 6.882813 15 6.8125 15 Z M 5.125 17.59375 C 5.246094 18.085938 5.394531 18.613281 5.53125 19.0625 L 6.125 21.125 L 4.1875 21.125 L 4.78125 19.0625 C 4.886719 18.6875 4.964844 18.242188 5.0625 17.8125 C 5.078125 17.738281 5.109375 17.664063 5.125 17.59375 Z"
													strokeLinecap="round"
												/>
											</g>
										</svg>
										<svg
											id="Calendar_24"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											// xmlns:xlink="http://www.w3.org/1999/xlink"
											className="cursor-pointer"
											onClick={handleSorByDate}
											fill={
												sortByCreationDate
													? "blue"
													: "#000000"
											}
										>
											<rect
												width="24"
												height="24"
												stroke="none"
												fill="#000000"
												opacity="0"
											/>

											<g transform="matrix(1 0 0 1 12 12)">
												<path
													className="stroke: none; stroke-width: 1; stroke-dasharray: none; strokeLinecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fillRule: nonzero; opacity: 1;"
													transform=" translate(-12, -11)"
													d="M 6 1 L 6 3 L 5 3 C 3.9 3 3 3.9 3 5 L 3 19 C 3 20.1 3.9 21 5 21 L 19 21 C 20.1 21 21 20.1 21 19 L 21 5 C 21 3.9 20.1 3 19 3 L 18 3 L 18 1 L 16 1 L 16 3 L 8 3 L 8 1 L 6 1 z M 5 8 L 19 8 L 19 19 L 5 19 L 5 8 z"
													strokeLinecap="round"
												/>
											</g>
										</svg>
									</div>
									<table className="min-w-full leading-normal">
										<thead>
											<tr>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Clients
												</th>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Type
												</th>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Créer
												</th>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Voir
												</th>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Email
												</th>
												<th className="px-5 py-3 border-b-2 border-gray-200 bg-blue-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Historique
												</th>
											</tr>
										</thead>
										<tbody>
											{sortedStudents?.map((student) => {
												return (
													<tr key={student.id}>
														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<div className="flex items-center">
																<div className="flex-shrink-0 w-10 h-10">
																	{student?.image &&
																	student?.image !==
																		"" ? (
																		<img
																			src={
																				student?.image
																			}
																			alt="photo du client"
																			className="students_image"
																		/>
																	) : (
																		<span className="text-gray-600">
																			<svg
																				xmlns="http://www.w3.org/2000/svg"
																				fill="none"
																				viewBox="0 0 24 24"
																				strokeWidth={
																					1.5
																				}
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
																</div>
																<div className="ml-3">
																	<p className="text-gray-900 whitespace-no-wrap">
																		{
																			student?.name
																		}{" "}
																		{
																			student?.lastname
																		}
																	</p>
																</div>
															</div>
														</td>
														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<div className="flex items-center">
																<div className="ml-3">
																	<p className="text-gray-900 whitespace-no-wrap">
																		{
																			student?.userType
																		}
																	</p>
																</div>
															</div>
														</td>
														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
																<span
																	aria-hidden
																	className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
																></span>
																{student?.createdAt
																	? formatDate(
																			student?.createdAt
																	  )
																	: "N/A"}
															</span>
														</td>
														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<span className="relative inline-block px-3 py-1 font-semibold text-blue-500 leading-tight">
																<FontAwesomeIcon
																	icon={faEye}
																	style={{
																		cursor: "pointer",
																		backgroundColor:
																			"white",
																		padding:
																			"5px",
																	}}
																	onClick={() =>
																		openModal(
																			student
																		)
																	}
																/>
															</span>
														</td>

														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<span className="relative inline-block px-3 py-1 font-semibold text-blue-500 leading-tight">
																<FontAwesomeIcon
																	icon={
																		faEnvelope
																	}
																	style={{
																		cursor: "pointer",
																		backgroundColor:
																			"white",
																		padding:
																			"5px",
																	}}
																	onClick={() =>
																		openEmailModal(
																			student
																		)
																	}
																/>
															</span>
														</td>
														<td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
															<span className="relative inline-block px-3 py-1 font-semibold text-blue-500 leading-tight">
																<HistoryModal
																	targetId={
																		student?.id
																	}
																/>
															</span>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
									<div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
										<span className="text-xs xs:text-sm text-gray-900">
											Affichage {indexOfFirstStudent + 1}{" "}
											à{" "}
											{Math.min(
												indexOfLastStudent,
												studentCount
											)}{" "}
											de {studentCount} Entrées
										</span>
										<div className="inline-flex mt-2 xs:mt-0">
											<Button
												className="text-sm text-indigo-50 transition duration-150 hover-bg-indigo-500 bg-black font-semibold py-2 px-4 rounded-l"
												onClick={handlePrevClick}
											>
												Prev
											</Button>
											&nbsp; &nbsp;
											<Button
												className="text-sm text-indigo-50 transition duration-150 hover-bg-indigo-500 bg-black font-semibold py-2 px-4 rounded-r"
												onClick={handleNextClick}
											>
												Suivant
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div> */
}
