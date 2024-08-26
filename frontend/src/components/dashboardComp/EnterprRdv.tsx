import React, { useState } from "react";
import { Select, DatePicker, Modal } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/fr";
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import locale from "antd/es/date-picker/locale/fr_FR";
import ModalRdvDetails from "../normalizeComponents/modalRdvDetail";
const { Option } = Select;

interface Rendezvous {
  id: string;
  dateTime: string;
  isValid: boolean;
  isActivated: boolean;
  title: string;
  description: string;
  client: {
    lastname: string;
    name: string;
    email: string;
  };
  monitor?: {
    id: string;
    name: string;
    lastname: string;
  };
}

interface Monitor {
  id: string;
  name: string;
}

interface RdvListProps {
  rendezvous: any;
  monitors: any;
}

function RdvList({ rendezvous = [], monitors = [] }: RdvListProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [chosenMonitor, setChosenMonitor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRendezvous, setSelectedRendezvous] = useState<Rendezvous | null>(null);

  dayjs.locale("fr");

  const handleMonitorChange = (value: string) => {
    setChosenMonitor(value);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const showModal = (rendezvous: Rendezvous) => {
    setSelectedRendezvous(rendezvous);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedRendezvous(null);
  };

  const filteredRendezvous = rendezvous
    .filter((rendezvous) => {
      const now = dayjs();
      const rendezvousDate = dayjs(rendezvous.date);

      const isFuture =
         rendezvousDate.isAfter(now) &&
        rendezvous.isValid &&
        rendezvous.isActivated === true;
      const isPast = rendezvousDate.isBefore(now);
      const isPending = rendezvous.isValid === false;
      const isCanceled = rendezvous.isActivated === false ;

      if (selectedStatus === "upcoming") return isFuture;
      if (selectedStatus === "pending") return isPending;
      if (selectedStatus === "canceled") return isCanceled;
      if (selectedStatus === "past") return isPast;

      return true;
    })
    .filter(
      (rendezvous) => !chosenMonitor || rendezvous.payload.monitor?.id === chosenMonitor
    )
    .filter((rendezvous) => {
      if (!selectedDate) return true;
      const rendezvousDate = dayjs(rendezvous.dateTime);
      return rendezvousDate.isSame(selectedDate, "day");
    });

  const getCount = (status: string) => {
    return rendezvous.filter((rendezvous) => {
      const now = dayjs();
      const rendezvousDate = dayjs(rendezvous.date);

      const isFuture =
      rendezvousDate.isAfter(now) &&
      rendezvous.isValid &&
      rendezvous.isActivated === true;
      const isPast = rendezvousDate.isBefore(now);
      const isPending = rendezvous.isValid === false;
      const isCanceled = rendezvous.isActivated === false && !isPending;

      if (status === "upcoming") return isFuture;
      if (status === "pending") return isPending;
      if (status === "canceled") return isCanceled;
      if (status === "past") return isPast;

      return false;
    }).length;
  };

  const isFilterApplied = selectedStatus || chosenMonitor || selectedDate;

  return (
    <div className="bg-white shadow-lg p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-700">Rendez-vous</h4>
        <div className="flex items-center gap-4">
          <Select
            placeholder="Sélectionner un moniteur"
            style={{ width: "30%", margin: "10px" }}
            onChange={handleMonitorChange}
            value={chosenMonitor}
          >
            <Option key="all" value="">
              Tous
            </Option>
            {monitors.map((monitor) => (
              <Option key={monitor.id} value={monitor.id}>
                {monitor.name}
              </Option>
            ))}
          </Select>

          <DatePicker
            placeholder="Sélectionner une date"
            style={{ margin: "10px", width: "30%" }}
            onChange={handleDateChange}
            value={selectedDate}
            locale={locale}
            format="YYYY-MM-DD"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Button
          isActive={selectedStatus === "upcoming"}
          onClick={() => handleStatusChange("upcoming")}
          icon={<FaCheckCircle className="w-5 h-5 text-green-500" />}
          label="À Venir"
          count={getCount("upcoming")}
          className="flex flex-col gap-2 Name"
        />
        <Button
          isActive={selectedStatus === "pending"}
          onClick={() => handleStatusChange("pending")}
          icon={<FaHourglassHalf className="w-5 h-5 text-yellow-500" />}
          label="En Attente"
          count={getCount("pending")}
          className="flex flex-col gap-2 Name"
        />
        <Button
          isActive={selectedStatus === "canceled"}
          onClick={() => handleStatusChange("canceled")}
          icon={<FaTimesCircle className="w-5 h-5 text-red-500" />}
          label="Annulé"
          count={getCount("canceled")}
          className="flex flex-col gap-2 Name"
        />
        <Button
          isActive={selectedStatus === "past"}
          onClick={() => handleStatusChange("past")}
          icon={<FaHistory className="w-5 h-5 text-blue-500" />}
          label="Passé"
          count={getCount("past")}
          className="flex flex-col gap-2 Name"
        />
      </div>

      <div className="mt-4">
        {isFilterApplied && (
          <div className="flex flex-col gap-2 overflow-y-auto h-[450px]">
            {filteredRendezvous.map((rendezvous) => (
              <div
                key={rendezvous.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md cursor-pointer"
                onClick={() => showModal(rendezvous)}
              >
                <h5 className="font-semibold text-lg">{rendezvous.title}</h5>
                <p className="text-gray-600">
                  {dayjs(rendezvous.dateTime).format("DD MMM YYYY HH:mm")}
                </p>
                <p className="text-gray-500">
                  Description: {rendezvous.description}
                </p>
                <p className="text-gray-500">
                  Client: {rendezvous.payload.client.lastname} {rendezvous.payload.client.name}
                </p>
                <p className="text-gray-500">
                  Mail Client:
                  <a href={`mailto:${rendezvous.payload.client.email}`}>
                    {rendezvous.payload.client.email}
                  </a>
                </p>
                <p className="text-gray-500">
                  Collaborateur: {rendezvous.payload.monitor?.name}{" "}
                  {rendezvous.payload.monitor?.lastname}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRendezvous && (
        <ModalRdvDetails
        rendezvous={selectedRendezvous}
          isOpen={isModalVisible}
          onClose={handleCancel}

        />

      )}
    </div>
  );
}

interface ButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: JSX.Element;
  label: string;
  count: number;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  isActive,
  onClick,
  icon,
  label,
  count,
  className = ""
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 ${className} ${
      isActive ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-500"
    }`}
  >
    {icon}
    <span>
      {label} ({count})
    </span>
  </button>
);

export default RdvList;
