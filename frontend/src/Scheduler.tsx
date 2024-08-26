import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { addDays, format, set, setDate } from "date-fns";
import moment from "moment";
import { Monitor } from "./Moniteurs";
import useSWR from "swr";
import { fetcher } from "./axios";
import "moment/locale/fr";
import { AvailabiltyResult } from "./components/Availabilty";
import "../src/assets/app.css";
import "moment/locale/fr";
import { containerCSS } from "react-select/dist/declarations/src/components/containers";
import { CorpSetting } from "src/CorpSetting";
import { Button, Popover, message } from "antd";
import { CalendarEvent } from "./components/Calandar";
import { User } from "./components/auth/protect";
import Forfait from "./Forfait";
import "./assets/app.css";
import { Content } from "antd/es/layout/layout";
import { resourceUsage } from "process";
import { fr } from "date-fns/locale";
import SchedulerAsap from "./SchedulerAsap";
import processAppointments from './components/function/Appointment';


// moment.locale("fr");

interface Appointment {
  date: string;
  creneaux: string[];
  clients: string[][];
  email: string[][];
  monitorId: string[];
}

interface MyEvent {
  event: any;
  start: any;
  end: any;
}
interface SelectedEvent {
  id: number;
  count: number; // Assurez-vous que la propriété 'count' est définie dans l'interface SelectedEvent
  start: Date;
  end: Date;
  title: string;
  desc: string;
  // Autres propriétés...
}

interface EventData {
  id: number;
  title: string;
  start: Date;
  end: Date;
  desc: string;
}
interface Event {
  id: string;
  start: Date;
  end: Date;
  title: string;
  isSelected: boolean;
}

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
  count?: number; // Ajout de la propriété count
  payload: any;
};

interface MyCalendarState {
  hoverEventId: number | null;
}

