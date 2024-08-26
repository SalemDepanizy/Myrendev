import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "./axios";
import { Student } from "./Students";
import emailjs from "emailjs-com";
import TextField from "@mui/material/TextField";
import { Entreprise } from "./SuperAdmin";
import { Button, message, Upload, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface EmailProps {
  email: string | null;
  student: Student | null;
  onEmailSent?: () => void; // Add this line, '?' makes it an optional prop
}

const Email: React.FC<EmailProps> = ({ email, student, onEmailSent }) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [manualRecipient, setManualRecipient] = useState("");
  const [messages, setMessages] = useState("");
  const [showManualRecipient, setShowManualRecipient] = useState(false);
  const [manualRecipients, setManualRecipients] = useState<string[]>([]);
  const [fichier, setFile] = useState<File | null>(null); // State to store the selected file
  const [fichierPDF, setFichierPDF] = useState<File | null>(null);

  const formData = new FormData();

  const {
    data: students,
    isLoading: loadingStudents,
    error: errorStudents,
    mutate: refresh,
  } = useSWR("/users/get/student", async (url) => {
    const studentsData = (await fetcher.get(url)).data as Student[];

    return studentsData;
  });

  useEffect(() => {
    setRecipients([email || ""]);
  }, [email]);

  const addRecipient = (email: string) => {
    if (!recipients.includes(email)) {
      setRecipients([...recipients, email]);
      setManualRecipient("");
    }
  };
  const handleChargementFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fichierSelectionne = e.target.files[0];
      setFichierPDF(fichierSelectionne);
    }
  };
  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
  };

  const handleRemoveRecipient = (recipient: string) => {
    if (recipients.includes(recipient)) {
      removeRecipient(recipient);
    } else if (manualRecipients.includes(recipient)) {
      removeManualRecipient(recipient);
    }
  };

  const MAX_MANUAL_RECIPIENTS = 5;

  const addManualRecipient = () => {
    if (
      manualRecipient.includes("@") &&
      manualRecipient &&
      !manualRecipients.includes(manualRecipient) &&
      manualRecipients.length <= MAX_MANUAL_RECIPIENTS
    ) {
      setManualRecipients([...manualRecipients, manualRecipient]);
      setManualRecipient("");
    }
  };

  const removeManualRecipient = (email: string) => {
    setManualRecipients(
      manualRecipients.filter((recipient) => recipient !== email)
    );
  };

  // State to store selected files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Function to handle file upload
  const handleFileUpload = (fileList: UploadFile<any>[]) => {
    const files: File[] = fileList.map((file) => file.originFileObj!);
    setSelectedFiles(files);
  };

  const [objets, setObjets] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("email", email || "");
      formData.append("objets", objets);
      formData.append("messages", messages);
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const formattedManualRecipients = manualRecipients.map((recipient) =>
        String(recipient)
      );

      const [recipient1, recipient2, recipient3, recipient4, recipient5] =
        formattedManualRecipients;

      // Append manual recipients to formData
      if (recipient1) formData.append("manualRecipient1", recipient1);
      if (recipient2) formData.append("manualRecipient2", recipient2);
      if (recipient3) formData.append("manualRecipient3", recipient3);
      if (recipient4) formData.append("manualRecipient4", recipient4);
      if (recipient5) formData.append("manualRecipient5", recipient5);

      const response = await fetcher.post(
        "mailing/personalize-email",
        formData
      );

      if (response.status === 200) {
        message.success("E-mail envoyé avec succès");
        // Call the callback function when email is sent successfully
        onEmailSent && onEmailSent();
      } else {
        message.error("Échec de l'envoi de l'email.");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      message.error("Échec de l'envoi de l'email.");
    }
  };
  const handleClick = () => {
    setShowManualRecipient(false);
  };

  return (
    <div className="flex items-center border-none">
      <div className="p-8 max-w-md mx-auto border-none">
        <h1 className="text-2xl font-bold mb-4">
          Envoyer un e-mail personnalisé
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="recipient"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Destinataire:
            </label>
            <div className="w-64 mt-2">
              {[...recipients, ...manualRecipients].map((recipient) => (
                <div key={recipient} className="flex items-center mt-2">
                  <span className="mr-2">{recipient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(recipient)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
            <div className="destinataires flex-auto content-center">
              <div className="w-64">
                {/* <p className="flex">{email}</p> */}
              </div>
              {/* <button
                type="button"
                onClick={() => setShowManualRecipient(!showManualRecipient)}
                className="bg-green-500 text-white py-1 mx-auto px-1 rounded hover:bg-green-700 md:self-center mt-2"
              >
                Ajouter manuellement
              </button> */}
              {!showManualRecipient && (
                <button
                  type="button"
                  onClick={() => setShowManualRecipient(!showManualRecipient)}
                  className="bg-green-500 text-white py-1 mx-auto px-1 rounded hover:bg-green-700 md:self-center mt-2"
                >
                  Ajouter manuellement
                </button>
              )}
            </div>

            {showManualRecipient && (
              <div className="flex items-center">
                <input
                  type="email"
                  id="ajouter"
                  value={manualRecipient}
                  onChange={(e) => setManualRecipient(e.target.value)}
                  placeholder="Saisir manuellement"
                  className="border rounded w-64 py-2 px-3 mt-1"
                />
                <button
                  type="button"
                  onClick={addManualRecipient}
                  className={`bg-green-500 text-white mt-2 py-1 px-4 ml-4 rounded hover:bg-green-700 ${
                    manualRecipients.length >= MAX_MANUAL_RECIPIENTS
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={manualRecipients.length >= MAX_MANUAL_RECIPIENTS}
                >
                  +
                </button>
              </div>
            )}

            {showManualRecipient && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowManualRecipient(false)}
                  className="bg-blue-500 text-white py-1 mx-auto px-1 rounded hover:bg-blue-700 md:self-center mt-2"
                >
                  Réapparaitre
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="subject"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Sujet:
            </label>
            <TextField
              margin="normal"
              required
              fullWidth
              id="texte"
              label="Objet"
              name="texte"
              autoComplete="off"
              autoFocus
              value={objets}
              onChange={(e) => setObjets(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Message:
            </label>

            <TextField
              margin="normal"
              required
              fullWidth
              id="texte"
              label="Votre Texte"
              name="texte"
              autoComplete="off"
              autoFocus
              multiline
              rows={4}
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
            />
            <Upload
              multiple
              onChange={(info) => handleFileUpload(info.fileList)}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>
                Sélectionner des fichiers
              </Button>
            </Upload>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Envoyer l'e-mail
          </button>
        </form>
      </div>
    </div>
  );
};

export default Email;
function ArraytoString(manualRecipients: string[]): any {
  throw new Error("Function not implemented.");
}
