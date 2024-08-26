import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "./axios";
import { Student } from "./Students";
import emailjs from "emailjs-com";
import TextField from "@mui/material/TextField";
import { Entreprise } from "./SuperAdmin";
import { Upload, UploadFile, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface EmailProps {
  // data2: object| null
  email: string | undefined;
}

const Email: React.FC<EmailProps> = ({ email }) => {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [manualRecipient, setManualRecipient] = useState("");
  const [messages, setMessages] = useState("");
  const [showManualRecipient, setShowManualRecipient] = useState(false);
  const [manualRecipients, setManualRecipients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData = new FormData();

  useEffect(() => {
    setRecipients([email || ""]);
  }, [email]);

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
  };

  const MAX_MANUAL_RECIPIENTS = 5;

  const removeManualRecipient = (email: string) => {
    setManualRecipients(
      manualRecipients.filter((recipient) => recipient !== email)
    );
  };
  const [objets, setObjets] = useState("");
  // State to store selected files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Function to handle file upload
  const handleFileUpload = (fileList: UploadFile<any>[]) => {
    const files: File[] = fileList.map((file) => file.originFileObj!);
    setSelectedFiles(files);
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email || "");
      formData.append("objets", objets);
      formData.append("message", messages);
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      const response = await fetcher.post(
        "adminmailing/personalize-admin-email",
        formData
      );
      if (response.status === 200) {
        message.success("E-mail envoyé avec succès");
        // navigate("/superadmin");
      } else {
        message.error("Échec de l'envoi de l'email.");
      }
    } catch (error) {
      console.error("Error creating monitor:", error);
      message.error("Failed to create monitor and upload file.");
    } finally {
      setIsSubmitting(false);
    }
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
                </div>
              ))}
            </div>
            <div className="destinataires flex-auto content-center"></div>
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
            disabled={isSubmitting}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {isSubmitting ? "En Cours..." : "Envoyer l'email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Email;
