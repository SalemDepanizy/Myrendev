// import React from 'react'

// function insatisfait() {
//   return (
//     <div>insatisfait</div>
//   )
// }

// export default insatisfait

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

function insatisfait() {
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
    console.log("API Response:", response.data);
    const satisfaction = response.data as SatisfactionData;
    return satisfaction;
  });

  const {
    data: satisfactionResponse,
    isLoading: loadingSatisfactionResponse,
    error: errorSatisfactionResponse,
  } = useSWR("/satisfactionreponse/all", async (url) => {
    const response = await fetcher.get(url);
    console.log("API Response:", response.data);
    const satisfaction = response.data as SatisfactionResponseData;
    return satisfaction;
  });

  console.log("satisfactionsres", satisfactionResponse);

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
          <div className="flex justify-center p-6">
            <h2 className="text-2xl font-semibold leading-tight">
              Listes Des Clients
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

                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Note Moyene
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Commentaire
                    </th>

                    {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Note
                    </th> */}
                    {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Question
                    </th> */}
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Voir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(satisfactionResponse?.data) &&
                    satisfactionResponse?.data?.map((response) => {
                      if (response.notegeneral < 2.5) {
                        
                        return (
                          <tr key={response.id}>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {response.createdAt &&
                                format(
                                  parseISO(response.createdAt),
                                  "PP à HH:mm",
                                  {
                                    locale: fr,
                                  }
                                )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              {response?.user?.name}
                            </td>
                            <td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Rate allowHalf value={response?.notegeneral} />
                                <span>{response?.notegeneral.toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
                              {response?.comments}
                            </td>
                            <td className="px-3 py-3 space-y-4 text-gray-500 list-decimal list-inside dark:text-gray-400">
                              {response.QuestionNotes.map((qn, index) => (
                                <div
                                  key={index}
                                  className="lex items-center space-x-2"
                                >
                                  <Rate allowHalf value={qn.note} />
                                  <span>{qn.note.toFixed(1)}</span>
                                </div>
                              ))}
                            </td>
                            <td className="px-3 py-3 text-gray-500 dark:text-gray-400">
                              <Stack direction="row" spacing={1}>
                                <FontAwesomeIcon
                                  icon={faEye}
                                  style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                  }}
                                  onClick={openViewModal}
                                />
                                <Popconfirm
                                  title="Supprimer"
                                  description={`Êtes-vous sûr de vouloir supprimer le retour de client ?`}
                                  onConfirm={() => handleDelete1(response.id)}
                                  icon={
                                    <QuestionCircleOutlined
                                      style={{ color: "red" }}
                                    />
                                  }
                                  okText={
                                    <span className="text-red-500">Oui</span>
                                  }
                                  cancelText="Non"
                                >
                                  <IconButton>
                                    <DeleteIcon size={20} />
                                  </IconButton>
                                </Popconfirm>
                              </Stack>
                            </td>
                          </tr>
                        );
                      }
                      return null; 
                    })}
                </tbody>
              </table>

              <Modal
                title={
                  <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
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
                  satisfactionResponse?.data.map((response) => {
                    if (response.notegeneral < 2.5) {
                      return (
                        <tr key={response.id}>
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faBriefcase}
                              className="mr-2 text-green-500"
                            />
                            <span className="font-semibold">
                              Intervention :{" "}
                            </span>
                            <span>{response.rendezVous?.forfait?.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faUserTie}
                              className="mr-2 text-red-500"
                            />
                            <span className="font-semibold">Employé : </span>
                            <span>{response.rendezVous.monitor?.name}</span>
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
                            parseISO(response.rendezVous.dateTime),
                            "dd MMM yyyy",
                            { locale: fr }
                          )}
                        </span>
                          </div>
                        </tr>
                      );
                    }
                    return null; // Do not render anything if notegeneral is 2.5 or higher
                  })}
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default insatisfait;
