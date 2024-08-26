import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fr } from "date-fns/locale";
import {
  differenceInMinutes,
  addMinutes,
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";
import useSWR from "swr";
import { fetcher } from "./axios";
import Autocomplete from "./components/Autocomplete";
import "../src/assets/app.css"; // Importer le fichier CSS personnalisé
import Dragger from "antd/es/upload/Dragger";
import {
  InboxOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { UploadRequestOption } from "rc-upload/lib/interface";
import type { RcFile, UploadProps } from "antd/es/upload";
import { Popconfirm, message } from "antd";
import Button from "./components/Button";
import useSWRMutation from "swr/mutation";
import { AvailabiltyResult } from "./components/Availabilty";
import { CorpSetting } from "src/CorpSetting";
import { useAuth } from "./lib/hooks/auth";

const locales = { fr };

interface APIFile {
  filename: string;
  originalFilename: string;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const formats = {
  dateFormat: "d",
  dayHeaderFormat: (date: Date, culture: any, localizer: any) => {
    return localizer.format(date, "EEEE d MMMM yyyy", culture);
  },
};

const messages = {
  today: "Aujourd'hui",
  previous: "<",
  next: ">",
};

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const initialEvents: Event[] = [
  {
    id: 1,
    title: "Réunion",
    start: new Date(2024, 6, 15, 10, 0),
    end: new Date(2024, 6, 15, 12, 0),
  },
  {
    id: 2,
    title: "Entretien",
    start: new Date(2024, 6, 17, 11, 0),
    end: new Date(2024, 6, 17, 12, 30),
  },
];

interface UseRendezVousProps {
  slotPackage: any;
  date: any;
  defaultDuration: number;
}

const UseRendezVous: React.FC<UseRendezVousProps> = ({
  slotPackage,
  date,
  defaultDuration,
}) => {
  const { user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(slotPackage);
  const [duration, setDuration] = useState(defaultDuration);
  const [view, setView] = useState("month");
  const [namesDataForfait, setNamesDataForfait] = useState<string[]>([]);
  const [idDataForfait, setIdDataForfait] = useState<string[]>([]);
  const [hoursForfait, setHoursForfait] = useState<string[]>([]);
  const [forfaitId, setForfaitId] = useState<string | null>(null);
  const [valueForfait, setValueForfait] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [addressDataClient, setAddressDataClient] = useState<string[]>([]);
  const [namesData, setNamesData] = useState<string[]>([]);
  const [idData, setIdData] = useState<string[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [namesDataMonitor, setNamesDataMonitor] = useState<string[]>([]);
  const [idDataMonitor, setIdDataMonitor] = useState<string[]>([]);
  const [phoneDataMonitor, setPhoneDataMonitor] = useState<string[]>([]);
  const [monitorId, setMonitorId] = useState<string>("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [creneau, setCreneau] = useState<string>("");
  //   const [date, setDate] = useState<string>("");
  const [available, setAvailable] = useState<any>();
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);

  const handleDraggerFileChange = (info: any) => {
    const { status } = info.file;
    if (status !== "uploading") {
    }
    if (status === "done") {
      setDraggedFiles((prevFiles) => [
        ...prevFiles,
        info.file.originFileObj as File,
      ]);
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const draggerProps: UploadProps = {
    name: "files",
    multiple: true, // Set to true to allow multiple file selection
    onChange: handleDraggerFileChange,
    customRequest: (options: UploadRequestOption) => {
      const { file, onSuccess, onError } = options;
      // Simulate a successful upload with a timeout
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    },
    onDrop(e) {},
  };

  const [selectedRendezVousFiles, setSelectedRendezVousFiles] = useState<
    APIFile[]
  >([]);

  const { data: monitors } = useSWR(
    "/users/get/monitor",
    async (url) => (await fetcher.get(url)).data
  );
  const { data: forfaits } = useSWR(
    "/forfait/all",
    async (url) => (await fetcher.get(url)).data
  );
  const { data: students } = useSWR(
    "/users/get/student",
    async (url) => (await fetcher.get(url)).data
  );

  const { data, error, isLoading, mutate } = useSWR(
    `/users/availability/${monitorId}`,
    async (url) => {
      const result = await fetcher.get(url);
      const resultData = result.data as AvailabiltyResult;
      const availabilities = resultData.data.reduce(
        (acc: { [day: string]: { intervals: string[] } }, item) => {
          acc[item.day] = {
            intervals: item.intervals,
          };
          return acc;
        },
        {}
      );

      return availabilities;
    }
  );

  const {
    data: settings,
    isLoading: loadingSettings,
    error: errorSettings,
    mutate: refreshSettings,
  } = useSWR("/CorpSetting/get/corpsetting", async (url) => {
    const SettingData = (await fetcher.get(url)).data as CorpSetting[];

    return SettingData;
  });


  const dayMoment =
  settings && settings[0] ? String(settings[0].dayMoment) || "" : "";
const maxSlots =
  settings && settings[0] ? String(settings[0].maxSlots) || "" : "";
const confirmationChoice =
  settings && settings[0] ? String(settings[0].confirmationChoice) || "" : "";
const numberDays =
  settings && settings[0] ? String(settings[0].numberDays) || "" : "";
const numberWeeks =
  settings && settings[0] ? String(settings[0].numberWeeks) || "" : "";



  const traduireJourEnFrancais = (jourAnglais) => {
    const traductions = {
      Monday: "Lundi",
      Tuesday: "Mardi",
      Wednesday: "Mercredi",
      Thursday: "Jeudi",
      Friday: "Vendredi",
      Saturday: "Samedi",
      Sunday: "Dimanche",
    };

    // Vérifie si le jour anglais existe dans les traductions
    if (traductions.hasOwnProperty(jourAnglais)) {
      return traductions[jourAnglais];
    } else {
      return "Traduction non disponible";
    }
  };

  const days = moment(date).format("dddd");
  const jourEnAnglais = days;
  const jourEnFrancais = traduireJourEnFrancais(jourEnAnglais);
  const [daysC, setDaysC] = useState("");

  useEffect(() => {
    for (const day in data) {
      if (data.hasOwnProperty(day) && day === jourEnFrancais) {
        setDaysC(day);
        setAvailable([data]);
      }else if (data) {
        setAvailable([data]);
      }
    }
  }, [data]);


  useEffect(() => {
    if (selectedSlot) {
      setCreneau(
        moment(selectedSlot.start).format("HH:mm") +
          "-" +
          moment(selectedSlot.end).format("HH:mm")
      );
    }
  });

  const handleTitleChange = (event) => {
    setEventTitle(event.target.value);
  };
  const handleDescriptionChange = (event) => {
    setEventDescription(event.target.value);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(event.target.value, 10);
    if (selectedSlot) {
      const newEnd = addMinutes(selectedSlot.start, newDuration);
      setSelectedSlot({ ...selectedSlot, end: newEnd });
    }
    setDuration(newDuration);
    setErrorMessage(null);

    setInfoMessage(null);
  };

  useEffect(() => {
    // chercher si l'intervention est assigné a quelq'un
    const cece = forfaits?.find((forfait) => forfait.id === forfaitId);
    const monitorDependOf = cece?.monitorId ?? "";
    let monitorForThisInter: string[] = [];
    monitorForThisInter.push(monitorDependOf);
    const activeMonitor = monitors?.filter(
      (monitor) => monitor.active === true
    );

    if (activeMonitor) {
      const fullNames = activeMonitor?.map(
        (monitor) => `${monitor.lastname} ${monitor.name}`
      );

      setNamesDataMonitor(fullNames);
      const ids = activeMonitor?.map((monitor) => monitor.id);
      setIdDataMonitor(ids); // Utiliser setIdData pour mettre à jour idData avec les IDs récupérés

      const phoneNumbers = activeMonitor?.map(
        (monitor) => "Tél.  " + monitor.phone
      );
      setPhoneDataMonitor(phoneNumbers);
    }
    if (monitorForThisInter.length > 0) {
      const whichMonitor = activeMonitor?.find(
        (monitor) => monitor.id === monitorForThisInter[0]
      );
      if (whichMonitor) {
        setNamesDataMonitor([whichMonitor.name + " " + whichMonitor.lastname]);
        setPhoneDataMonitor(["Tél.  " + whichMonitor.phone]);
        setIdDataMonitor([whichMonitor.id]);
      }
    }
  }, [monitors, forfaitId]);

  useEffect(() => {
    if (students) {
      const fullNames = students.map(
        (student) => `${student.lastname} ${student.name}`
      );
      setNamesData(fullNames);
      const ids = students.map((student) => student.id);
      setIdData(ids); // Utiliser setIdData pour mettre à jour idData avec les IDs récupérés
      const adresseClients = students.map((student) => student.address);
      setAddressDataClient(adresseClients);
    }
  }, [students]);

  useEffect(() => {
    if (forfaits) {
      const fullNames = forfaits.map((forfait: any) => forfait.name);
      setNamesDataForfait(fullNames);
      const ids = forfaits.map((forfait: any) => forfait.id);
      setIdDataForfait(ids);
      const hoursForfaits = forfaits.map(
        (forfait: any) => `Temps d'intervenion: ${forfait.heure}`
      );
      setHoursForfait(hoursForfaits);
    }
  }, [forfaits]);

  const handleDataFromChildAutocompleteForfait = (id: string) => {
    setForfaitId(id);
    const selectedForfait = forfaits?.find((forfait: any) => forfait.id === id);
    if (selectedForfait) {
      const intermediate = parseFloat(selectedForfait.heure);
      setValueForfait(intermediate);
      let toMinutes = intermediate * 60;
      if (toMinutes > 0 && toMinutes < duration) {
        setErrorMessage(
          "Le temps d'intervenion ne doit pas depasser la duree de l'intervention"
        );
      } else if (toMinutes > 0 && toMinutes > duration) {
        setInfoMessage("La durée est inferieure au temps d'intervenion");
      } else {
        setInfoMessage(null);
        setErrorMessage(null);
      }
    }
  };
  const handleDataFromChildAutocomplete = (id: string) => {
    setStudentId(id);
  };

  const handleDataFromChildAutocompleteMonitor = (id: string) => {
    setMonitorId(id);
  };

  //creation d'event

  const handleSubmit = async (data) => {
    if (!studentId) {
      message.warning("Veuillez choisir un client");
      return;
    }
    if (!forfaitId) {
      message.warning("Veuillez choisir une intervention");
      return;
    }

    createEvent({
      title: eventTitle,
      description: eventDescription,
      date: moment(date),
      clientId: studentId,
      forfaitId: forfaitId,
      monitorId: monitorId,
      creneau: creneau,
      isValid: true, // Add isValid with a default value of true
      files: draggedFiles, // Include the files in the request
    });
  };

  let forfaitForIt = duration / 60 ;

  const { trigger: createEvent } = useSWRMutation(
    `/rendezvous/create`,
    async (
      url,
      {
        arg: {
          title,
          description,
          date,
          clientId,
          forfaitId,
          monitorId,
          isValid,
          files,
        },
      }: {
        arg: {
          title: string;
          description: string;
          date: moment.Moment;
          clientId: string;
          forfaitId: string;
          creneau: string;
          monitorId?: string;
          isValid: boolean; // Include isValid property as boolean type
          files: File[]; // Explicitly type files as File[]
        };
      }
    ) => {
      // Log the value of isValid

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("dateTime", date.toISOString());
      formData.append("clientId", clientId);
      formData.append("forfaitId", forfaitId);
      formData.append("monitorId", monitorId?.toString() || "");
      formData.append("creneau", creneau);
      formData.append("duration", forfaitForIt.toString());
      // formData.append("isValid", Boolean(isValid).toString());

      files.forEach((file: File) => {
        formData.append("files", file as unknown as Blob, file.name); // Double cast to handle type conversion
      });

      return await fetcher.post(url, formData);
    },
    {
      onSuccess: () => {
        if (!date) {
          message.error("Veuillez choisir une date");
        }
        if (monitorId === "") {
          message.error("Veuillez choisir un employé");
        } else {
          message.success("Rendez-vous ajouté avec succès");
          // setCreateEventModalVisible(false);
        }
      },
    }
  );
  const [forfaitToSend, setForfaitToSend] = useState<number>(valueForfait);



  const sendEmailToStudent = async (studentId, relationKey) => {
    if (!studentId) {
      message.warning("Please select a student first.");
      return;
    }
    if(duration > (valueForfait * 60) ){
      message.warning("La durée sélectionner ne doit pas depasser la duree de l'intervention");
    }

    if (!students || students.length === 0) {
      message.warning("Student data is not available");
      return;
    }

    const student = students.find((s) => s.id === studentId);
    if (!student) {
      message.warning("Student not found");
      return;
    }
    

    try {
      const response = await fetcher.post("/rendezvous/send-mail-to-student", {
        email: student.email,
         available: available || "", // Ensure title is defined and fallback to an empty string if not
         days: daysC,
         date: date || "",
         key: (Math.random() * (1000 - 1) + 1).toString(),
         relationKey: relationKey,
         tempsInter: forfaitForIt,
         options: [dayMoment, maxSlots, confirmationChoice ,numberDays ,numberWeeks] || "",
         staffIds: [user?.id, monitorId] || "",
      });

      if (response.status === 200) {
        message.success("E-mail envoyé avec succès à " + student.email);
      } else {
        console.error("Failed to send email.");
        message.warning("Veuillez choisir un client");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      message.error("Adresse email introuvable");
    }
  };

  const clientDecision = async (event) => {
    if (!studentId || forfaitId === "" || monitorId === "") {
      message.warning("Veuillez choisir un client, un forfait et un monitor");
      return;
    } else {
      const relationKey = (Math.random() * (1000 - 1) + 1).toString();
      sendEmailToStudent(studentId, relationKey);
      const data = {
        title: eventTitle || "",
        description: eventDescription,
        clientId: studentId,
        dateTime: date || "",
        // date ,
        forfaitId: forfaitId,
        monitorId: monitorId,
        relationKey: relationKey,
        creneau: "",
        isValid: false,
      };

      const response = await fetcher.post("/rendezvous/create", data);
      if (response.status === 200) {
        // setCreateEventModalVisible(false);
        message.success("Rendez-vous en attente créé avec succès.");
      } else {
        // Handle failure case
        message.error("Échec de la création d'un rendez-vous différé.");
      }
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-4 rounded shadow-lg">
            <p className="text-lg font-semibold mb-2">
              Créer un nouvel événement
            </p>
            <p>
              Date : {moment(selectedSlot?.start).format("dddd D MMMM YYYY")}
            </p>
            <p>
              Créneau horaire : {moment(selectedSlot?.start).format("HH:mm")} -{" "}
              {moment(selectedSlot?.end).format("HH:mm")}
            </p>
            <div className="mt-2">
              <label htmlFor="duration" className="mr-2">
                Durée (minutes) :
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={duration}
                onChange={handleDurationChange}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label htmlFor="titre">Titre Intervention*</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                // {...register("title")}
                onChange={handleTitleChange}
              />
            </div>
            <div>
              <label htmlFor="description">Commentaire</label>
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                // {...register("description")}
                onChange={handleDescriptionChange}
              />
            </div>
            <div>
              <label>Client*</label>
              <Autocomplete
                suggestionsData={namesData}
                suggestionsInfo={addressDataClient}
                idData={idData}
                onDataFromChild={handleDataFromChildAutocomplete}
                defaultValue=" "
              />
            </div>
            <div>
              <label>Intervention*</label>
              <Autocomplete
                suggestionsData={namesDataForfait}
                suggestionsInfo={hoursForfait}
                idData={idDataForfait}
                onDataFromChild={handleDataFromChildAutocompleteForfait}
                defaultValue=" "
              />
            </div>
            <div>
              <label>Employé*</label>
              <Autocomplete
                suggestionsData={namesDataMonitor}
                suggestionsInfo={phoneDataMonitor}
                idData={idDataMonitor}
                onDataFromChild={handleDataFromChildAutocompleteMonitor}
                defaultValue=" "
              />
            </div>
            <Button type="button" onClick={clientDecision}>
              Le Client Choisis
            </Button>
            <Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Cliquez ou faites glisser le fichier dans cette zone pour le
                télécharger
              </p>
            </Dragger>
            {errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p>
            )}
            {infoMessage && (
              <p className="text-yellow-600 mt-2">{infoMessage}</p>
            )}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4 mr-2"
              // onClick={handleSubmit}
            >
              Réserver
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mt-4"
              onClick={() => setSelectedSlot(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UseRendezVous;
