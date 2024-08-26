
import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer , dateFnsLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useSWR from 'swr';
import { fetcher } from '../axios';
import { Disponibilite } from '../Disponibilite';
import { format, parse, startOfWeek, getDay } from "date-fns";
import { fr } from "date-fns/locale";


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
};
function CorpCalendar({date , onDataFromChild}:{date:any ,onDataFromChild}) {
  const [defaultDate, setDefaultDate] = useState(new Date(date));
  const {
    data: disponibilites,
    isLoading: loadingDisponibilites,
    error: errorDisponibilites,
  } = useSWR("/disponibilite/get/disponibilite", async (url) => {
    return (await fetcher.get(url)).data as Disponibilite[];
  });
  const {
    data: superposition,
    isLoading: loadingSuperposition,
    error: errorSuperposition,
  } = useSWR(`/disponibilite/get/superposition/$`, async (url) => {
    return (await fetcher.get(url)).data as Disponibilite[];
  });



  const availabilityEvents = useMemo(() => {
    if (!disponibilites) return [];

    const dayMapping = {
        "dimanche": 0,
        "lundi": 1,
        "mardi": 2,
        "mercredi": 3,
        "jeudi": 4,
        "vendredi": 5,
        "samedi": 6
    };

    const events: { title: string; start: Date; end: Date; }[] = [];
    const currentYear = moment().year();

    disponibilites.forEach(dispo => {
      
        const day = dayMapping[dispo.day[0].toLowerCase()];
      
        const [startHour, startMinute] = dispo.from.split(',');
        const [endHour, endMinute] = dispo.to.split(',');

        for (let week = 0; week < 52; week++) {
            const startDate = moment().year(currentYear).week(week + 1).day(day).hour(Number(startHour)).minute(Number(startMinute)).toDate();
            const endDate = moment().year(currentYear).week(week + 1).day(day).hour(Number(endHour)).minute(Number(endMinute)).toDate();
            
            events.push({
                title: `Disponibilité`,
                start: startDate,
                end: endDate,
            });
        }

    });
     

    return events;
}, [disponibilites]);

  const allEvents = [...availabilityEvents];

  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleEventClick = (event) => {
    const date = event.end;
    const crenaux = moment(event.start).format('HH:mm') + ' - ' + moment(event.end).format('HH:mm');
    setSelectedTime(crenaux);
    setSelectedDate(date.toISOString());
  };

  const sendDataToParent = () => {
    // const corpData = settingToSend;
    onDataFromChild(selectedDate, selectedTime);
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


  return (
    <div style={{ height: '400px' }}>
      {disponibilites && disponibilites.length > 0 ? (
        <div>
          <Calendar
            defaultDate={defaultDate}
            culture="fr"
            defaultView="week"
            views={["week"]}
            messages={messages}
            localizer={localizer}
            events={allEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "80vh", width: "100%" }}
            onSelectEvent={handleEventClick}
          />

          <div className='flex justify-end'>
            <button
              onClick={sendDataToParent}
              className='  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>confirmer
              </button>
          </div>
        </div>
      ) : (
        <p>Vérifier les disponibilités de votre entreprise</p>
      )}
    </div>
  );
}

export default CorpCalendar;
