import { cn } from "../utils";
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import "moment/locale/fr";
import { Minus, Plus } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "../axios";

export type CalendarEvent<T> = {
  title: string;
  date: moment.Moment;
  description?: string;
  payload: T;
  images?: { filename: string; rendezVousId: string }[];
};

export interface Superposition {
  disabledDates: dateTime[];
  selectedOption: string;
  id: string;
  titre: string;
}

type dateTime = string;

type EventListner<T> = (event: CalendarEvent<T>) => void;
type EventsListner<T> = (events: CalendarEvent<T>[]) => void;
type DateListner = (date: moment.Moment) => void;

class CalendarController<T> {
  eventListners: Set<{
    eventListner?: EventListner<T>;
    eventsListner?: EventsListner<T>;
    dateListner?: DateListner;
  }> = new Set();

  private _subscribe(eventListner: {
    eventListner?: EventListner<T>;
    eventsListner?: EventsListner<T>;
    dateListner?: DateListner;
  }) {
    this.eventListners.add(eventListner);

    return () => {
      this.eventListners.delete(eventListner);
    };
  }

  publish(event: CalendarEvent<T>[], date: moment.Moment) {
    this.eventListners.forEach((eventListner) => {
      if (eventListner.eventListner) {
        if (event.length > 0) {
          eventListner.eventListner(event[0]);
        }
      }
      if (eventListner.eventsListner) {
        eventListner.eventsListner(event);
      }

      if (eventListner.dateListner) {
        eventListner.dateListner(date);
      }
    });

    return this;
  }

  subscribe(eventListner: {
    eventListner?: EventListner<T>;
    eventsListner?: EventsListner<T>;
    dateListner?: DateListner;
  }) {
    useEffect(() => {
      const unsub = this._subscribe(eventListner);
      return () => {
        unsub();
      };
    }, []);
  }
}

export function createCalendarController<T>() {
  return useMemo(() => new CalendarController<T>(), []);
}

