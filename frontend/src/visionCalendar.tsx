



import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer ,dateFnsLocalizer, } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useSWR from "swr";
import { fetcher } from "./axios";
import Forfait from "./Forfait";
import { Monitor } from "./Moniteurs";
import { User } from "./components/auth/protect";
import { Modal } from "antd";
import AddRendezvous from "./components/RendezVousCreator";
import {
  CalendarEvent,
} from "./components/Calandar";
import { fr } from "date-fns/locale";
import { format, parse, startOfWeek, getDay } from "date-fns";

const locales = {
  fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


let formats = {
  dateFormat: "d",
  dayHeaderFormat: (date, culture, localizer) => {
    const formattedDate = localizer.format(date, "EEEE d MMMM yyyy", culture);
    return formattedDate;
  },
};

type Payload = {
  client: User;
  forfait?: Forfait;
  monitor?: Monitor;
  images?: object[];
  creneau?: string;
};

type Rendezvous = {
  creneau: string;
  id: string;
  title: string;
  dateTime: string;
  description: string | null;
  client: User;
  forfait?: Forfait;
  monitor?: Monitor;
  images?: { filename: string; rendezVousId: string }[];
  isActivated: boolean;
  payload: any;
  creator: string;
  isValid: boolean;
};

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  payload: {
    client: User;
    forfait: Forfait;
    monitor: Monitor;
    images?: { filename: string; rendezVousId: string }[];
  };
}

