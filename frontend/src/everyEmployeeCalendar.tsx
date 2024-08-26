
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import useSWR from "swr";
import { fetcher } from "./axios";
import { Monitor } from "./Moniteurs";
import { AvailabiltyResult } from "./components/Availabilty";
import { User } from "./components/auth/protect";
import Forfait from "./Forfait";
import "./assets/app.css";

const localizer = momentLocalizer(moment);

type FormattedEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  monitorId: string;
};

type Availability = {
  id: string;
  day: string;
  start: string;
  end: string;
  monitorId: string;
  fullName?: string;
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
  count?: number; // Ajout de la propriété count
};

interface Appointment {
  date: string;
  creneaux: string[];
  clients: string[][];
  email: string[][];
}

const frenchToEnglishDays = {
  Lundi: "Monday",
  Mardi: "Tuesday",
  Mercredi: "Wednesday",
  Jeudi: "Thursday",
  Vendredi: "Friday",
  Samedi: "Saturday",
  Dimanche: "Sunday",
};

const fetchAvailability = async (id, fullNames) => {
  const url = `/users/availability/${id}`;
  const result = await fetcher.get(url);
  const resultData = result.data as AvailabiltyResult;
  return resultData.data.map((item) => ({
    ...item,
    monitorId: id,
    fullName: fullNames, 
  }));
};

