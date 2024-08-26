import { useEffect, useState } from "react";
import useSWR from "swr";
import moment from "moment";
import { fetcher } from "../../axios";
import { any } from "zod";

type Payload = {
  client: string;
  forfait: string;
  monitor: string;
};

type CalendarEvent<T> = {
  id: string;
  title: string;
  date: moment.Moment;
  description: string;
  creneau: string;
  isActivated: boolean;
  start: Date;
  end: Date;
  resourceId: string;
  creator: string;
  isValid: boolean;
  payload: T;
  enterpriseId: string;
  duration: number;
};



const DateUnavailable = (monitorId , rdvData, availability) => {

  const  data  = rdvData;
  const [similarDates, setSimilarDates] = useState<
    { date: string; events: CalendarEvent<Payload>[]; totalDuration: number }[]
  >([]);


const avail = availability
  const dayTranslations = {
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
    Sunday: "Dimanche",
  };

  const convertDayToFrench = (dayInEnglish) => {
    return dayTranslations[dayInEnglish] || "Invalid day";
  };

  function calculateTimeDifference(startTime, endTime) {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startHourToNumber = startHours + startMinutes / 60;
    const endHourToNumber = endHours + endMinutes / 60;

    const durée = endHourToNumber - startHourToNumber;

    return durée;
  }

  const availSearch = (first: any) => {
    const newTimeDifferences = {};

    if (avail) {
      Object.keys(avail).forEach((day) => {
        newTimeDifferences[day] = avail[day].intervals.map((interval) => {
          const [startTime, endTime] = interval.split(" - ");
          return calculateTimeDifference(startTime, endTime);
        });
      });

      const babaaba = Object.keys(newTimeDifferences).map((day) => {
        const totalDifference = newTimeDifferences[day].reduce(
          (acc, difference) => acc + difference,
          0
        );
        return { day, totalDifference };
      });

      const final = first.filter((item) =>
        babaaba.some(
          (baba) =>
            baba.day === item.day && baba.totalDifference === item.totalDuration
        )
      );

      const dateTaken = final.map((item) => item.date);

      return dateTaken;
    }
  };

  useEffect(() => {
    if (data) {
      const groupedByDate = data.reduce((acc, rendezvous) => {
        const dateKey = moment(rendezvous.date).format("YYYY-MM-DD");
        if (!acc[dateKey]) {
          acc[dateKey] = { events: [], totalDuration: 0 };
        }
        acc[dateKey].events.push(rendezvous);
        acc[dateKey].totalDuration += rendezvous.duration;
        return acc;
      }, {} as { [key: string]: { events: CalendarEvent<Payload>[]; totalDuration: number } });

      const filteredDates = Object.entries(groupedByDate)
        .filter(
          ([, group ]) => group.events.length >= 1 && group.totalDuration >= 1
        )
        .map(([date, group]) => ({
          date,
          events: group.events,
          totalDuration: group.totalDuration,
          day: convertDayToFrench(moment(date).format("dddd")),
        }));

      setSimilarDates(filteredDates);
    }
  }, [data]);

  const hehe = availSearch(similarDates);

  return hehe;
};

export default DateUnavailable;
