import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fr } from "date-fns/locale";
import {
  differenceInMinutes,
  format,
  parse,
  startOfWeek,
  getDay,
} from "date-fns";
import useSWR from "swr";
import { fetcher } from "../axios";
import "../assets/app.css"; // Importer le fichier CSS personnalisé
import UseRendezVous from "../useRendezVous";
import Forfait from "../Forfait";
import { Monitor } from "../Moniteurs";
import { User } from "./auth/protect";
import { CalendarEvent } from "./Calandar";
import { Modal } from "antd";
import {
  FaHourglassHalf,
  FaTimesCircle,
  FaHistory,
  FaCalendarAlt,
} from "react-icons/fa";
const locales = { fr };

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
  duration: number;
};

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  
}

interface EventReceived {
  id: string;
  title: string;
  start: Date;
  end: Date;
  creneau: string;
  description: string | null;
  resourceId: string;
  payload: {
    client: User;
    forfait: Forfait;
    monitor: Monitor;
    images?: { filename: string; rendezVousId: string }[];
  };
  isValid: boolean;
}


const ViewSelector = ({ view, handleViewChange }) => {
  return (
    <div className="flex items-center">
      <label htmlFor="view-select" className="mr-2">
        Vue:
      </label>
      <select
        id="view-select"
        value={view}
        onChange={(e) => handleViewChange(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="month">Mois</option>
        <option value="week">Semaine</option>
        <option value="day">Jour</option>
      </select>
    </div>
  );
};



const CustomToolbar = ({ toolbar, onViewChange }) => {
  const { view, onNavigate } = toolbar;

  return (
    <div className="flex justify-between">
      <div className="date-selector flex justify-center pl-20 mx-auto gap-5">
        <button className='m-2 p-2 border rounded-lg w-24 shadow-sm' onClick={() => onNavigate('PREV')}>Précédent</button>
        <span className='m-2 p-2'>{toolbar.label}</span>
        <button className='m-2 p-2 border rounded-lg w-24 shadow-sm' onClick={() => onNavigate('NEXT')}>Suivant</button>
      </div>
      
      <div className="vue-selector flex justify-end">
        <ViewSelector view={view} handleViewChange={onViewChange} />
      </div>
    </div>
  );
};



const CalendarComponent: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [duration, setDuration] = useState(0);
  const [view, setView] = useState("month");
  const [eventsToDisplay, setEventsToDisplay] = useState<any[]>([]);
  const [rdvEvent, setRdvEvent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const dateNow = new Date();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filterChecked, setFilterChecked] = useState(false);
  const [isCheckedExpired, setIsCheckedExpired] = useState(false);
  const [isCheckedFuture, setIsCheckedFuture] = useState(true);
  const [isCheckedPast, setIsCheckedPast] = useState(false);
  const [isCheckedCanceled, setIsCheckedCanceled] = useState(false);
  const [isCheckedPending, setIsCheckedPending] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);


  const { data: rdvData, mutate: refetch } = useSWR(
    "/rendezvous/all",
    async (url) => {
      try {
        const rendezvousList = (await fetcher.get(url)).data as Rendezvous[];
        const calendarEvents = rendezvousList.map((r) => {
          let durationToMinutes = r.duration * 60

          return {
            id: r.id,
            title: r.title,
            date: moment(r.dateTime),
            description: r.description,
            creneau: r.creneau,
            images: r.images,
            isActivated: r.isActivated,
            start: new Date(r.dateTime),
            end: moment(r.dateTime).add(durationToMinutes, "minutes").toDate(),
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
            isValid: boolean;
          };
        });
  
        return calendarEvents.filter(event => event !== null); // Filter out null entries
  
      } catch (error) {
        console.error("Error fetching rendezvous data:", error);
        return []; // Return empty array or handle error state as needed
      }
    }
  );

  const { data: monitors } = useSWR("/users/get/monitor", async (url) => {
    const response = await fetcher.get(url);
    return response.data as Monitor[];
  });

  const {
    data: monitorsAvailable,
    isLoading: loadingMonitorsAvailable,
    error: errorMonitorsAvailable,
    mutate: refreshMonitors,
  } = useSWR<any[]>(
    "/users/get/availability/all",
    async (url) => (await fetcher.get(url))?.data
  );

  
  const smallestNumber = monitorsAvailable
    ?.flatMap((day) => day.intervals)
    .map((interval) => parseInt(interval.split(":")[0]))
    .reduce((min, value) => Math.min(min, value), Infinity);

  useEffect(() => {
    if (rdvData) {
      const filteredEvents = rdvData.filter((event: any) => {
        const isPast = event.end < dateNow && event.isValid === true && event.isActivated === true;
        const isFuture = event.start > dateNow && event.isValid === true && event.isActivated === true;
        const isCancel = event.isActivated === false;
        const isPending = event.isValid === false;
        const shouldIncludePast = isCheckedPast && isPast;
        const shouldIncludeFuture = isCheckedFuture && isFuture;
        const shouldIncludeCanceled = isCheckedCanceled && isCancel;
        const shouldIncludePending = isCheckedPending && isPending;

        return (
          (!selectedMonitor || event.payload.monitor?.id === selectedMonitor.id) &&
          (isCheckedPast || event.end > dateNow) &&
          (shouldIncludePast || shouldIncludeFuture || shouldIncludeCanceled || shouldIncludePending || (!isCheckedPast && !isCheckedFuture && !isCheckedCanceled && !isCheckedPending))
        );
      });

      setRdvEvent(filteredEvents);
      setEventsToDisplay(filteredEvents);
      setIsLoading(false);
    }
  }, [rdvData, selectedMonitor, isCheckedExpired, isCheckedFuture, isCheckedPast, isCheckedCanceled , isCheckedPending]);

  const handleSlotSelect = (slotInfo: { start: Date; end: Date }) => {
    if (view === "month") return;
    const slotDuration = differenceInMinutes(slotInfo.end, slotInfo.start);
    setSelectedSlot({
      id: "fe",
      title: "Nouvel événement",
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setDuration(slotDuration);
  };

  const handleEventDrop = ({
    event,
    start,
    end,
  }: {
    event: Event;
    start: Date;
    end: Date;
  }) => {
    setSelectedSlot({
      ...event,
      start,
      end,
    });
  };

  const eventStyleGetter = (event: EventReceived, start, end) => {
    const monitor = event.payload.monitor;
    const isSelected = selectedEventId === event.id;
    const backgroundColor = event.isValid === false ? "orange" : monitor.color;

    const style = {
      backgroundColor,
      border: isSelected ? "2px solid red" : "1px solid #FFFF",
      color: "white",
      borderRadius: "0px",
      display: "block",
    };

    return { style };
  };

  const eventRenderer = ({ event }) => {
    const isExpired = event.end < dateNow;
    const title = isExpired ? "Expiré" : event.title + " - " + event.payload.forfait.name + " - " + event.payload.client.name + "" + event.payload.client.lastname;

    return (
      <div>
        <span>{title}</span>
        {event.isValid === false && (
          <div className="flex flex-row items-center space-x-1 absolute top-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 30 30"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    );
  };
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedEventId(event.id);
  };

  
  const handleClosePopup = () => {
    setSelectedEvent(null);
    setSelectedEventId(null);
  };


  const handleCheckboxChange = () => {
    setIsCheckedExpired((prev) => !prev);
  };


  const toggleFilter = (filter: string) => {
    // Réinitialiser tous les filtres
    setIsCheckedExpired(false);
    setIsCheckedFuture(false);
    setIsCheckedPast(false);
    setIsCheckedCanceled(false);
    setIsCheckedPending(false);
  
    // Activer le filtre sélectionné
    switch (filter) {
      case "expired":
        setIsCheckedExpired(true);
        break;
      case "future":
        setIsCheckedFuture(true);
        break;
      case "past":
        setIsCheckedPast(true);
        break;
      case "canceled":
        setIsCheckedCanceled(true);
        break;
      case "pending":
        setIsCheckedPending(true);
        break;
      default:
        break;
    }
  };
  const buttonClass = (isActive: boolean) =>
    `m-2 p-2 border rounded-lg shadow-sm align-center w-24 ${
      isActive ? "bg-gray-300" : "bg-white"
    }`;

    return (
      <div className="p-6 bg-white w-full ">
        <div className="flex justify-between items-center mb-4 gap-4">
        </div>
        <div className="flex flex-wrap justify-between gap-4 mb-4">
          <div> 
            <button
              className={buttonClass(isCheckedFuture)}
              onClick={() => toggleFilter("future")}
            >
              <FaCalendarAlt className="mr-2 text-green-600 w-full" />
              À venir
            </button>
            <button
              className={buttonClass(isCheckedPast)}
              onClick={() => toggleFilter("past")}
            >
              <FaHistory className="mr-2 text-blue-600 w-full" />
              Passés
            </button>
            <button
              className={buttonClass(isCheckedCanceled)}
              onClick={() => toggleFilter("canceled")}
            >
              <FaTimesCircle className="mr-2 text-red-600 w-full" />
              Annulés
            </button>
            <button
              className={buttonClass(isCheckedPending)}
              onClick={() => toggleFilter("pending")}
            >
              <FaHourglassHalf className="mr-2 text-orange-400 w-full " />
              En attente
            </button>
          </div>
          <div className="flex items-center">
            <label htmlFor="monitor-select" className="mr-2">
              Collaborateur:
            </label>
            <select
              id="monitor-select"
              className="p-2 border border-gray-300 rounded"
              value={selectedMonitor?.id || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedMonitor(
                  monitors?.find((monitor) => monitor.id === selectedId) || null
                );
              }}
            >
              <option value="0">Tous</option>
              {monitors?.map((monitor) => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="without-btn-view w-full">
          <Calendar
            formats={formats}
            localizer={localizer}
            events={eventsToDisplay}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSlotSelect}
            onEventDrop={handleEventDrop}
            onSelectEvent={handleEventClick}
            view={view}
            onView={setView}
            resizable
            selectable={view !== "month"}
            culture="fr"
            messages={messages}
            toolbar={true}
            style={{ height: 800, width: "100%"}}
            eventPropGetter={eventStyleGetter}
            dayLayoutAlgorithm="no-overlap"
            components={{
              event: eventRenderer,
              toolbar: (props) => <CustomToolbar toolbar={props} onViewChange={setView} />,
            }}
            min={
              new Date(
                0,
                0,
                0,
                smallestNumber? smallestNumber- 1 : 0 ,
                0
              )
            }
          />
        </div>
    
        {selectedSlot && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <UseRendezVous
              slotPackage={selectedSlot}
              date={moment(selectedSlot.start).toISOString()}
              defaultDuration={duration}
            />
          </div>
        )}
    
        <Modal
          title={selectedEvent?.title}
          open={!!selectedEvent}
          onCancel={handleClosePopup}
        >
          {selectedEvent && (
            <div>
              <p className="mb-2">Jour: {moment(selectedEvent.start).format("Do/MM/YY")}</p>
              <p className="mb-2">Créneau: {selectedEvent.creneau}</p>
              <p className="mb-2">Client: {selectedEvent.payload?.client.name}</p>
              <p className="mb-2">Client tél: {selectedEvent.payload?.client.phone}</p>
              <p className="mb-2">Mail client: <a href={`mailto:${selectedEvent.payload?.client.email}`}>{selectedEvent.payload?.client.email}</a></p>
              <p className="mb-2">Employé: {selectedEvent.payload?.monitor.name}</p>
              <p className="mb-2">Mail employé: <a href={`mailto:${selectedEvent.payload?.monitor.email}`}>{selectedEvent.payload?.monitor.email}</a></p>
              <p className="mb-2">Employé tél: {selectedEvent.payload?.monitor.phone}</p>
              <p className="mb-2">Intervention: {selectedEvent.payload?.forfait.name} - {selectedEvent.payload?.forfait.heure}h</p>
            </div>
          )}
        </Modal>
      </div>
    );
    
};

export default CalendarComponent;