const VisionCalendar = ({ data, date }: { data: any; date: any }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [rdvEvent, setRdvEvent] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckedExpired, setIsCheckedExpired] = useState(false);
  const [filterChecked, setFilterChecked] = useState(false);
  const [eventsToDisplay, setEventsToDisplay] = useState<Event[]>([]);
  const [isModalClosed, setIsModalClosed] = useState(false);
  const [editEventModalVisible, setEditEventModalVisible] = useState(false);

  const { data: rdvData, mutate: refetch } = useSWR("/rendezvous/all", async (url) => {
    return ((await fetcher.get(url)).data as Rendezvous[]).map(
      (r) =>
        ({
          id: r.id,
          title: r.title,
          date: moment(r.dateTime),
          description: r.description,
          creneau: r.creneau,
          images: r.images,
          isActivated: r.isActivated,
          start: new Date(r.dateTime),
          end: moment(r.dateTime).add(1, "hours").toDate(),
          resourceId: r.creneau,
          creator: r.creator,
          payload: {
            client: r.client,
            forfait: r.forfait,
            monitor: r.monitor,
            images: r.images,
          },
          isValid: r.isValid,
        } as CalendarEvent<Payload> & {
          id: string;
          creneau: string;
          isActivated: boolean;
        })
    );
  });

  const { data: monitors } = useSWR(
    "/users/get/monitor",
    async (url) => {
      const response = await fetcher.get(url);
      return response.data as Monitor[];
    }
  );

  const dateNow = new Date();

  const closeEditEventModal = () => {
    setEditEventModalVisible(false);
  };

  useEffect(() => {
    if (data) {
      const filteredEvents = data.filter((event) => {
        return (
         !selectedMonitor || event.payload.monitor?.id === selectedMonitor.id 
        );
      });

      setRdvEvent(filteredEvents);
      setEventsToDisplay(filteredEvents.filter((event) => event.end > dateNow));
      setIsLoading(false);
    }
  }, [monitors, selectedMonitor]);

  const updateEventsToDisplay = (isCheckedExpired: boolean) => {
    if (!isCheckedExpired) {
      setEventsToDisplay(rdvEvent);
    } else {
      const filteredEvents = rdvEvent.filter((event) => event.end > new Date());
      setEventsToDisplay(filteredEvents);
    }
  };

  const handleCheckboxChange = () => {
    setIsCheckedExpired(!isCheckedExpired);
    updateEventsToDisplay(!isCheckedExpired);
  };

  const handleFilterChange = () => {
    setFilterChecked(!filterChecked);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedEventId(event.id);
  };

  const handleClosePopup = () => {
    setSelectedEvent(null);
    setSelectedEventId(null);
  };

  const eventStyleGetter = (event: Event, start, end) => {
    const monitor = event.payload.monitor;
    const isSelected = selectedEventId === event.id;
    const backgroundColor = monitor.color;

    const style = {
      backgroundColor,
      border: isSelected ? "2px solid red" : "1px solid #FFFF",
      color: "white",
      borderRadius: "0px",
      display: "block",
    };

    return { style };
  };

  if (!monitors || !data) {
    return <p>Loading...</p>;
  }

  const messages = {
    today: "Aujourd'hui",
    previous: "<",
    next: ">",
    month: "Mois",
    week: "Semaine",
    day: "Jour",
    showMore: (total) => `+ ${total} de plus`,
    allDay: "Toute la journée",
    agenda: "Agenda",
    date: "Date",
    time: "Heure",
    event: "Événement",
    noEventsInRange: "Aucun événement dans cette plage",
    monthNames: moment.monthsShort(),
  };

  return (
    <div className="h-screen flex flex-col relative">
      <div className="mb-4 flex">
        <select
          className="p-2 border border-gray-300 rounded"
          value={selectedMonitor?.id || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            setSelectedMonitor(
              monitors.find((monitor) => monitor.id === selectedId) || null
            );
          }}
        >
          <option value="0">Tous</option>
          {monitors.map((monitor) => (
            <option key={monitor.id} value={monitor.id}>
              {monitor.name}
            </option>
          ))}
        </select>
      </div>
      <span
        className="text-sm text-gray-500 cursor-pointer underline"
        onClick={handleFilterChange}
      >
        filtrer
      </span>
      {filterChecked && (
        <div className="flex gap-2 p-1 text-sm">
          <p className=" ">expiré</p>
          <input
            type="checkbox"
            className=" h-5 w-4 text-blue-500 border border-gray-300 rounded focus:ring-blue-500"
            checked={isCheckedExpired}
            onChange={handleCheckboxChange}
          />
        </div>
      )}

      <div className="flex flex-row gap-2">
        {!isLoading ? (
          <Calendar
          messages={messages}
          views={["month", "week", "day"]}
            defaultView="day"
            defaultDate={date.toDate()}
            localizer={localizer}
            culture="fr"
            events={eventsToDisplay}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            eventPropGetter={eventStyleGetter}
            style={{
              borderWidth: "1px",
              borderColor: "#ddd",
              width: "100%",
              height: "700px",
            }}
            formats={formats}  
          />
        ) : (
          <p>Aucun rendez-vous disponible</p>
        )}

        {selectedEvent && (
          <div className=" p-4 w-96 border h-72">
            <h3 className="text-lg font-bold mb-3">{selectedEvent.title}</h3>
            <p>Jour: {moment(selectedEvent.start).format("Do/MM/YY")}</p>
            <p>Creneau: {selectedEvent.resourceId}h</p>
            <p>Client: {selectedEvent.payload?.client.name}</p>
            <p>Client tél: {selectedEvent.payload?.client.phone}</p>
            <p>Employé: {selectedEvent.payload?.monitor.name}</p>
            <p>Employé tél: {selectedEvent.payload?.monitor.phone}</p>
            <p>
              Intervention: {selectedEvent.payload?.forfait.name}{" "}
              {selectedEvent.payload?.forfait.heure}h
            </p>
            <div className="flex flex-row gap-3"></div>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClosePopup}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-end">
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700  text-white font-bold py-2 px-4 rounded "
            onClick={() => {
              setEditEventModalVisible(true);
              setSelectedEvent(null);
              setSelectedEventId(null);
            }}
          >
            ajouter un rendez-vous
          </button>

          <Modal
            open={editEventModalVisible}
            onCancel={closeEditEventModal}
            okButtonProps={{ style: { display: "none" } }}
            destroyOnClose={true}
          >
            <AddRendezvous onConfirm={closeEditEventModal} data={rdvData} date={date} />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default VisionCalendar;
