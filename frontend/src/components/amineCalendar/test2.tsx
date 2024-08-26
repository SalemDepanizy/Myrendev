import React, { useState, useMemo, useRef, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import classNames from "classnames";
import useSWR from "swr";
import { fetcher } from "./axios";


type WeekDays =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
type DaysArray = (number | null)[];

interface DayObject {
  day: WeekDays;
  dates: DaysArray;
}

const dayTranslations = {
  fr: {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  },
};

type Language = keyof typeof dayTranslations;

function translateDay(day: WeekDays, language: Language = "fr"): string {
  return dayTranslations[language][day];
}

function getMonthDaysWithMoment(month: number, year: number): DayObject[] {
  const daysOfWeek: WeekDays[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const startOfMonth = moment([year, month - 1]);
  const endOfMonth = moment(startOfMonth).endOf("month");
  const result: Record<WeekDays, DaysArray> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  let currentDay = startOfMonth.clone();
  const startDayIndex = (currentDay.day() + 6) % 7;
  daysOfWeek.forEach((day, index) => {
    result[day] = new Array(index < startDayIndex ? 1 : 0).fill(null);
  });

  while (currentDay.isSameOrBefore(endOfMonth)) {
    const dayOfWeek = daysOfWeek[(currentDay.day() + 6) % 7];
    result[dayOfWeek].push(currentDay.date());
    currentDay.add(1, "day");
  }

  const maxLength = Math.max(
    ...Object.values(result).map((dates) => dates.length)
  );
  Object.keys(result).forEach((day) => {
    while (result[day].length < maxLength) {
      result[day].push(null);
    }
  });

  return daysOfWeek.map((day) => ({
    day: day,
    dates: result[day],
  }));
}

type Rdv = {
  id: string;
  date: string;
  meetingStart: string;
  meetingEnd: string;
  professional: {
    id: string;
    name: string;
    lastname: string;
  };
  client: {
    name: string;
    lastname: string;
  };
  status: string;
  [key: string]: any;
};

type SortedRdvs = {
  [key: string]: Rdv[];
};



function sortRdvsByDay(rdvs: Rdv[]): SortedRdvs {
  const sortedRdvs: SortedRdvs = {};

  rdvs.forEach((rdv) => {
    const dateKey = moment(rdv.date).format("DD-MM-YYYY");

    if (!sortedRdvs[dateKey]) {
      sortedRdvs[dateKey] = [];
    }

    sortedRdvs[dateKey].push(rdv);
  });

  Object.keys(sortedRdvs).forEach((key) => {
    sortedRdvs[key].sort((a, b) =>
      moment(a.meetingStart).diff(moment(b.meetingStart))
    );
  });

  return sortedRdvs;
}

function getDayRdvs(
  day: number,
  month: number,
  year: number,
  rdvs: SortedRdvs
): Rdv[] {
  const dateKey = moment([year, month - 1, day]).format("DD-MM-YYYY");
  return rdvs[dateKey] || [];
}

function getWeekRdvs(weekStart: moment.Moment, rdvs: SortedRdvs): Rdv[] {
  let weekRdvs: Rdv[] = [];
  for (let i = 0; i < 7; i++) {
    const dateKey = weekStart.clone().add(i, "days").format("DD-MM-YYYY");
    if (rdvs[dateKey]) {
      weekRdvs = weekRdvs.concat(rdvs[dateKey]);
    }
  }
  return weekRdvs;
}

const backgroundColors = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-teal-100",
];
const borderColors = [
  "border-red-800",
  "border-blue-800",
  "border-green-800",
  "border-yellow-800",
  "border-purple-800",
  "border-pink-800",
  "border-teal-800",
];
const textColors = [
  "text-red-800",
  "text-blue-800",
  "text-green-800",
  "text-yellow-800",
  "text-purple-800",
  "text-pink-800",
  "text-teal-800",
];

function getColorForProfessional(professionalId: string) {
  const index =
    professionalId
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    backgroundColors.length;
  return {
    background: backgroundColors[index],
    border: borderColors[index],
    text: textColors[index],
  };
}

function Calendar({
  rdvs,
  onRdvCreationButtonClick,
  onDayClick,
  onDelete,
}: {
  rdvs: Rdv[];
  onRdvCreationButtonClick: () => void;
  onDayClick: (rdvs: Rdv[]) => void;
  onDelete: (id: string) => void;
}) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [isRdvModalOpen, setIsRdvModalOpen] = useState(false);
  const [isMoreRdvModalOpen, setIsMoreRdvModalOpen] = useState(false);
  const [view, setView] = useState("month");
  const [currentDay, setCurrentDay] = useState(moment());
  const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);
  const [moreRdvList, setMoreRdvList] = useState<Rdv[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleRdvClick = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setIsRdvModalOpen(true);
  };

  const closeRdvModal = () => {
    setIsRdvModalOpen(false);
    setSelectedRdv(null);
  };

  const handleMoreRdvClick = (rdvs: Rdv[]) => {
    setMoreRdvList(rdvs);
    setIsMoreRdvModalOpen(true);
  };

  const closeMoreRdvModal = () => {
    setIsMoreRdvModalOpen(false);
    setMoreRdvList([]);
  };

  useEffect(() => {
    const handleResize = () => {
      if (calendarRef.current && headerRef.current) {
        const calendarHeight = calendarRef.current.clientHeight;
        const headerHeight = headerRef.current.clientHeight;
        calendarRef.current.style.height = `${
          window.innerHeight - headerHeight - 20
        }px`;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calendarRef, headerRef]);

  const days = useMemo(
    () => getMonthDaysWithMoment(month, year),
    [month, year]
  );
  
  const {
    data: rendezvousData,
    mutate: refetchRendezvous,
    error: errorRendezvous,
  } = useSWR(`/rendezvous/all`, async (url) => {
    const rendezvousArray = (await fetcher.get(url)).data as any[];
    return rendezvousArray;
  });
  
  const defaultRdvs: any[] = rendezvousData || [];
  console.log('defaultRdvs:', defaultRdvs);
  const sortedRdvs = useMemo(() => sortRdvsByDay(defaultRdvs), [rdvs]);
console.log('sortedRdvs:', sortedRdvs);
  const pastRdvs = defaultRdvs
    .filter((rdv) => moment(rdv.date).isBefore(moment(), "day"))
    .sort((a, b) => moment(b.date).diff(moment(a.date)));

  const renderMonthView = () => (
    <div className="grid grid-cols-7 w-full ">
      {days.map((day, x) => (
        <div
          key={day.day}
          className="flex flex-col items-center justify-center w-full text-gray-700"
        >
          <h2
            className={`text-center text-lg font-semibold py-3 border-t-2 min-w-[100px] w-full ${
              x === 0 ? "border-l-2" : ""
            } ${x === days.length - 1 ? "border-r-2" : ""}`}
          >
            {translateDay(day.day).slice(0, 3)}
          </h2>
          <ul className="w-full h-[140px]">
            {" "}
            {/* Agrandissement de la hauteur */}
            {day.dates.map((date, y) => {
              const dayRdvs = date
                ? getDayRdvs(date, month, year, sortedRdvs)
                : [];
              const haveOneRdv = dayRdvs.length === 1;
              const haveMultipleRdvs = dayRdvs.length > 1;
              const haveNoRdv = dayRdvs.length === 0;
              const haveMoreThanTwoRdvs = dayRdvs.length > 2;

              const isPast =
                date &&
                moment([year, month - 1, date]).isBefore(moment(), "day");

              return (
                <li
                  key={y}
                  className={`h-full bg-gray-100 text-xs font-semibold flex flex-col gap-2 p-2 border ${
                    x === 0 ? "border-l-2" : "border-l"
                  } ${y === 0 ? "border-t-2" : "border-t"} ${
                    y === day.dates.length - 1 ? "border-b-2" : "border-b"
                  } ${x === days.length - 1 ? "border-r-2" : "border-r"} ${
                    isPast ? "bg-gray-300" : ""
                  }`}
                  onClick={() => {
                    if (haveMoreThanTwoRdvs) {
                      handleMoreRdvClick(dayRdvs);
                    }
                  }}
                >
                  <div className="flex justify-between">
                    <span>{date === null ? "" : date}</span>
                    {haveMoreThanTwoRdvs && (
                      <span className="text-xs font-semibold text-red-600">
                        {dayRdvs.length - 2} de plus
                      </span>
                    )}
                  </div>
                  <div className="w-full flex-1">
                    {haveOneRdv && (
                      <div
                        className={`${
                          getColorForProfessional(dayRdvs[0].professional.id)
                            .background
                        } ${
                          getColorForProfessional(dayRdvs[0].professional.id)
                            .border
                        } h-full rounded-md p-2 border-l-4 flex flex-col ${
                          isPast ? "bg-gray-300" : ""
                        }`}
                        onClick={() => handleRdvClick(dayRdvs[0])}
                      >
                        <h4
                          className={`text-xs font-semibold max-w-full ${
                            getColorForProfessional(dayRdvs[0].professional.id)
                              .text
                          } ${isPast ? "opacity-50" : ""}`}
                          title={`${dayRdvs[0].professional?.name} ${dayRdvs[0].professional?.lastname}`}
                        >
                          <span className="text-sm font-bold">
                            {dayRdvs[0].professional?.name}{" "}
                            {dayRdvs[0].professional?.lastname}
                          </span>
                        </h4>
                        <span
                          className={`text-[0.65rem] font-semibold ${
                            getColorForProfessional(dayRdvs[0].professional.id)
                              .text
                          } ${isPast ? "opacity-50" : ""}`}
                          title={`${moment(dayRdvs[0].meetingStart).format(
                            "HH:mm"
                          )} - ${moment(dayRdvs[0].meetingEnd).format(
                            "HH:mm"
                          )}`}
                        >
                          {`${moment(dayRdvs[0].meetingStart).format(
                            "HH:mm"
                          )} - ${moment(dayRdvs[0].meetingEnd).format(
                            "HH:mm"
                          )}`}
                        </span>
                        <span
                          className="text-[0.65rem] font-semibold mt-1"
                          title={`${dayRdvs[0].client.name} ${dayRdvs[0].client.lastname}`}
                        >
                          {dayRdvs[0].client.name} {dayRdvs[0].client.lastname}
                        </span>
                      </div>
                    )}
                    {haveMultipleRdvs && (
                      <div className="flex items-center justify-center flex-col gap-1">
                        <div
                          className={`${
                            getColorForProfessional(dayRdvs[0].professional.id)
                              .background
                          } ${
                            getColorForProfessional(dayRdvs[0].professional.id)
                              .border
                          } h-full rounded-md w-full pl-2 pr-2 pt-1 pb-1 border-l-4 ${
                            isPast ? "bg-gray-300" : ""
                          }`}
                          onClick={() => handleRdvClick(dayRdvs[0])}
                        >
                          <h4
                            className={`text-xs font-semibold max-w-full ${
                              getColorForProfessional(
                                dayRdvs[0].professional.id
                              ).text
                            } ${isPast ? "opacity-50" : ""}`}
                            title={`${dayRdvs[0].professional.name} ${dayRdvs[0].professional.lastname}`}
                          >
                            <span className="text-sm font-bold">
                              {dayRdvs[0].professional.name}{" "}
                              {dayRdvs[0].professional.lastname}
                            </span>
                          </h4>
                          <span
                            className={`text-[0.65rem] font-semibold ${
                              getColorForProfessional(
                                dayRdvs[0].professional.id
                              ).text
                            } ${isPast ? "opacity-50" : ""}`}
                            title={`${moment(dayRdvs[0].meetingStart).format(
                              "HH:mm"
                            )} - ${moment(dayRdvs[0].meetingEnd).format(
                              "HH:mm"
                            )}`}
                          >
                            {`${moment(dayRdvs[0].meetingStart).format(
                              "HH:mm"
                            )} - ${moment(dayRdvs[0].meetingEnd).format(
                              "HH:mm"
                            )}`}
                          </span>
                          <span
                            className="text-[0.65rem] font-semibold mt-1"
                            title={`${dayRdvs[0].client.name} ${dayRdvs[0].client.lastname}`}
                          ></span>
                        </div>
                        <div
                          className={`${
                            getColorForProfessional(dayRdvs[1].professional.id)
                              .background
                          } ${
                            getColorForProfessional(dayRdvs[1].professional.id)
                              .border
                          } h-full rounded-md w-full pl-2 pr-2 pt-1 pb-1 border-l-4 ${
                            isPast ? "bg-gray-300" : ""
                          }`}
                          onClick={() => handleRdvClick(dayRdvs[1])}
                        >
                          <h4
                            className={`text-xs font-semibold max-w-full ${
                              getColorForProfessional(
                                dayRdvs[1].professional.id
                              ).text
                            } ${isPast ? "opacity-50" : ""}`}
                            title={`${dayRdvs[1].professional.name} ${dayRdvs[1].professional.lastname}`}
                          >
                            <span className="text-sm font-bold">
                              {dayRdvs[1].professional.name}{" "}
                              {dayRdvs[1].professional.lastname}
                            </span>
                          </h4>
                          <span
                            className={`text-[0.65rem] font-semibold ${
                              getColorForProfessional(
                                dayRdvs[1].professional.id
                              ).text
                            } ${isPast ? "opacity-50" : ""}`}
                            title={`${moment(dayRdvs[1].meetingStart).format(
                              "HH:mm"
                            )} - ${moment(dayRdvs[1].meetingEnd).format(
                              "HH:mm"
                            )}`}
                          >
                            {`${moment(dayRdvs[1].meetingStart).format(
                              "HH:mm"
                            )} - ${moment(dayRdvs[1].meetingEnd).format(
                              "HH:mm"
                            )}`}
                          </span>
                          <span
                            className="text-[0.65rem] font-semibold mt-1"
                            title={`${dayRdvs[1].client.name} ${dayRdvs[1].client.lastname}`}
                          ></span>
                        </div>
                      </div>
                    )}
                    {haveNoRdv && <></>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderDayView = () => {
    const todayRdvs = getDayRdvs(
      currentDay.date(),
      currentDay.month() + 1,
      currentDay.year(),
      sortedRdvs
    );
    const rdvIntervals = todayRdvs.map((rdv) => ({
      time: moment(rdv.meetingStart).format("HH:mm"),
      rdvs: [rdv],
    }));

    return (
      <div
        className={`flex flex-col p-4 overflow-y-auto h-[calc(100vh-200px)] border border-gray-200 rounded ${
          todayRdvs.length === 0 ? "bg-gray-100" : ""
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">
          {currentDay.format("DD MMMM YYYY")}
        </h2>
        {rdvIntervals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 italic text-sm">
            Aucun rendez-vous ce jour
          </div>
        ) : (
          rdvIntervals.map(({ time, rdvs }) => (
            <div key={time} className="border-t border-gray-300 py-2">
              <div className="text-gray-500 text-xs">{time}</div>
              {rdvs.map((rdv) => {
                const { background, border, text } = getColorForProfessional(
                  rdv.professional.id
                );
                return (
                  <div
                    key={rdv.id}
                    className={`shadow-lg ${background} ${border} h-full rounded-md p-2 border-l-4 flex flex-col mb-2`}
                    onClick={() => handleRdvClick(rdv)}
                  >
                    <h4
                      className={`text-xs font-semibold ${text}`}
                      title={`${rdv.professional.name} ${rdv.professional.lastname}`}
                    >
                      <span className="text-sm font-bold">
                        {rdv.professional.name} {rdv.professional.lastname}
                      </span>
                    </h4>
                    <span
                      className={`text-[0.65rem] font-semibold ${text}`}
                      title={`${moment(rdv.meetingStart).format(
                        "HH:mm"
                      )} - ${moment(rdv.meetingEnd).format("HH:mm")}`}
                    >
                      {`${moment(rdv.meetingStart).format("HH:mm")} - ${moment(
                        rdv.meetingEnd
                      ).format("HH:mm")}`}
                    </span>
                    <span
                      className="text-[0.65rem] font-semibold mt-1"
                      title={`${rdv.client.name} ${rdv.client.lastname}`}
                    >
                      {rdv.client.name} {rdv.client.lastname}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = currentDay.clone().startOf("isoWeek");
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      weekStart.clone().add(i, "days")
    );

    return (
      <div className="flex h-full overflow-y-auto">
        <div className="flex-1 grid grid-cols-7 gap-2 p-4 h-[600px]">
          {weekDays.map((day) => {
            const dayRdvs = getDayRdvs(
              day.date(),
              day.month() + 1,
              day.year(),
              sortedRdvs
            );
            const rdvIntervals = dayRdvs.map((rdv) => ({
              time: moment(rdv.meetingStart).format("HH:mm"),
              rdvs: [rdv],
            }));
            const isNoRdv = rdvIntervals.length === 0;

            return (
              <div
                key={day.format("DD-MM-YYYY")}
                className={`col-span-1 border border-gray-300 rounded-md p-2 flex flex-col h-full ${
                  isNoRdv ? "bg-gray-100" : ""
                }`}
              >
                <h2
                  className={`text-center text-lg font-semibold py-1 border-b border-gray-300 ${
                    isNoRdv ? "text-gray-500" : ""
                  }`}
                >
                  <span className="text-2xl font-bold">{day.format("DD")}</span>
                  <span className="text-base">{day.format("dddd")}</span>
                </h2>
                <div className="flex-grow relative">
                  {isNoRdv ? (
                    <div className="flex items-center justify-center h-full text-center text-gray-500 italic text-sm">
                      Aucun rendez-vous ce jour
                    </div>
                  ) : (
                    rdvIntervals.map(({ time, rdvs }) => (
                      <div key={time} className="border-t border-gray-300 py-2">
                        <div className="text-gray-500 text-xs">{time}</div>
                        {rdvs.map((rdv) => {
                          const { background, border, text } =
                            getColorForProfessional(rdv.professional.id);
                          return (
                            <div
                              key={rdv.id}
                              className={`shadow-lg ${background} ${border} h-full rounded-md p-2 border-l-4 flex flex-col mb-2`}
                              onClick={() => handleRdvClick(rdv)}
                            >
                              <h4
                                className={`text-xs font-semibold ${text}`}
                                title={`${rdv.professional.name} ${rdv.professional.lastname}`}
                              >
                                <span className="text-sm font-bold">
                                  {rdv.professional.name}{" "}
                                  {rdv.professional.lastname}
                                </span>
                              </h4>
                              <span
                                className={`text-[0.65rem] font-semibold ${text}`}
                                title={`${moment(rdv.meetingStart).format(
                                  "HH:mm"
                                )} - ${moment(rdv.meetingEnd).format("HH:mm")}`}
                              >
                                {`${moment(rdv.meetingStart).format(
                                  "HH:mm"
                                )} - ${moment(rdv.meetingEnd).format("HH:mm")}`}
                              </span>
                              <span
                                className="text-[0.65rem] font-semibold mt-1"
                                title={`${rdv.client.name} ${rdv.client.lastname}`}
                              >
                                {rdv.client.name} {rdv.client.lastname}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handlePreviousPeriod = () => {
    let newDate;
    if (view === "month") {
      newDate = currentDay.clone().subtract(1, "month");
    } else if (view === "week") {
      newDate = currentDay.clone().subtract(1, "week");
    } else if (view === "day") {
      newDate = currentDay.clone().subtract(1, "day");
    }
    setCurrentDay(newDate);
    setMonth(newDate.month() + 1);
    setYear(newDate.year());
  };

  const handleNextPeriod = () => {
    let newDate;
    if (view === "month") {
      newDate = currentDay.clone().add(1, "month");
    } else if (view === "week") {
      newDate = currentDay.clone().add(1, "week");
    } else if (view === "day") {
      newDate = currentDay.clone().add(1, "day");
    }
    setCurrentDay(newDate);
    setMonth(newDate.month() + 1);
    setYear(newDate.year());
  };

  const handleMonthSelect = (month: number) => {
    const newDate = moment([year, month - 1]);
    setCurrentDay(newDate);
    setMonth(month);
    if (view === "week") {
      setView("month");
    }
    setShowMonthsDropdown(false);
  };

  const months = moment.months();

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  return (
    <>
      <div className="flex relative">
        <div
          className={classNames(
            "transition-all duration-300 overflow-y-auto bg-gray-50 shadow-md absolute -left-5 flex flex-col z-50",
            {
              "w-7": !isExpanded,
              "w-3/5": isExpanded,
            }
          )}
          style={{ height: "calc(86% - 90px)", top: "135px", bottom: "20px" }}
        >
          <div
            className="h-full flex items-center justify-center cursor-pointer absolute right-0 top-0 bottom-0 bg-gray-200 z-10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronLeft className="transition-transform rotate-0" />
            ) : (
              <ChevronRight className="transition-transform rotate-0" />
            )}
          </div>
          {isExpanded && (
            <div className="p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">
                Historique des rendez-vous
              </h2>
              <ul className="space-y-4">
                {pastRdvs.map((rdv) => {
             
                  return (
                    <li key={rdv.id} className="mb-4">
                      <div className="shadow-md p-4 rounded-md flex border border-gray-200">
                        <div
                          className={`flex-shrink-0 text-center p-4 border-r-2 mr-4 flex flex-col items-center justify-center `}
                        >
                          <div className="text-4xl font-extrabold">
                            {moment(rdv.date).format("DD")}
                          </div>
                          <div className="text-sm">
                            {moment(rdv.date)
                              .format("MMMM YYYY")
                              .charAt(0)
                              .toUpperCase() +
                              moment(rdv.date).format("MMMM YYYY").slice(1)}
                          </div>
                          <p>
                            {moment(rdv.meetingStart).format("HH:mm")} -{" "}
                            {moment(rdv.meetingEnd).format("HH:mm")}
                          </p>
                          <div
                            className={`flex items-center  rounded-lg px-2 py-1 mt-1`}
                          >
                            
                            <span className="ml-1">de</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold">{rdv.title}</h4>
                          <p>
                            <strong>Professionnel:</strong>{" "}
                            {`${rdv.professional.name} ${rdv.professional.lastname}`}
                          </p>
                          <p>
                            <strong>Client:</strong>{" "}
                            {`${rdv.client.name} ${rdv.client.lastname}`}
                          </p>
                          <p>
                            <strong>Lieu:</strong> {rdv.meetingPlace}
                          </p>
                          <p>
                            <strong>Prestation:</strong> {rdv?.product?.title}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        <div
          ref={calendarRef}
          className="flex-1 mx-auto rounded-md overflow-hidden"
          style={{ height: "calc(100vh - 60px - 20px)" }}
        >
          <div
            ref={headerRef}
            className="flex flex-col gap-2 w-full p-2 justify-center items-center relative"
          >
            <div className="flex w-full justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMonthsDropdown(!showMonthsDropdown)}
                  className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-400 hover:text-gray-800"
                >
                  {currentDay.format("MMMM")}
                </button>
                <button
                  onClick={handlePreviousPeriod}
                  className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-400 hover:text-gray-800"
                >
                  <ArrowLeft />
                </button>
                <button
                  onClick={handleNextPeriod}
                  className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-400 hover:text-gray-800"
                >
                  <ArrowRight />
                </button>
              </div>
              <div>
      <div className="flex gap-2 bg-gray-200 rounded-lg p-2">
        <div
          onClick={() => handleViewChange('day')}
          className={classNames(
            'py-1 px-3 rounded-lg font-medium',
            view === 'day'
              ? 'bg-white font-bold'
              : 'bg-gray-300 text-gray-600 hover:bg-white hover:text-indigo-600 active:bg-white/50'
          )}
        >
          JOUR
        </div>
        <div
          onClick={() => handleViewChange('week')}
          className={classNames(
            'py-1 px-3 rounded-lg font-medium',
            view === 'week'
              ? 'bg-white font-bold'
              : 'bg-gray-300 text-gray-600 hover:bg-white hover:text-indigo-600 active:bg-white/50'
          )}
        >
          SEMAINE
        </div>
        <div
          onClick={() => handleViewChange('month')}
          className={classNames(
            'py-1 px-3 rounded-lg font-medium',
            view === 'month'
              ? 'bg-white font-bold'
              : 'bg-gray-300 text-gray-600 hover:bg-white hover:text-indigo-600 active:bg-white/50'
          )}
        >
          MOIS
        </div>
      </div>
    </div>
              <button
                onClick={onRdvCreationButtonClick}
                className="p-2 bg-black rounded-lg text-sm text-white hover:bg-gray-700 hover:text-white font-semibold"
              >
                Créer un rendez-vous
              </button>
            </div>
            {showMonthsDropdown && (
              <div className="absolute top-12 left-2 bg-white border border-gray-200 rounded-md mt-1 z-10">
                {months.map((monthName, index) => (
                  <div
                    key={monthName}
                    onClick={() => handleMonthSelect(index + 1)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {monthName}
                  </div>
                ))}
              </div>
            )}
            {view === "week" && (
              <div className="text-center text-lg font-semibold mt-2 mb-4">
                {`Semaine du ${currentDay
                  .startOf("isoWeek")
                  .format("DD MMM")} au ${currentDay
                  .endOf("isoWeek")
                  .format("DD MMM YYYY")}`}
              </div>
            )}
            {view !== "week" && (
              <div className="text-lg font-semibold mt-4">
                {view === "month" && currentDay.format("MMMM YYYY")}
                {view === "day" && currentDay.format("DD MMMM YYYY")}
              </div>
            )}
          </div>
          {view === "month" && renderMonthView()}
          {view === "day" && renderDayView()}
          {view === "week" && renderWeekView()}
        </div>
      </div>


    </>
  );
}

export default Calendar;