export function CalendarSpe<T = never>({
  className,
  events = [],
  controller,
  date,
  disabledDays = [],
}: {
  className?: string;
  events?: CalendarEvent<T>[];
  controller?: CalendarController<T>;
  date?: moment.Moment;
  disabledDays?: moment.Moment[];
}) {
  const months = moment.months();
  const years = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() + index
  );

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [daysInMonth, setDaysInMonth] = useState<
    { number: number; name: string; moment: moment.Moment }[]
  >([]);

  const [emptySlots, setEmptySlots] = useState<number>(0);
  const [weekDays, setWeekDays] = useState<string[]>([]);

  useEffect(() => {
    const daysArray: { number: number; name: string; moment: moment.Moment }[] =
      [];
    const daysCount = moment([selectedYear, selectedMonth]).daysInMonth();

    for (let i = 1; i <= daysCount; i++) {
      const currentMoment = moment([selectedYear, selectedMonth, i]);
      currentMoment.locale("fr");
      daysArray.push({
        number: i,
        name: currentMoment.format("ddd"), // Format day names
        moment: currentMoment,
      });
    }

    const getDays = (
      arr: { number: number; name: string; moment: moment.Moment }[]
    ) => {
      const days: string[] = [];

      arr.forEach((day) => {
        if (day.moment.weekday() !== 1 && days.length === 0) {
          return;
        }
        if (!days.includes(day.name)) {
          days.push(day.name);
        }
      });
      return days;
    };

    const days = getDays(daysArray).map((day) => day.toLowerCase());
    setWeekDays(days);

    const firstDayOfMonth = daysArray[0].name.toLowerCase();
    const emptySlots = days.indexOf(firstDayOfMonth);

    setDaysInMonth(daysArray);
    setEmptySlots(emptySlots);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const todayEvents = events.filter((event) =>
      event.date.isSame(new Date(), "day")
    );
    controller?.publish(todayEvents, moment(new Date()));
  }, []);

  useEffect(() => {
    const eventsAvailble = events.filter((event) =>
      event.date.isSame(new Date(), "day")
    );
    controller?.publish(eventsAvailble, moment(new Date()));
  }, [events.length]);

  const [selectedDay, setSelectedDay] = useState<moment.Moment | null>(null);

  const {
    data: superpositions = [],
    isLoading: loadingSuperpositions,
    error: errorSuperpositions,
  } = useSWR("/disponibilite/get/superposition", async (url) => {
    return (await fetcher.get(url)).data as Superposition[];
  });

  const disabledDates = useMemo(() => {
    const disabledDatesArray: moment.Moment[] = [];
    superpositions?.forEach((superposition, index) => {
      if (superposition.selectedOption === "toute la journée") {
        superposition.disabledDates.forEach((disabledDate: string) => {
          disabledDatesArray.push(moment(disabledDate, "DD-MM-YYYY"));
        });
      }
    });
    return disabledDatesArray;
  }, [superpositions]);

  return (
    <div className={cn("w-full  rounded-xl bg-white shadow-md h-fit", className)}>
      <div className="flex justify-between p-4">
        <select
          className="rounded-md border border-gray-300 p-2 text-gray-600 font-semibold"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <div className="flex gap-2 items-center">
          <button
            className="rounded-lg border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
                return;
              }
              setSelectedMonth(selectedMonth - 1);
            }}
          >
            <Minus size={16} />
          </button>
          <button
            className="rounded-lg  border border-gray-300 p-2 text-gray-400 h-8 w-8 hover:bg-gray-100 hover:text-gray-500"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
                return;
              }
              setSelectedMonth(selectedMonth + 1);
            }}
          >
            <Plus size={16} />
          </button>
          <button
            className="rounded-lg border border-gray-300 p-2 text-gray-400 h-8 flex items-center hover:bg-gray-100 hover:text-gray-500"
            onClick={() => {
              setSelectedMonth(new Date().getMonth());
              setSelectedYear(new Date().getFullYear());
            }}
          >
            <span className="text-gray-600 font-semibold text-sm">
              {moment(new Date()).format("DD MMM YYYY")}
            </span>
          </button>
        </div>
        <select
          className="rounded-md border border-gray-300 p-2 text-gray-600 font-semibold"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="p-4 grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm bg-gray-100 font-bold text-gray-500 text-xl capitalize"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={index}></div>
        ))}
        {daysInMonth.map((day) => {
          const eventsAvailble = events.filter((event) =>
            event.date.isSame(day.moment, "day")
          );
          const isWeekend = day.moment.day() === 0 || day.moment.day() === 6;
          const isPastDate = day.moment.isBefore(moment(), "day");
          const isDisabled = disabledDates.some((disabledDate) =>
            disabledDate.isSame(day.moment, "day")
          );

          return (
            <div
              onClick={!isDisabled ? () => {
                controller?.publish(eventsAvailble, day.moment);
                setSelectedDay(day.moment);
              } : undefined}
              key={day.number}
              className={cn(
                "p-2 border text-center h-16 w-16 flex items-center justify-center flex-col rounded-lg shadow-sm relative cursor-pointer",
                isDisabled ? "bg-gray-300 cursor-not-allowed" : "",
                day.moment.isSame(selectedDay, "day")
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "hover:bg-gray-100 hover:text-gray-500",
                day.moment.isSame(new Date(), "day") &&
                  !day.moment.isSame(selectedDay, "day")
                  ? "bg-blue-100"
                  : "",
              )}
            >
              {eventsAvailble.length > 0 && (
                <span
                  className={cn(
                    "absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold"
                  )}
                >
                  {eventsAvailble.length}
                </span>
              )}
              <span className={cn("text-sm font-bold")}>{day.number}</span>
            </div>
          );
        })}
        {Array.from({
          length: 6 - emptySlots,
        }).map((_, index) => (
          <div key={index}></div>
        ))}
      </div>
    </div>
  );
}
