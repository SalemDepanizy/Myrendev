import React, { useCallback, useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import DateUnavailable from "./components/function/DateUnavailable";
import moment from "moment";

const SchedulerAsap = ({

  filterDaysH,
  events,
  localizer,
  messages,
  components,
  eventPropGetter,
  onSelectEvent,
  formats,
  limiterHours,
  closedDayOneSeven,
  monitor,
  rdvData,
  availability,
}) => {
  const [mtn, setMtn] = useState<Date>(new Date());
  const [view, setView] = useState(Views.Week);
  const [updateCount, setUpdateCount] = useState(0); // Track the number of updates

  // Calculate limiter with conditional logic
  const limiter = limiterHours < 10 ? `0${limiterHours}` : limiterHours.toString();

  // Get unavailable dates
  const lala = DateUnavailable(monitor, rdvData ,availability);

  // Extract unique available dates from events
  const nA = events.map((event) => moment(event.start).format("YYYY-MM-DD"));
  const uniqueArray = [...new Set(nA)];
  const availableDates = uniqueArray.filter(
    (element) => !lala.includes(element)
  );

  useEffect(() => {
    // Check if the update count is less than 2
    if (updateCount < 2 && availableDates.length > 0) {
      console.log('availableDates', availableDates[0]);
      setMtn(new Date(availableDates[0] as string));
      setUpdateCount(updateCount + 1); // Increment the update count
    }
  }, [availableDates, updateCount]); // Add availableDates and updateCount as dependencies

  const handleNavigate = (date, view, action) => {
    let newDate = new Date(date);

    switch (action) {
      case "TODAY":
        setMtn(new Date());
        break;
      case "PREV":
      case "PREVIOUS":
        while (closedDayOneSeven.includes(newDate.getDay())) {
          newDate.setDate(newDate.getDate() - 1);
        }
        setMtn(newDate);
        break;
      case "NEXT":
        while (closedDayOneSeven.includes(newDate.getDay())) {
          newDate.setDate(newDate.getDate() + 1);
        }
        setMtn(newDate);
        break;
      default:
        break;
    }

    if (closedDayOneSeven.includes(newDate.getDay())) {
      while (closedDayOneSeven.includes(newDate.getDay())) {
        newDate.setDate(newDate.getDate() + 1);
      }
      setMtn(newDate);
    }
  };

  const onView = useCallback((newView) => setView(newView), []);

  return (
    <div className="carac w-full">
      <Calendar
        views={["month", "week", "day"]}
        style={{ height: "65vh", width: "100%" }}
        messages={messages}
        formats={formats}
        components={components}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        view={view}
        onView={onView}
        date={mtn}
        events={events}
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        onNavigate={handleNavigate}
        defaultView="week"
      />
    </div>
  );
};

export default SchedulerAsap;