const generateRecurringEvents = (
  startDate: Date,
  endDate: Date,
  packageValue: any,
  setting: number,
  tempsInter: number,
  superposition: string[] = []
) => {
  const minutes = Number((tempsInter - Math.floor(tempsInter)).toFixed(2));
  const hours = tempsInter.toFixed(0);
  const fullHours = Number(hours) + Number((minutes / 60) * 100);
  const events: any[] = [];
  let currentDate = new Date(startDate);

  if (endDate < startDate) {
    return events;
  }

  const skipDates = superposition
    ? superposition.map((dateStr) => new Date(dateStr))
    : [];

  while (currentDate <= endDate) {
    const shouldSkip = skipDates
      ? skipDates.some(
          (skipDate) => skipDate.toDateString() === currentDate.toDateString()
        )
      : [];

    if (!shouldSkip) {
      const dayOfWeekIndex = currentDate.getDay();
      const dayOfWeekName = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ][dayOfWeekIndex];

      if (
        packageValue.hasOwnProperty(dayOfWeekName) &&
        packageValue[dayOfWeekName].hasOwnProperty("intervals") &&
        Array.isArray(packageValue[dayOfWeekName].intervals)
      ) {
        const intervals = packageValue[dayOfWeekName].intervals;

        intervals.forEach((interval: string) => {
          const [startStr, endStr] = interval.split(" - ");
          const startTime = moment(startStr, "HH:mm");
          const endTime = moment(endStr, "HH:mm");

          let currentEventTime = startTime.clone();

          while (currentEventTime.isBefore(endTime)) {
            const nextHour = currentEventTime.clone().add(fullHours, "hour"); // Start of the next hour

            // Limit the end of the event to endTime or the end of the next hour
            const eventEndTime = moment.min(nextHour, endTime);

            const startDateTime = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              currentEventTime.hours(),
              currentEventTime.minutes()
            );

            const endDateTime = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              eventEndTime.hours(),
              eventEndTime.minutes()
            );

            events.push({
              id: events.length + 1, // Use the current length of the array + 1 as ID
              start: startDateTime,
              end: endDateTime,
              title: " ",
              isSelected: false,
              count: events.length + 1,
            });

            // Move to the next hour
            currentEventTime.add(fullHours, "hour");
          }
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return events;
};

const isEventFuture = (event: MyEvent): boolean => {
  const now = moment();
  return moment(event.start).isAfter(now);
};

moment.updateLocale("fr", {
  week: {
    dow: 1,
  },
});

const MyCalendar = ({
  reSchedule,
  forfait,
  asap,
  date,
  limiterHours,
  limiterMinutes,
  delay,
  time,
  onDataFromChild,
  onDataFromChild2,
  monitorId,
}: // rendezvousData,
{
  reSchedule: boolean;
  forfait: number;
  asap: boolean;
  date: moment.Moment;
  limiterHours: number;
  limiterMinutes: number;
  delay: string;
  time: number;
  onDataFromChild: any;
  onDataFromChild2: any;
  monitorId: string | null;
  // rendezvousData: Rendezvous[];
}) => {
  const [currentDay, setCurrentDay] = useState<Date>(date.toDate());
  const [currentDayString, setCurrentDayString] = useState<String>("");
  const localizer = momentLocalizer(moment);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor>();
  const [selectionMonitorId, setSelectionMonitorId] = useState<string|undefined>("");
  const [dayOfWeek, setDayOfWeek] = useState<string[]>([]);
  const [startWork, setStartWork] = useState<string[]>([]);
  const [packageValue, setPackageValue] = useState<any>("");
  const [clickedEvents, setClickedEvents] = useState<{
    [eventId: string]: boolean;
  }>({});
  const [creneau, setCreneau] = useState("");
  const [maybe, setMaybe] = useState(false);
  const [creneauStart, setCreneauStart] = useState("");
  const [creneauEnd, setCreneauEnd] = useState<string>("");
  const [dates, setDates] = useState<string>("");
  const [hoverEventId, setHoverEventId] = useState(null);
  const [rdvCreneau, setRdvCreneau] = useState<string[]>([]);
  const [carre, setStartCarre] = useState<string>();
  const [dateTriangle, setDateTriangle] = useState<string[]>([]);
  const [originDate, setOriginDate] = useState<Date>(new Date());
  const designedDay = "Mardi";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [setting, setSetting] = useState<number>(0);
  const [idMonitorBef, setIdMonitorBef] = useState<string>("");
  const [autoSelectedMonitor, setAutoSelectedMonitor] = useState<any>();
  const [updateCount, setUpdateCount] = useState(0); // Track the number of updates

  //APPEL//

  const { data: rendezvousData, mutate: refetch } = useSWR(
    "/rendezvous/all",
    async (url) => {
      const rendezvousArray = (await fetcher.get(url)).data as Rendezvous[];

      return rendezvousArray;
    }
  );

  const { data: availabilities, error: errorAvailabilities } = useSWR(
    "/users/get/availability/all",
    async (url) => {
      const response = await fetcher.get(url);
      return response.data as any[];
    }
  );

  // const {
  //   data: settings,
  //   isLoading: loadingSettings,
  //   error: errorSettings,
  //   mutate: refreshSettings,
  // } = useSWR("/CorpSetting/get/corpsetting", async (url) => {
  //   const SettingData = (await fetcher.get(url)).data as CorpSetting[];

  //   return SettingData;
  // });

  // useEffect(() => {
  //   if ( settings && settings.length > 0) {
  //     if (settings[0].corpData > 0) {
  //       setSetting(settings[0].corpData);
  //     }
  //   }else{
  //     setSetting(1);
  //   }
  // }, [settings]);

  const {
    data: monitors,
    isLoading: loadingMonitors,
    error: errorMonitors,
    mutate: refresh,
  } = useSWR("/users/get/monitor", async (url) => {
    const monitors = (await fetcher.get(url)).data as Monitor[];

    const searchMonitor = monitors.filter(
      (monitor) => monitor.id === monitorId
    );

    const choosenMonitor = searchMonitor[0];
    setSelectedMonitor(choosenMonitor);
    setIdMonitorBef(choosenMonitor.id);
    return monitors;
  });

  const FilterToFinCurrentMonitor = monitors?.filter(
    (monitor) => monitor.id === monitorId
  );

  const currentMonitorId = FilterToFinCurrentMonitor?.[0];


function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const dateNow = format(new Date(), "EEEE", { locale: fr });
  const dateMaintenant = capitalizeFirstLetter(dateNow);

  const availableEmployees = availabilities
    ?.filter((a) => a.day === dateMaintenant)
    ?.map((a) => a.monitorId);

  const countAppointmentsForEmployee = (monitorId: string) => {
    const appointmentsForEmployee = rendezvousData?.filter(
      (r) => r.monitor?.id === monitorId
    );
    const count = appointmentsForEmployee?.reduce((acc, cur) => {
      const appointmentDate = moment(cur.dateTime).format("YYYY-MM-DD");
      if (appointmentDate === moment().format("YYYY-MM-DD")) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return count || 0;
  };

  const employeesWithMultipleAppointments = availableEmployees?.filter(
    (monitorId) => countAppointmentsForEmployee(monitorId) >= 2
  );

  // Filter monitors based on appointments criteria
  const euh = monitors?.filter((monitor) => {
    return (
      employeesWithMultipleAppointments &&
      !employeesWithMultipleAppointments.includes(monitor.id) // Assuming monitor.id is a string
    );
  });

  const euhIds = euh?.map((e) => e.id);

  const tesd = availabilities?.filter((a) => {
    // Vérifiez si le jour et l'ID du moniteur correspondent à une des valeurs de euhIds
    return a.day === dateMaintenant && euhIds?.includes(a.monitorId);
  });

  const monitorIds = tesd?.map((a) => a.monitorId);

  const dispEmplee = monitors?.filter((monitor) => {
    // Assuming monitorIds is an array of strings
    return monitorIds?.includes(monitor.id);
  });


  useEffect(() => {
    if (dispEmplee && dispEmplee[currentIndex]) {
      setAutoSelectedMonitor(dispEmplee[currentIndex]);
      setIdMonitorBef(dispEmplee[currentIndex].id);
    }
  }, [dispEmplee, currentIndex]);

  const { data, error, isLoading } = useSWR(
    `/users/availability/${monitorId ? monitorId : idMonitorBef}`,
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
    data: disponibilites = [],
    isLoading: loadingDisponibilites,
    error: errorDisponibilites,
  } = useSWR("/disponibilite/get/disponibilite", async (url) => {
    return (await fetcher.get(url)).data as any[];
  });

  // Nouvelle array avec tous les jours de disponibilites
  const joursDisponibilites = disponibilites.map(
    (disponibilite) => disponibilite.day
  );

  // Concaténer les arrays imbriquées
  const concatJour = joursDisponibilites.reduce(
    (acc, curr) => acc.concat(curr),
    []
  );

  // Transformer les jours en numéros correspondants (0 pour dimanche, 1 pour lundi, etc.)
  const joursNumeros = concatJour.map((jour) => {
    switch (jour.toLowerCase()) {
      case "dimanche":
        return 0;
      case "lundi":
        return 1;
      case "mardi":
        return 2;
      case "mercredi":
        return 3;
      case "jeudi":
        return 4;
      case "vendredi":
        return 5;
      case "samedi":
        return 6;
      default:
        return -1; // en cas d'erreur ou de jour non reconnu
    }
  });

  const referenceYear = new Date().getFullYear();

  // Liste des jours fériés en France en ISO string
  const joursFeries = [
    `${referenceYear}-01-01`, // Nouvel An - 1er janvier
    `${referenceYear}-05-01`, // Fête du Travail - 1er mai
    `${referenceYear}-05-08`, // Victoire 1945 - 8 mai
    `${referenceYear}-07-14`, // Fête Nationale - 14 juillet
    `${referenceYear}-08-15`, // Assomption - 15 août
    `${referenceYear}-11-01`, // Toussaint - 1er novembre
    `${referenceYear}-11-11`, // Armistice 1918 - 11 novembre
    `${referenceYear}-12-25`, // Noël - 25 décembre
  ];

  // Fonction pour vérifier si une date est un jour férié en France
  const isHolidayFr = (date) => {
    const isoDate = moment(date).format("YYYY-MM-DD");
    return joursFeries.includes(isoDate);
  };

  const customDayPropGetter2 = (date: Date) => {
    return !joursNumeros.includes(date.getDay());
  };

  //offDays//

  const semaine = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  const jours: string[] = [];

  useEffect(() => {
    if (data !== undefined) {
      for (const day in data) {
        jours.push(day);
      }
    }
  }, [data]);

  const defaultJours = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  const [days, setDays] = useState<string[]>(defaultJours);

  useEffect(() => {
    if (jours.length > 0) {
      setDays(jours);
    }
  }, [jours]);

  const [includedNumbers, setIncludedNumbers] = useState<number[]>([]);
  const [closedDays, setClosedDays] = useState<number[]>([]);
  const [closedDayOneSeven, setClosedDayOneSeven] = useState<number[]>([]);

  useEffect(() => {
    const newNumbers: number[] = [];
    semaine.forEach((jour, index) => {
      if (days.includes(jour)) {
        newNumbers.push(index + 1);
      }
    });
    setIncludedNumbers(newNumbers);
  }, [days]);

  useEffect(() => {
    const newClosedDays: number[] = [];
    semaine.forEach((jour, index) => {
      if (!days.includes(jour)) {
        const dayNumber = index + 1 === 7 ? 0 : index + 1;
        newClosedDays.push(dayNumber);
      }
    });
    setClosedDays(newClosedDays);

    if (newClosedDays.includes(0)) {
      // Trouve l'index de l'élément 0
      const index = newClosedDays.indexOf(0);

      // Remplace l'élément 0 par 7
      newClosedDays[index] = 7;
      
      if(newClosedDays.includes(7)){
        newClosedDays.push(0);
      }

      // Utilisez newClosedDays modifié ici ou faites autre chose avec

      setClosedDayOneSeven(newClosedDays);
    }
  }, [days]);

  const filterDaysH = (date: Date, filterDaysArray) => {

    return !filterDaysArray.includes(date.getDay());
  };

  //endoffdays/
  // useEffect(() => {
  //   if (data) {
  //     setPackageValue(data);
  //   }
  // }, [data]);

  useEffect(() => {
    if (data) {
      const keys = Object.keys(data);
      setDayOfWeek(keys);
      setPackageValue(data);
    }
  }, [data]);

  useEffect(() => {
    if (data && delay === "semaine") {
      const keys = Object.keys(data);
      keys.forEach((key) => {
        const value = data[key];

        const formattedValue =
          typeof value === "object" ? JSON.stringify(value) : value;
      });
    }
  }, [data]);

  const startDate = new Date(); // Définir la date de début
  const endDate = addDays(startDate, 365); // Définir la date de fin (365 jours plus tard)

  const tempsInter = forfait;

  const { data: superposition, error: errorSuperposotion } = useSWR(
    `/disponibilite/get/superposition/${monitorId ? monitorId : idMonitorBef}`,
    async (url) => {
      const response = await fetcher.get(url);
      const arrays = response.data as any[]; // Supposons que response.data soit un tableau d'arrays
      const mergedDisabledDates = arrays.reduce((accumulator, currentArray) => {
        if (currentArray.disabledDates) {
          accumulator.push(...currentArray.disabledDates);
        }
        return accumulator;
      }, []);
      return mergedDisabledDates;
    }
  );

  const recurringEvents = generateRecurringEvents(
    startDate,
    endDate,
    packageValue,
    setting,
    tempsInter,
    superposition
  );

  //OffRange//
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>("");
  const [outOfRange, setOutOfRange] = useState(false);
  const [appointmentsArray, setAppointmentsArray] = useState<
    {
      date: string;
      creneaux: string[];
      clients: any;
      email: any;
      monitorId: any;
    }[]
  >([]);
  const [appointmentsArraySolo, setAppointmentsArraySolo] = useState<
    {
      date: string;
      creneaux: string[];
      clients: any;
      email: any;
      monitorId: any;
    }[]
  >([]);

  useEffect(() => {
    if (selectedMonitor) {
      setSelectedMonitorId(selectedMonitor.id);

    }
  }, [selectedMonitor]);

  // PRENDRE //

  const [freeDates, setFreeDates] = useState<any[]>([]);  

  useEffect(() => {

    if (rendezvousData && currentMonitorId) {
      const {
        newAppointmentsArray,
        newAppointmentsArraySolo,
        freeAppointmentsArray,
        exactlyTwoRendezvous,
      } = processAppointments(rendezvousData, currentMonitorId);

      setAppointmentsArray(newAppointmentsArray);
      setAppointmentsArraySolo(newAppointmentsArraySolo);
      setFreeDates(freeAppointmentsArray);

    }
  }, [rendezvousData, currentMonitorId]);

  const vreel = () => {
    if (recurringEvents.length > 0) {
      const datesTriangle = recurringEvents.map((event) =>
        moment(event.start).format("YYYY-MM-DD")
      );

      if (datesTriangle.join(",") !== dateTriangle.join(",")) {
        setDateTriangle(datesTriangle);
      }
    } else {
      if (dateTriangle.length !== 0) {
        setDateTriangle([]);
      }
    }
  };

  useEffect(() => {
    vreel();
  }, [rendezvousData, selectedMonitor, recurringEvents]);

  //sort//

  function comparerDates(a, b) {
    // Convertir les chaînes de caractères en objets Date pour la comparaison
    var dateA = new Date(a);
    var dateB = new Date(b);

    // Comparer les dates et renvoyer le résultat
    if (dateA < dateB) {
      return -1;
    } else if (dateA > dateB) {
      return 1;
    } else {
      return 0;
    }
  }

  let today = moment();
  let formattedDate = today.format("YYYY-MM-DD");

  const dynamiqueDates = freeDates.filter((date) =>
    moment(date, "YYYY-MM-DD").isSameOrAfter(formattedDate, "day")
  );

  dynamiqueDates.sort(comparerDates);

  const [firstIteration, setFirstIteration] = useState<string>("");

  useEffect(() => {
    if (dynamiqueDates.length > 0) {
      setFirstIteration(dynamiqueDates[0]);
    }
  });

  //Le plus vite possible logique//
  const futureEventsToday = recurringEvents.filter(
    (event) => moment().isSame(event.start, "day") && isEventFuture(event)
  );

  const [modalVerifer, setModalVerifer] = useState(false);

  const calculus = () => {
    const bleurgh = appointmentsArray.map((entry) => entry.date);

    let limit = moment(currentDay);
    let formattedLimit = limit.format("YYYY-MM-DD");

    const reer = bleurgh.filter((date) =>
      moment(date, "YYYY-MM-DD").isSameOrAfter(formattedDate, "day")
    );

    let datesAbsentes = dateTriangle.filter((date) => !reer.includes(date));
    datesAbsentes = datesAbsentes.filter((date) =>
      moment(date).isSameOrAfter(formattedLimit)
    );

    const filteredDatesAbsentes = datesAbsentes.filter((date) =>
      moment(date, "YYYY-MM-DD").isSameOrAfter(formattedDate, "day")
    );

    let filteredDates = filteredDatesAbsentes;

    const dateAsap = new Date(filteredDates[0]);

    if (dateAsap) {
      setOriginDate(dateAsap);
    }
  };

  useEffect(() => {
    calculus();
  }, [appointmentsArray, currentDay, dateTriangle]);

  ////

  const [selectedEvents, setSelectedEvents] = useState<SelectedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isItTheSameDay, setIsItTheSameDay] = useState(false);
  const [startToEnd, setStartToEnd] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const intervention = forfait;
  const eventSettings = setting;
  const tobe = intervention / eventSettings;
  let eventSelectedLenght = Math.ceil(tobe);

  const [newTypeSlot, setNewTypeSlot] = useState<string>("");

  const handleEventClick = (
    event: any,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const endAsMoment = moment(event.end);
    const endAsString = endAsMoment.toISOString();
    setSelectedEventId(event.count);

    setDates(endAsString);

    const dateStart = new Date(event.start);
    var date = new Date(event.start);
    var heure = date.getHours();
    var minutes = date.getMinutes();
    var cstart = heure + ":" + minutes;
    setCreneauStart(cstart);

    var date = new Date(event.end);
    var heure = date.getHours();
    var minutes = date.getMinutes();
    const cend = heure + ":" + minutes;
    setCreneauEnd(cend);
    setMaybe(!maybe);

    const eventsToSelect = [event];

    const formattedEvents = eventsToSelect.map((event) => {
      const firstEvent = moment(event.start).format("HH:mm");
      const lastEvent = moment(event.end).format("HH:mm");

      if (moment().isAfter(moment(event.start))) {
        message.warning("Cet horaire est en cours");
      }
      return { firstEvent, lastEvent };
    });

    // Vérification des écarts entre firstEvent et lastEvent
    for (const event of formattedEvents) {
      const firstMoment = moment(event.firstEvent, "HH:mm");
      const lastMoment = moment(event.lastEvent, "HH:mm");
      const durationHours = moment
        .duration(lastMoment.diff(firstMoment))
        .asHours();

      // Comparaison de la durée
      if (durationHours < tempsInter) {
        setStartToEnd(true);
      } else {
        setStartToEnd(false);
      }
    }
    if (eventSelectedLenght > 1) {
      setSelectedEvents(eventsToSelect);
    }
  };

  useEffect(() => {
    const eventStartEndStrings = selectedEvents.map((event) => {
      const startString = event.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endString = event.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${startString} - ${endString}`;
    });
    const eventStartEndString = eventStartEndStrings.join(", ");

    setNewTypeSlot(eventStartEndString);
  });

  const [dateTc, setDateTc] = useState("");

  useEffect(() => {
    // setCreneau(creneauStart + "h" + " - " + creneauEnd + "h");
    let trueStart = moment(creneauStart, "HH:mm").format("HH:mm");
    let trueEnd = moment(creneauEnd, "HH:mm").format("HH:mm");
    setCreneau(trueStart + " - " + trueEnd);
    const vDate = dates.split("T")[0];
    setDateTc(vDate);
    
  }, [creneauStart, creneauEnd, dates]);

  const [closed, setClosed] = useState(true);
  const [errorMessage, setErrorMessage] = useState(false);

  const sendDataToParent = () => {
    if (creneau !== "" && selectedEvents.length > 0) {
      const creneauToSend = creneau;

      onDataFromChild(creneauToSend, dates, closed, reSchedule, idMonitorBef);
    } else {
      setErrorMessage(true);
    }
  };

  const [defaultDate, setDefaultDate] = useState<Date>(new Date(currentDay));

  useEffect(() => {
    const newDate = new Date(defaultDate); // Crée une nouvelle instance de Date
    if (delay === "jours") {
      newDate.setDate(newDate.getDate() + Number(time));
    } else if (delay === "semaines") {
      newDate.setDate(newDate.getDate() + Number(time) * 7);
    }
    setDefaultDate(newDate); // Met à jour la date par défaut
  }, [delay, time]);

  const [endHourLastEvent, setEndHourLastEvent] = useState<number | undefined>(
    undefined
  );

  const [currentDate, setCurrentDate] = useState(defaultDate);



  const handleNavigate = (date, view, action) => {
    let newDate = new Date(date);

    switch (action) {
      case "TODAY":
        setCurrentDate(new Date());
        break;
      case "PREV":
      case "PREVIOUS":
        while (closedDayOneSeven.includes(newDate.getDay()) || superposition.find(skipDate => moment(skipDate).isSame(newDate, 'day'))) {
          newDate.setDate(newDate.getDate() - 1);
        }

        break;
      case "NEXT":
        while (closedDayOneSeven.includes(newDate.getDay()) || superposition.find(skipDate => moment(skipDate).isSame(newDate, 'day'))) {
          newDate.setDate(newDate.getDate() + 1);
        }

        break;
      default:
        break;
    }

    // Check if the new date falls on a closed day
    if (closedDayOneSeven.includes(newDate.getDay())) {
      while (closedDayOneSeven.includes(newDate.getDay())) {
        newDate.setDate(newDate.getDate() + 1);
      }
    }

    setDefaultDate(newDate);
  };

  useEffect(() => {
    if (recurringEvents.length > 0) {
      const todayEvents = recurringEvents.filter((event) =>
        moment(event.start).isSame(currentDay, "day")
      );
      if (todayEvents.length > 0) {
        const lastEventOfTheDay = todayEvents.reduce((prev, current) =>
          moment(prev.end).isAfter(current.end) ? prev : current
        );
        const endHour = moment(lastEventOfTheDay.end).hour();
        if (endHour + 2 >= 23) {
          setEndHourLastEvent(endHour - endHour + 23);
        } else {
          setEndHourLastEvent(endHour + 2);
        }
      }
    }
  }, [recurringEvents, currentDay]);

  const [openHour, setOpenHour] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (recurringEvents.length > 0) {
      const todayEvents = recurringEvents.filter((event) =>
        moment(event.start).isSame(currentDay, "day")
      );
      if (todayEvents.length > 0) {
        todayEvents.sort((a, b) => moment(a.start).diff(moment(b.start)));

        const firstEventOfTheDay = todayEvents[0];

        if (firstEventOfTheDay) {
          const startHour = moment(firstEventOfTheDay.start).hour();

          if (startHour - 1 <= 2) {
            setOpenHour(startHour + 2);
          } else {
            setOpenHour(startHour - 1);
          }
        }
      }
    }
  }, [recurringEvents, currentDay]);

  useEffect(() => {
    if (delay === "semaines") {
      setEndHourLastEvent(23);
      setOpenHour(4);
    }
  });

  const [view, setView] = useState(
    delay === " " || delay === "jours" ? Views.DAY : Views.WEEK
  );

  const onView = useCallback((newView) => setView(newView), [setView]);

  // FORMAT CALENDAR///

  const frenchDaysOfWeek = {
    Sunday: "Dimanche",
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
  };
  const frenchMonths = {
    January: "Janvier",
    February: "Février",
    March: "Mars",
    April: "Avril",
    May: "Mai",
    June: "Juin",
    July: "Juillet",
    August: "Août",
    September: "Septembre",
    October: "Octobre",
    November: "Novembre",
    December: "Décembre",
  };

  const formats = useMemo(
    () => ({
      weekdayFormat: (date, culture, localizer) => {
        const englishDayOfWeek = localizer.format(date, "dddd", culture);

        return frenchDaysOfWeek[englishDayOfWeek];
      },
      dayFormat: (date, culture, localizer) => {
        const englishDayOfWeek = localizer.format(date, "dddd", culture);

        const translatedDay = frenchDaysOfWeek[englishDayOfWeek];

        const dayOfMonth = localizer.format(date, "D", culture);

        return `${translatedDay} ${dayOfMonth}`;
      },

      monthHeaderFormat: (date, culture, localizer) => {
        const englishMonth = localizer.format(date, "MMMM", culture);
        const year = localizer.format(date, "YYYY", culture);
        const frenchMonth = frenchMonths[englishMonth];
        return `${frenchMonth} ${year}`;
      },

      dayHeaderFormat: (date, culture, localizer) => {
        const englishDayOfWeek = localizer.format(date, "dddd", culture);
        const day = frenchDaysOfWeek[englishDayOfWeek];
        const englishMonth = localizer.format(date, "MMMM", culture);
        const month = frenchMonths[englishMonth];
        const dayOfMonth = localizer.format(date, "D", culture);

        return `${day}  ${dayOfMonth}  ${month}`;
      },
      weekHeaderFormat: (date, culture, localizer) => {
        const englishDayOfWeek = localizer.format(date, "dddd", culture);

        return frenchDaysOfWeek[englishDayOfWeek];
      },
      timeGutterFormat: "HH:mm",
      eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
        localizer.format(start, "HH:mm", culture) +
        " - " +
        localizer.format(end, "HH:mm", culture),

      dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
        const frenchMonths = {
          January: "janvier",
          February: "février",
          March: "mars",
          April: "avril",
          May: "mai",
          June: "juin",
          July: "juillet",
          August: "août",
          September: "septembre",
          October: "octobre",
          November: "novembre",
          December: "décembre",
        };
        const formattedStart = localizer.format(start, "D MMMM YYYY", culture);
        const formattedEnd = localizer.format(end, "D MMMM YYYY", culture);
        const frenchStartMonth =
          frenchMonths[localizer.format(start, "MMMM", culture)];
        const frenchEndMonth =
          frenchMonths[localizer.format(end, "MMMM", culture)];

        return `${formattedStart.replace(
          localizer.format(start, "MMMM", culture),
          frenchStartMonth
        )} - ${formattedEnd.replace(
          localizer.format(end, "MMMM", culture),
          frenchEndMonth
        )}`;
      },

      agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
        localizer.format(start, "HH:mm", culture) +
        " - " +
        localizer.format(end, "HH:mm", culture),
      agendaDateFormat: ({ start }, culture, localizer) =>
        localizer.format(start, "D MMMM YYYY", culture),
    }),
    []
  );

  //Style//

  const eventStyleGetter = (event) => {
    const eventDate = moment(event.start).format("YYYY-MM-DD");
    const isEventExpired = event.end < new Date();
    //  const isUnAllowed = appointmentsArray.map((appointment) => {
    //    appointment.monitorId.lenght >=  2
    //  })
    
    const isEventExpiredMin = event.end < new Date(0, 0, 0, 13);
    const isSelected = selectedEventId === event.id;
    const backgroundStly = isEventExpired ? "lightgray" :  "lightgreen";
    const displayStly = isEventExpiredMin ? "none" : "block";
    let bgColor: Monitor[] = [];

    const eventHour =
      moment(event.start).format("HH:mm") +
      " - " +
      moment(event.end).format("HH:mm");

    const isOutOfRange = appointmentsArray.some((appointment) => {
      if (monitors ) {
        const filteredMonitors = monitors.filter(
          (monitor) => monitor.id === appointment.monitorId[0]
        );
        bgColor = filteredMonitors;
      }
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

    const isOutOfRange2 = appointmentsArraySolo.some((appointment) => {
      if (monitors) {
        const filteredMonitors = monitors.filter(
          (monitor) => monitor.id === appointment.monitorId[0]
        );
        bgColor = filteredMonitors;
      }

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

    if (isOutOfRange2) {
      return {
        style: {
          backgroundColor: bgColor?.length > 0 ? bgColor[0].color : "lightgray",
          borderRadius: "0px",
          border: isSelected ? "2px solid red" : "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          color: "white",
          
        },
      };
    }

    if (isOutOfRange) {
      // event.title = "Événement ayant déja des rendez-vous";
      return {
        style: {
          // display: displayStyle,
          backgroundColor: "gray",
          borderRadius: "0px",
          border: isSelected ? "2px solid red" : "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          color: "white",
          pointerEvents: "none",
        },
        title: "fefefe",
        content: text,
      };
    } else {
      return {
        style: {
          // display: displayStyle,
          backgroundColor: backgroundStly,
          display: displayStly,
          color: "black",
          borderRadius: "0px",
          border: isSelected ? "2px solid red" : "none",
          borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          pointerEvents: isEventExpired ? "none" : "auto",
        },
        content: text,
      };
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

  const components = {
    eventWrapper: ({ event, children }) => {
      const startDate = moment(event.start).format("YYYY-MM-DD");
      // setYaouha(startDate);
      const endDate = moment(event.end).format("YYYY-MM-DD");

      let dateText;

      if (startDate === endDate) {
        dateText = moment(event.start).format("YYYY-MM-DD");
      } else {
        dateText = `${moment(event.start).format("YYYY-MM-DD")} - ${moment(
          event.end
        ).format("YYYY-MM-DD")}`;
      }

      let count = 0;
      const [modalIsOpen, setModalIsOpen] = useState(false);

      const openModal = () => {
        setModalIsOpen(true);
      };

      const closeModal = () => {
        setModalIsOpen(false);
        onDataFromChild2(true);
      };

      useEffect(() => {
        if (modalVerifer === true && delay === " ") {
          openModal();
        }
      }, [delay]);

      return (
        <div>
          <div>{children}</div>
        </div>
      );
    },
  };

  const [datesToDisplay, setDatesToDisplay] = useState("");
  const dateHeure = dates;
  const dateObj = new Date(dateHeure);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateFormatee = dateObj.toLocaleDateString("fr-FR", options);

  useEffect(() => {
    setDatesToDisplay(dateFormatee);
  });

  //ASAP//

  useEffect(() => {
    if (asap) {
      setDefaultDate(currentDay);
    }
  });

  // 2weeksopt//

  const [showSecondCalendar, setShowSecondCalendar] = useState(false);
  const toggleSecondCalendar = () => {
    setShowSecondCalendar(!showSecondCalendar);
  };

  const [dateToStart, setDateToStart] = useState<Date>();
  useEffect(() => {
    if (firstIteration && asap) {
      let beeheh = moment(firstIteration);

      setDateToStart(beeheh.toDate());
    }
  }, [firstIteration]);

  useEffect(() => {
    // Ensure this effect runs only when startToEnd changes
    if (startToEnd === true) {
      setCreneau(""); // This is fine if within a conditional effect
    }
  }); // Dependency array to control when this effect runs

  return (
    <div className="flex flex-col ">
      <div className="">
        <h1 className="text-center text-lg font-bold uppercase mb-1">
          {selectedMonitor?.name}
        </h1>
        {creneauStart && creneauEnd && (
          <div className="flex items-center justify-center">
            <h2 className="text-center text-lg font-weight-bold uppercase m-auto">
              Créneau choisis : {creneau}
            </h2>
          </div>
        )}
      </div>
      <div className="flex ">
        {endHourLastEvent !== undefined && openHour !== undefined && !asap && (
          <div className="w-full h-5/6">
            <div>
              {selectedEvents.length < eventSelectedLenght ? (
                <div className="flex items-center justify-center">
                  <p className="text-center text-lg font-weight-bold uppercase mb-1">
                    Veuillez sélectionner un créneau
                  </p>
                </div>
              ) : null}
              {startToEnd === true ? (
                <div>
                  <p className="text-center  font-weight-bold  mb-1 text-red-500">
                    Merci de choisir un horaire qui convient à l'intervention.{" "}
                  </p>
                </div>
              ) : null}
              {isItTheSameDay === true ? (
                <div>
                  <p className="text-center  font-weight-bold  mb-1 text-red-500">
                    {" "}
                    sélectionner un créneau le meme jours
                  </p>
                </div>
              ) : null}
            </div>
            {availabilities ? (
              <div>
                <Calendar
                  onView={onView}
                  view={view}
                  views={["month", "week", "day"]}
                  localizer={localizer}
                  events={recurringEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "65vh", width: "100%" }}
                  culture="fr"
                  selectable
                  defaultDate={defaultDate}
                  min={
                    new Date(
                      0,
                      0,
                      0,
                      limiterHours || openHour,
                      limiterMinutes || 0
                    )
                  }
                  max={new Date(0, 0, 0, endHourLastEvent, 0)}
                  messages={messages}
                  formats={formats}
                  components={components}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleEventClick}
                  dayLayoutAlgorithm="no-overlap"
                  dayPropGetter={(date) => ({
                    style: {
                      background:
                        customDayPropGetter2(date) || isHolidayFr(date)
                          ? ""
                          : "#D3D3D3",
                    },
                  })}
                  date={defaultDate}
                  onNavigate={handleNavigate}
                />
              </div>
            ) : (
              <div>Pas de rere disponible</div>
            )}
          </div>
        )}
      </div>
      <div>
        {asap && recurringEvents.length > 0 ? (
          <div>
            {selectedEvents.length < eventSelectedLenght ? (
              <div className="flex items-center justify-center">
                <p className="text-center text-lg font-weight-bold uppercase mb-1">
                  Veuillez sélectionner un créneau
                </p>
              </div>
            ) : null}
            {startToEnd === true ? (
              <div>
                <p className="text-center  font-weight-bold  mb-1 text-red-500">
                  Merci de choisir un horaire qui convient à l'intervention.{" "}
                </p>
              </div>
            ) : null}
            <SchedulerAsap
             formats={formats}
             messages={messages}
             components={components}
             eventPropGetter={eventStyleGetter}
             onSelectEvent={handleEventClick}
             localizer={localizer}
             events={recurringEvents}
             filterDaysH={filterDaysH}
             limiterHours={limiterHours}
             closedDayOneSeven={closedDayOneSeven}
             monitor={monitorId}
             rdvData={rendezvousData}
             availability={data}
            />
          </div>
        ) : (
          <div className="text-center"></div>
        )}
      </div>

      {endHourLastEvent === undefined &&
        openHour === undefined &&
        asap === false &&
        availabilities &&
        //  availabilities?.length > 0 &&
         (
          <div>
            <p className=" text-center text-md bold mb-1">
              Aucune disponibilité pour ce jour mais voici les disponibilités
              suivantes les plus proches
            </p>

            <SchedulerAsap
         
              formats={formats}
              messages={messages}
              components={components}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              localizer={localizer}
              events={recurringEvents}
              filterDaysH={filterDaysH}
              limiterHours={limiterHours}
              closedDayOneSeven={closedDayOneSeven}
              monitor={monitorId}
              rdvData={rendezvousData}
              availability={data}
            />
          </div>
        )}

      {errorMessage && (
        <p className="text-red-500 text-center text-md font-weight-bold  mb-1">
          Veuillez choisir un creneau
        </p>
      )}
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={sendDataToParent}
        >
          confirmer
        </button>
      </div>
    </div>
  );
};

export default MyCalendar;
