"use client";

import { useMemo, useState } from "react";
import { cn, dayNames } from "./lib/utils";
import {
  add,
  addDays,
  addHours,
  eachDayOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  isSameMonth,
  isThisMonth,
  isToday,
  parse,
  parseISO,
  set,
  startOfDay,
  startOfToday,
  startOfWeek,
  startOfYesterday,
} from "date-fns";
// import { Inter } from "next/font/google";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import AvailableHours from "./components/hours";
import TimesBar from "./components/timesBar";
import Button from "./components/Button";

// const inter = Inter({ subsets: ["latin"], weight: "400" });

const reservations = [
  addHours(startOfToday(), 5).toString(),
  addHours(startOfToday(), 6).toString(),
  addHours(startOfToday(), 7).toString(),
  addHours(startOfToday(), 8).toString(),
  addHours(startOfToday(), 9).toString(),
  addDays(new Date(addHours(startOfToday(), 4)), 3).toString(),
];

export default function Home() {
  // Affiche la div des heures disponibles
  const [calendarTouched, setCalendarTouched] = useState<boolean>(false);

  // Gérer les dates
  let today = startOfToday();
  let [currentMonth, setCurrentMonth] = useState<string>(
    format(today, "MMM-yyyy")
  );
  let [selectedDay, setSelectedDay] = useState<Date>(today);
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  let days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(firstDayCurrentMonth, { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth), { weekStartsOn: 1 }),
      }),
    [firstDayCurrentMonth]
  );

  // Toutes les heures disponibles de ce mois jusqu'à ce que vous le changiez
  const [availableTimesInThisMonth, setAvailableTimesInThisMonth] = useState<
    number[]
  >([]);
  const [
    availableTimesInThisMonthForEachDay,
    setAvailableTimesInThisMonthForEachDay,
  ] = useState<Date[][]>([]);

  // Fonctions de mois précédent et suivant
  function prevMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }
  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  // Obtenir les heures disponibles pour le jour sélectionné
  const freeTimes = useMemo(() => {
    const StartOfToday = startOfDay(selectedDay);
    const endOfToday = endOfDay(selectedDay);
    // Changez vos heures de travail ici
    const startHour = set(StartOfToday, { hours: 1 });
    const endHour = set(endOfToday, { hours: 17, minutes: 45 });
    let hoursInDay = eachMinuteOfInterval(
      {
        start: startHour,
        end: endHour,
      },
      { step: 15 }
    );

    // Filtrer les heures disponibles
    let freeTimes = hoursInDay.filter(
      (hour) => !reservations.includes(parseISO(hour.toISOString()).toString())
    );

    return freeTimes;
  }, [selectedDay]);

  // Calculer le nombre d'heures disponibles pour chaque jour de ce mois
  useMemo(() => {
    let thisMonthTimesLength: number[] = [];
    let thisMonthTimesEachDay: Date[][] = [];
    days.map((day, dayIdx) => {
      // Obtenir les heures

      const StartOfToday = startOfDay(day);
      const endOfToday = endOfDay(day);
      // Changez vos heures de travail ici
      const startHour = set(StartOfToday, { hours: 1 });
      const endHour = set(endOfToday, { hours: 17, minutes: 45 });
      let hoursInDay = eachMinuteOfInterval(
        {
          start: startHour,
          end: endHour,
        },
        { step: 15 }
      );
      // Filtrer les heures disponibles
      let freeTimes = hoursInDay.filter(
        (hour) =>
          !reservations.includes(parseISO(hour.toISOString()).toString())
      );
      thisMonthTimesLength.push(freeTimes.length);
      thisMonthTimesEachDay.push(freeTimes);
    });

    setAvailableTimesInThisMonth(thisMonthTimesLength);
    setAvailableTimesInThisMonthForEachDay(thisMonthTimesEachDay);
  }, [currentMonth]);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-2 bg-stone-50">
      <div className={cn("flex flex-col gap-2 justify-center items-center")}>
        <span className="font-serif text-xl sm:text-2xl font-semibold text-teal-900 px-4 sm:px-2">
          Calendrier de réservation personnalisé qui renvoie les horaires
          disponibles pour une date sélectionnée
        </span>
        <span className="text-lg sm:text-xl text-teal-800 font-serif font-semibold px-2">
          Plage horaire dans cet exemple : 01:00 - 17:45
        </span>
      </div>
      {/* Implémentation du calendrier */}
      <div className="flex flex-col gap-2 h-[450px] w-[380px] mt-12">
        {/* En-tête du calendrier */}
        <div className="grid grid-cols-3">
          <Button
            type="button"
            onClick={prevMonth}
            disabled={isThisMonth(new Date(currentMonth))}
          >
            <ChevronLeft
              size={20}
              aria-hidden="true"
              className={cn(
                isThisMonth(new Date(currentMonth)) && "text-gray-300"
              )}
            />
          </Button>
          <h2 className="font-semibold text-orange-950 justify-center flex">
            {format(firstDayCurrentMonth, " MMMM yyyy")}
          </h2>
          <Button
            type="button"
            className="flex justify-end"
            onClick={nextMonth}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </Button>
        </div>

        {/* Corps du calendrier */}
        <div>
          <div className="grid grid-cols-7 mt-4">
            {dayNames.map((day, i) => {
              return (
                <div
                  key={i}
                  className={cn(
                    "flex justify-center items-center text-sm text-blue-500 w-full py-2",
                    {
                      "text-orange-400 bg-orange-50 rounded-t-lg":
                        day === "Dim" || day === "Sam",
                    }
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 text-sm">
            {days.map((day, dayIdx) => {
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    dayIdx === 0 && colStartClasses[getDay(day) - 1],
                    "h-14 justify-center flex items-center",
                    (getDay(day) === 0 || getDay(day) === 6) &&
                      "bg-orange-50 rounded-lg"
                  )}
                >
                  <Button
                    onClick={() => {
                      setCalendarTouched(true);
                      setSelectedDay(day);
                    }}
                    className={cn(
                      "w-12 h-12 flex flex-col p-2 justify-center items-center rounded-xl gap-0 group bg-gray-50 relative group",
                      isEqual(day, selectedDay) &&
                        "bg-orange-100 text-slate-900 text-lg",
                      isEqual(today, day) && "text-blue-900 bg-blue-50",
                      isBefore(day, today) &&
                        "text-red-800 bg-red-50 cursor-not-allowed",
                      isEqual(today, day) && "text-blue-900 bg-blue-50",
                      isBefore(day, today) && "cursor-not-allowed",
                      isEqual(day, selectedDay) &&
                        isToday(day) &&
                        "bg-blue-200",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-400",
                      !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        "text-gray-900"
                    )}
                    disabled={isBefore(day, today)}
                  >
                    {isAfter(day, startOfYesterday()) && (
                      <span className="hidden group-hover:flex absolute top-0 -translate-x-.5 -translate-y-4 z-10 text-[11px] bg-slate-900 text-slate-100 px-1 rounded-md gap-1">
                        <span>{availableTimesInThisMonth[dayIdx]}</span>
                        <span>Disponible</span>
                      </span>
                    )}

                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={cn(
                        "group-hover:text-lg",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold"
                      )}
                    >
                      {format(day, "d")}
                    </time>

                    <CheckCircle2
                      className={cn(
                        "hidden",
                        isEqual(day, selectedDay) &&
                          "absolute block top-0 right-0 h-[18px] w-[18px] translate-x-1 -translate-y-1 text-orange-900",
                        isEqual(day, today) && "text-blue-900"
                      )}
                    />

                    {isAfter(day, startOfYesterday()) && (
                      <TimesBar
                        times={availableTimesInThisMonthForEachDay[dayIdx]}
                      />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={cn(`hidden`, calendarTouched && "block")}>
        <span className="flex items-center w-full justify-center gap-1">
          <span>
            Sélectionnez l'heure de votre réservation pour le
            <span className="text-orange-950 font-semibold pl-1">
              {format(selectedDay, "dd MMMM yyyy").toString()}
            </span>
          </span>
        </span>

        <AvailableHours freeTimes={freeTimes} />
      </div>
    </div>
  );
}

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
