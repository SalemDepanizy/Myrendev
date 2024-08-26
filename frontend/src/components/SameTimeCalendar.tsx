import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "../axios/index";
import {
  Calendar,
  momentLocalizer,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import moment from "moment";
import "../assets/app.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fr } from "date-fns/locale";
import { Modal, Button, Input, Select, Popover, message } from "antd";
import Toolbar from "react-big-calendar/lib/Toolbar";

const { Option } = Select;

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
interface MonitorData {
  id: string;
  day: string;
  intervals: string[];
  monitor: {
    id: string;
    name: string;
    lastname: string;
    color: string;
  };
}

type User = {
  // Define your User type here
};

type Forfait = {
  // Define your Forfait type here
};

type Monitor = {
  id: string;
  name: string;
  lastname: string;
  color: string;
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
  count?: number;
};

const CustomToolbar = (toolbar) => {
  return (
    <div className="flex justify-center">
      <div className="flex gap-5">
        <button
          className="m-2 p-2 border rounded-lg w-24 shadow-sm"
          onClick={() => toolbar.onNavigate("PREV")}
        >
          Précédent
        </button>
        <span className=" m-2 p-2">{toolbar.label}</span>
        <button
          className="m-2 p-2 border rounded-lg w-24 shadow-sm"
          onClick={() => toolbar.onNavigate("NEXT")}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

function SameTimeCalendar({
  onDataFromChild,
  inter,
  numberOfPeople,
  monitorArray,
  intervention,
}: {
  onDataFromChild: any;
  inter: any;
  numberOfPeople: number;
  monitorArray: string[];
  intervention:any,
}) {
  console.log('monitorArray',intervention.monitorId)
  const newMonitorArray = monitorArray === undefined ? [] : monitorArray.filter(item => item !== "");
  const uniqueArray = [...new Set(newMonitorArray)];
  
  // Assurer que uniqueArray contient au plus deux éléments
  if (newMonitorArray.length === 3) {
    uniqueArray.splice(1);
  } else if (newMonitorArray.length === 4) {
    uniqueArray.splice(2);
  }
  
  const monitorsChosen = monitorArray === undefined ? [] : newMonitorArray;

  if(intervention.monitorId !== "" && intervention.monitorId !== null) {
    monitorsChosen.push(intervention.monitorId);
  }
  


  // const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    role: "", // New field for the select
  });
  const [selectedMonitors, setSelectedMonitors] = useState<Monitor[]>();
  const [view, setView] = useState<string>("week");
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("week"));
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [creneau, setCreneau] = useState<string>("");
  const [chosenMonitor, setChosenMonitor] = useState<string>("");
  const [monitorsToSend, setMonitorsToSend] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const {
    data: monitorsAvailable,
    isLoading: loadingMonitorsAvailable,
    error: errorMonitorsAvailable,
    mutate: refreshMonitors,
  } = useSWR<MonitorData[]>("/users/get/availability/all", async (url) => {
    return (await fetcher.get(url))?.data;
  });

  const {
    data: monitorsSuperposition,
    isLoading: loadingmMnitorsSuperposition,
    error: errormMnitorsSuperposition,
  } = useSWR<any[]>("/disponibilite/get/superposition/all", async (url) => {
    return (await fetcher.get(url))?.data;
  });

  const mm = monitorsAvailable?.map((day) =>
    day.intervals.map((interval) => ({
      value: parseInt(interval.split(":")[0]),
    }))
  );

  const {
    data: monitors,
    mutate: refetchMonitors,
    error: errorMonitors,
  } = useSWR("/users/get/monitor", async (url) => {
    const moni = (await fetcher.get(url)).data as any[];
    return moni;
  });

  const smallestNumber = mm?.reduce((min, day) => {
    const minValue = day.reduce((subMin, interval) => {
      return Math.min(subMin, interval.value);
    }, Infinity);

    return Math.min(min, minValue);
  }, Infinity);

  const vv = monitorsAvailable?.map((day) =>
    day.intervals.map((interval) => ({
      value: parseInt(interval.split("-")[1]),
    }))
  );

  const largestNumber = vv?.reduce((max, day) => {
    const maxValue = day.reduce((subMax, interval) => {
      return Math.max(subMax, interval.value);
    }, -Infinity);

    return Math.max(max, maxValue);
  }, -Infinity);

  const {
    data: rendezvousData,
    mutate: refetchRendezvous,
    error: errorRendezvous,
  } = useSWR("/rendezvous/all", async (url) => {
    const rendezvousArray = (await fetcher.get(url)).data as Rendezvous[];
    return rendezvousArray;
  });

  const minutes = Number((inter - Math.floor(inter)).toFixed(2));
  const hours = inter.toFixed(0);
  const fullHours = Number(hours) + Number((minutes / 60) * 100);

  const despues = fullHours || 1;

  const generateAvailabilityForMonth = (month) => {
    if (monitorsAvailable && rendezvousData) {
      const dayMapping = {
        Lundi: "Monday",
        Mardi: "Tuesday",
        Mercredi: "Wednesday",
        Jeudi: "Thursday",
        Vendredi: "Friday",
        Samedi: "Saturday",
        Dimanche: "Sunday",
      };

      const mergedEvents = {};
      const startDate = month.clone().startOf("week");
      const endDate = month.clone().endOf("week");

      monitorsAvailable.forEach((day) => {
        const dayOfWeek = dayMapping[day.day];
        if (dayOfWeek) {
          const dayIntervals = day.intervals.map((interval) => {
            const [startStr, endStr] = interval.split(" - ");
            const startTime = moment.duration(startStr);
            const endTime = moment.duration(endStr);
            return { startTime, endTime };
          });

          for (
            let m = startDate.clone();
            m.isBefore(endDate);
            m.add(1, "days")
          ) {
            if (m.format("dddd") === dayOfWeek) {
              dayIntervals.forEach(({ startTime, endTime }) => {
                let currentTime = m.clone().startOf("day").add(startTime);
                let count = 0
                while (currentTime < m.clone().startOf("day").add(endTime)) {
                   
                  const nextHour = moment.min(
                    currentTime.clone().add(despues, "hour"),
                    m.clone().startOf("day").add(endTime)
                  );
                  const eventId = `${currentTime.format()} - ${nextHour.format()}`;
                  const monitorInfo = {
                    id: day.monitor.id,
                    color: day.monitor.color,
                    name: day.monitor.name + " " + day.monitor.lastname,
                  };

                  if (!mergedEvents[eventId]) {
                    mergedEvents[eventId] = {
                      id : count+=1 ,
                      start: currentTime.toDate(),
                      end: nextHour.toDate(),
                      title: "Disponible",
                      monitorIds: new Set([monitorInfo]),
                    };
                  } else {
                    mergedEvents[eventId].monitorIds.add(monitorInfo);
                  }

                  currentTime.add(despues, "hour");
                }
              });
            }
          }
        }
      });

      Object.values(mergedEvents).forEach((event: any) => {
        event.monitorIds = [...event.monitorIds].filter((monitor) => {
          if (chosenMonitor !== "") {
            if (chosenMonitor !== monitor.id) return false;
          }
          const hasSuperposition = monitorsSuperposition?.some(
            (superposition) => {
              const superpositionDays = superposition.disabledDates || []; // Ensure superposition.day is defined
              const isSuperposed =
                superposition.userId === monitor.id &&
                superpositionDays.some((superpositionDay) =>
                  moment(superpositionDay).isSame(moment(event.start), "day")
                );
              return isSuperposed;
            }
          );

          if (hasSuperposition) {
            return false; // Filter out monitors with superposition
          }

          const hasRendezvousSuperposition = rendezvousData.some((rdv) => {
            const rdvStart = moment(rdv.dateTime).subtract(1, "hour");
            const rdvEnd = moment(rdv.dateTime);
            return (
              rdv.monitor?.id === monitor.id &&
              rdvStart.isBefore(event.end) &&
              rdvEnd.isAfter(event.start)
            );
          });

          return !hasRendezvousSuperposition;
        });
      });

      // Filter out events with less than 3 monitor IDs
      const filteredEvents = Object.values(mergedEvents).filter(
        (event : any) => event.monitorIds.length >= numberOfPeople
      );

      let arrayMonitors = [];

      // console.log('filteredEvents', filteredEvents.filter(event => event.monitorIds.some(monitor => monitor.id === "cly5p9z7l0005obf915c74xdy")));
      const filterByppl = filteredEvents.filter((event: any) => {
        const monitorIds = event.monitorIds.map((monitor) => monitor.id);

        // Check if at least arrayMonitors are included in the event's monitorIds
        return monitorsChosen.every((id) => monitorIds.includes(id));
      });

      setEvents(filterByppl);
    }
  };

  useEffect(() => {
    if (monitorsAvailable && rendezvousData) {
      generateAvailabilityForMonth(currentMonth);
    }
  }, [currentMonth, monitorsAvailable, rendezvousData, chosenMonitor]);

  const handleEventClick = (event: any) => {
    
    let monitorsToSend = event.monitorIds.map((monitor: any) => monitor.id);
    setSelectedEventId(event.count);
    setMonitorsToSend(monitorsToSend);
    setSelectedMonitors(event.monitorIds);
    showModal(event);
    const endTime = moment(event.end);

    const exactHourEnd = endTime.minute() === 0 && endTime.second() === 0;
    const date = event.start.toISOString();
    setSelectedDay(date);
    setCreneau(
      moment(event.start).format("HH:m") +
        "h" +
        " - " +
        moment(event.end).format("HH:m") +
        "h"
    );
  };

  const eventStyleGetter = (event) => {
    const currentTime = new Date();
    const endSlots = event.end;
    const isExpired = currentTime > endSlots;
    const noMonitorsAvailable = event.monitorIds.length === 0;
    const singleMonitor = event.monitorIds.length === 1;
    const isSelected = selectedEventId === event.id;

    let displayStyle = {};
    let bgColor;
    let borderColor = ""; // Initialisez la bordure par défaut

    if (noMonitorsAvailable) {
      bgColor = "bg-gray-400";
      displayStyle = { display: "none" };
    } else if (singleMonitor) {
      bgColor = `bg-green-400`;
    } else {
      bgColor = "bg-green-400"; // Couleur par défaut si plusieurs moniteurs
    }

    if (isExpired) {
      bgColor = "bg-gray-500";
    }
    
    if (!isSelected) {
        borderColor =  "border  border-red-500"; // Ajoutez la bordure rouge si sélectionné
    }

    return {
      className: `${bgColor} border p-1 relative ${borderColor} ${
        noMonitorsAvailable
          ? "border-gray-500 cursor-default pointer-events-none"
          : ""
      }`,
      style: displayStyle,
    };
  };

  const EventComponent = ({ event }) => (
    <div className="flex justify-between items-center">
      <span className="flex-1">
        {event.monitorIds.length === 0
          ? "auncun employer disponible"
          : event.title}
      </span>
      <div className="flex flex-row items-center space-x-1 absolute bottom-1 right-1">
        {event.monitorIds.slice(0, 4).map((monitor, index) => (
          <Popover key={index} content={monitor.name} trigger="hover">
            <div
              key={index}
              className={`transform transition duration-500 hover:scale-125 w-2.5 h-2.5 rounded-full`}
              style={{ backgroundColor: monitor.color }}
            ></div>
          </Popover>
        ))}
        {event.monitorIds.length > 4 && <div className="">+</div>}
      </div>
    </div>
  );
  if (errorMonitorsAvailable || errorRendezvous) {
    return <div>Erreur lors du chargement des données</div>;
  }

  if (!Array.isArray(monitorsAvailable) || !Array.isArray(rendezvousData)) {
    return <div>Chargement...</div>;
  }

  // MODAL HANDLEE//

  const showModal = (event) => {
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      role: value,
    }));
  };

  const handleMonitorChange = (value) => {
    setChosenMonitor(value);
  };

  // END MODAL HANDLEE//

  //HANDLE CLIXK//

  const handleViewChange = (newView) => {
    setView(newView);
    setCurrentMonth(moment());
  };

  const handleNavigate = (date, view, action) => {
    if (view === "week") {
      if (action === "PREV") {
        setCurrentMonth((prevMonth) => moment(prevMonth).subtract(1, "week"));
      } else if (action === "NEXT") {
        setCurrentMonth((prevMonth) => moment(prevMonth).add(1, "week"));
      } else if (action === "TODAY") {
        setCurrentMonth(moment());
      }
    }
    if (view === "month") {
      if (action === "PREV") {
        setCurrentMonth((prevMonth) => moment(prevMonth).subtract(1, "month"));
      } else if (action === "NEXT") {
        setCurrentMonth((prevMonth) => moment(prevMonth).add(1, "month"));
      } else if (action === "TODAY") {
        setCurrentMonth(moment());
      }
    }
  };

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

  const sendDataToParent = () => {
    if (selectedDay !== "") {
      const closed = true;
   onDataFromChild(formData.role, selectedDay, creneau, closed, monitorsToSend);
    } else {
      message.error("Veuillez sélectionner un creneau");
    }
  };

  return (
    <div className="allInOne w-full h-1/2 ">
      {monitorsAvailable.length > 0 ? (
        <div className="mt-4">
          <Select
            placeholder="Select a role"
            style={{ width: "10%", margin: "10px" }}
            onChange={handleMonitorChange}
            value={chosenMonitor}
          >
            <Option key="all" value="">
              tous
            </Option>
            {monitors?.map((monitor) => (
              <Option key={monitor.id} value={monitor.id}>
                {monitor.name}
              </Option>
            ))}
          </Select>
          <div className="w-full  flex flex-col">
            <div className="w-full flex justify-center">
              {events.length === 0 && (
                <div
                  className="fixed top-44 flex items-center justify-center z-50 h-full"
                  style={{ width: "89.2%", maxWidth: "89.2%" }}
                >
                  <div className="absolute inset-0 bg-gray-900 opacity-0"></div>
                  <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-lg z-50">
                    <p className="text-lg text-center">
                      Aucune disponibilité pour cette semaine.
                      <br /> Cliquez sur le bouton suivant
                    </p>
                  </div>
                </div>
              )}
              <Calendar
                className="self-center "
                onView={handleViewChange}
                onNavigate={handleNavigate}
                localizer={localizer}
                defaultView={view}
                format={formats}
                min={new Date(0, 0, 0, smallestNumber ? smallestNumber - 1 : 0)}
                max={
                  new Date(
                    0,
                    0,
                    0,
                    largestNumber
                      ? largestNumber + 1 > 23
                        ? 23
                        : largestNumber + 1
                      : largestNumber
                  )
                }
                events={events || "Rien"}
                culture="fr"
                startAccessor="start"
                endAccessor="end"
                style={{ width: "100%" }}
                onSelectEvent={handleEventClick}
                eventPropGetter={eventStyleGetter}
                dayLayoutAlgorithm="no-overlap"
                components={{ event: EventComponent, toolbar: CustomToolbar }}
                step={60}
                timeslots={1}
                views={[Views.WEEK]}
                messages={messages}
                formats={formats}
              />
            </div>

            <div className="w-full flex justify-end mt-4">
              <button
                onClick={sendDataToParent}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Confirmer la sélection
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>Pas de collaborateur disponible</div>
      )}
    </div>
  );
}

export default SameTimeCalendar;