function Test() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [formattedEvents, setFormattedEvents] = useState<FormattedEvent[]>([]);


  const [selectedMonitorId, setSelectedMonitorId] = useState<string>("");
  const [outOfRange, setOutOfRange] = useState(false);
  const [appointmentsArray, setAppointmentsArray] = useState<
    { date: string; creneaux: string[]; clients: any; email: any }[]
  >([]);


  // PRENDRE //

  const { data: rendezvousData, mutate: refetch } = useSWR(
    "/rendezvous/all",
    async (url) => {
      const rendezvousArray = (await fetcher.get(url)).data as Rendezvous[];

      return rendezvousArray;
    }
  );

  const [freeDates, setFreeDates] = useState<string[]>([]);

  const appointment = () => {
    const filteredRendezvous = rendezvousData;
 
    
    const sameDaySameSlotMap: { [key: string]: Rendezvous[] } = {};
    let rendezvousCounter = 0;

    filteredRendezvous?.forEach((rendezVous) => {
      const formattedDate = moment(rendezVous.dateTime).format("YYYY-MM-DD"); // Formatage de la date
      const key = rendezVous.monitor?.id + rendezVous.creneau + formattedDate;

      if (!sameDaySameSlotMap[key]) {
        sameDaySameSlotMap[key] = [];
      } else {
        rendezvousCounter++;
      }
      sameDaySameSlotMap[key].push(rendezVous);
    });

    const exactlyTwoRendezvous = Object.values(sameDaySameSlotMap).filter(
      (group) => group.length === 2
    );
    const notExactlyTwoRendezvous = Object.values(sameDaySameSlotMap).filter(
      (group) => group.length < 2
    );

    if (exactlyTwoRendezvous.length > 0) {
      setOutOfRange(true);
    }

    // Ajouter une propriété "count" pour compter les rendez-vous dans chaque groupe
    exactlyTwoRendezvous.forEach((group) =>
      group.forEach((rdv) => (rdv.count = group.length))
    );

    const appointmentsByDate: { [key: string]: Set<string> } = {};
    const notAppointmentsByDate: { [key: string]: Set<string> } = {};

    exactlyTwoRendezvous.forEach((group) => {
      const date = moment(group[0].dateTime).format("YYYY-MM-DD");

      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = new Set();
      }

      group.forEach((rdv) => {
        appointmentsByDate[date].add(rdv.creneau);
      });
    });

    notExactlyTwoRendezvous.forEach((group) => {
      const date = moment(group[0].dateTime).format("YYYY-MM-DD");

      if (!notAppointmentsByDate[date]) {
        notAppointmentsByDate[date] = new Set();
      }

      group.forEach((rdv) => {
        notAppointmentsByDate[date].add(rdv.creneau);
      });
    });

    const newAppointmentsArray: Appointment[] = [];
    const freeAppointmentsArray: Appointment[] = [];

    Object.entries(appointmentsByDate).forEach(([date, creneauxSet]) => {
      const creneaux = Array.from(creneauxSet) as string[];
      newAppointmentsArray.push({
        date,
        creneaux,
        clients: exactlyTwoRendezvous
          .filter(
            (group) => moment(group[0].dateTime).format("YYYY-MM-DD") === date
          )
          .map((group) =>
            group.map((rdv) => rdv.client.name + " " + rdv.client.lastname)
          ),

        email: exactlyTwoRendezvous
          .filter(
            (group) => moment(group[0].dateTime).format("YYYY-MM-DD") === date
          )
          .map((group) => group.map((rdv) => rdv.client.email)),
      });
    });

    Object.entries(notAppointmentsByDate).forEach(([date, creneauxSet]) => {
      const creneaux = Array.from(creneauxSet) as string[];
      freeAppointmentsArray.push({
        date,
        creneaux,
        clients: [],
        email: [],
      });
    });

    setFreeDates(freeAppointmentsArray.map((free) => free.date));
    setAppointmentsArray(newAppointmentsArray);

  };

  //FIN PRENDRE//

  useEffect(() => {
    appointment(); 
  }, [rendezvousData, selectedMonitorId]);


  const fetchAllAvailabilities = useCallback(async (ids, fullNames) => {
    const promises = ids.map((id, index) => fetchAvailability(id, fullNames[index]));
    const availabilitiesArray = await Promise.all(promises);
    const flattenedAvailabilities = availabilitiesArray.flat();
    setAvailabilities(flattenedAvailabilities);
  }, []);

  useEffect(() => {
    const fetchMonitors = async () => {
      const { data: monitors } = await fetcher.get("/users/get/monitorAvail");
      return monitors;
    };

    const initialize = async () => {
      const monitors = await fetchMonitors();
      const ids = new Set(monitors.map((monitor) => monitor.id));
      const fullNames = monitors.map((monitor) => `${monitor.name} ${monitor.lastname}`);
      await fetchAllAvailabilities([...ids], fullNames);
    };

    initialize();
  }, [fetchAllAvailabilities]);

  useEffect(() => {
    const formattedEvents = availabilities.flatMap((event) => {
      const englishDay = frenchToEnglishDays[event.day];
      const startMoment = moment().isoWeekday(englishDay).startOf('day');
      const endMoment = moment().isoWeekday(englishDay).startOf('day');
      const startHourMinute = event.start.split(":");
      startMoment.hour(Number(startHourMinute[0])).minute(Number(startHourMinute[1]));
      const endHourMinute = event.end.split(":");
      endMoment.hour(Number(endHourMinute[0])).minute(Number(endHourMinute[1]));
      const events: FormattedEvent[] = [];
      while (startMoment.isSameOrBefore(moment().add(1, 'year'))) {
        let currentStartMoment = moment(startMoment);
        let currentEndMoment = moment(endMoment);
        while (currentStartMoment.isBefore(currentEndMoment)) {
          const eventEnd = moment(currentStartMoment).add(1, "hour");
          events.push({
            id: event.id,
            title: `${event.fullName}`,
            start: new Date(currentStartMoment.toDate()),
            end: new Date(eventEnd.toDate()),
           monitorId: event.monitorId,
          });
          currentStartMoment.add(1, "hour");
        }
        startMoment.add(1, "week");
        endMoment.add(1, "week");
      }
      return events;
    });
    setFormattedEvents(formattedEvents);
  }, [availabilities]);

  const handleEventClick = (event: any) => {
    console.log("Event clicked:", event);
    // Vous pouvez enregistrer les informations de l'événement ici
  };


  const eventStyleGetter = (event, isSelected) => {
    const eventDate = moment(event.start).format("YYYY-MM-DD");
    const isEventExpired = event.end < new Date();
    const backgroundStly = isEventExpired ? "lightgray" : "lightgreen";


    const eventHour =
      moment(event.start).format("HH:mm") +
      " - " +
      moment(event.end).format("HH:mm");

    const isOutOfRange = appointmentsArray.some((appointment) => {
      return appointment.creneaux.some((creneau) => {
        const [startHour, endHour] = creneau.split(" - ");
        const startMoment = moment(startHour, "HH:mm");
        const endMoment = moment(endHour, "HH:mm");

        return (
          moment(eventHour.split(" - ")[0], "HH:mm").isSameOrAfter(
            startMoment
          ) &&
          moment(eventHour.split(" - ")[1], "HH:mm").isSameOrBefore(
            endMoment
          ) &&
          moment(appointment.date).isSame(moment(eventDate), "day")
        );
      });
    });
    
    const text = "eventsTitles[eventHour]";
    if (isOutOfRange) {
      // event.title = "Événement ayant déja des rendez-vous";
      return {
        style: {
          // display: displayStyle,
          backgroundColor: "gray",
          borderRadius: "0px",
          border: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          pointerEvents: "none",
         
        },
        content: text
      };

    } else {
      return {
        style: {
          // display: displayStyle,
          backgroundColor: backgroundStly,
          color: "black",
          borderRadius: "0px",
          border: "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          pointerEvents: isEventExpired ? "none" : "auto"
        },
        content: text 
      };
    }
  };

  // const content =





  return (
    <div className=" cece w-1/2 h-full" style={{ height: 750 }}>
      <Calendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        dayLayoutAlgorithm="no-overlap"
        eventPropGetter={eventStyleGetter}
        style={{ flex: 1 }}
        onSelectEvent={handleEventClick} // Gestionnaire de clic sur l'événement
      />
    </div>
  );
}

export default Test;



