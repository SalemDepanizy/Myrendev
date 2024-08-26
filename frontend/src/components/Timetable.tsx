import React, { useState, useEffect } from "react";
import moment from "moment";
import useSWR from "swr";
import { fetcher } from "../axios";
// import { Monitor } from "src/Moniteurs";
import { AvailabiltyResult } from "./Availabilty";
import { message, Result } from "antd";
import { CorpSetting } from "src/CorpSetting";
import Button from "./Button";

type interval = {
  start: string;
  end: string;
  intervals: string[];
};

// Updated Props interface to include token
interface Props {
  date: moment.Moment;
  hours: number;
  onDataFromChild: any;
  limiterHours: number;
  limiterMinutes: number;
  token: string; // Add token here
  relationKey: string;
}

function Timetable({
  relationKey,
  daysFirst,
  token,
  available,
  date,
  hours,
  onDataFromChild,
  limiterHours,
  limiterMinutes,
  options,
  tempsInter,
  staffs,
}: {
  relationKey: string;
  daysFirst: string;
  token: string;
  available: string;
  date: moment.Moment;
  hours: number;
  onDataFromChild: any;
  limiterHours: number;
  limiterMinutes: number;
  options: string[];
  tempsInter: number;
  staffs: string[];
}) {

  console.log('relationKey',relationKey)

const [staffs1, staffs2] = staffs;

const dateTostart = date.toISOString();
  const [setting, setSetting] = useState<number>(1);
  const [determinate, setDeterminate] = useState<string[]>([]);

  const sendDataToParent = () => {
    const creneau = Array.from(selectedSlots);
    onDataFromChild(creneau);
  };

  const { data: settings } = useSWR(
    "/CorpSetting/get/corpsetting",
    async (url) => {
      const SettingData = (await fetcher.get(url)).data as any[];
      return SettingData;
    }
  );

  const limiter = settings?.[0]?.dayMoment === "morning" ? 8 : 0;

  useEffect(() => {
    if (settings && settings.length > 0) {
      if (settings[0].corpData > 0) {
        setSetting(settings[0].corpData);
      }
    }
  }, [settings]);


  const {
    data: rendezvousData,
    mutate: refetchRendezvous,
    error: errorRendezvous,
  } = useSWR(`/rendezvous/${staffs1}/monitor/${staffs2}`, async (url) => {
    const rendezvousArray = (await fetcher.get(url)).data as any[];
    return rendezvousArray;
  });
  const rdvAlreadyBooked = rendezvousData;

  const {
    data: dateToPass,
    mutate: refetchDateToPass,
    error: erroDateToPass,
  } = useSWR(`/disponibilite//get/superposition/entreprise/${staffs1}/monitor/${staffs2}`, async (url) => {
    const disabledDates = (await fetcher.get(url)).data as any[];
    return disabledDates;
  });

  const disabledDatesArrays = dateToPass?.map(obj => obj.disabledDates)?? [];

  // Step 2: Concatenate arrays into a single array
  const dateToSkip : string[] = [].concat(...disabledDatesArrays);
  
 


  const generateTimeSlots = (
    start: string,
    end: string,
    tempsInter: number,
    setting: number
  ) => {

    // const minutes = Number((tempsInter - Math.floor(tempsInter)).toFixed(2));
    // console.log('minutes', minutes)
    // const hours = tempsInter.toFixed(0);
    // console.log('hours',hours)
    // const fullHours = Number(hours) + Number((minutes / 60) * 100);
    // console.log('fullHours', fullHours)

    if (setting > 0 && tempsInter > 0) {
      let slots: string[] = [];
      let current = moment(start, "HH:mm");
      let originalEndTime = moment(end, "HH:mm");
      let endTime = moment(end, "HH:mm");

      let hasValidSlot = false;

      while (current.isBefore(endTime)) {
        let nextSlot1 = moment(current);
        let nextSlot2 = moment(current).add(tempsInter, "hours");

        if (nextSlot2.isAfter(endTime)) {
          nextSlot2 = moment(endTime);
        }

       
          slots.push(
            `${nextSlot1.format("HH:mm")} - ${nextSlot2.format("HH:mm")}`
          );
          hasValidSlot = true;
        
        current.add(tempsInter, "hours");
      }

      if (!hasValidSlot && slots.length === 0) {
        // Handle case where no valid slot is found.
      } else if (!current.isBefore(originalEndTime)) {
        slots[slots.length - 1] = `${
          slots[slots.length - 1].split(" - ")[0]
        } - ${end}`;
      }

      return slots;
    }
    return [];
  };

  const dayTranslations = {
    Lundi: "Monday",
    Mardi: "Tuesday",
    Mercredi: "Wednesday",
    Jeudi: "Thursday",
    Vendredi: "Friday",
    Samedi: "Saturday",
    Dimanche: "Sunday",
  };

  const dayTranslations2 = {
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
    Sunday: "Dimanche",
  };

  const generateDailyTimeSlots = (days: {
    [key: string]: interval;
  }): { [key: string]: string[] } => {
    const allTimeSlots: { [key: string]: string[] } = {};

    const timeInterval = 1;
    const setting = 1; // Placeholder, consider using state or props

    // Sort days in a predefined order (e.g., Monday to Sunday)
    const sortedDays = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];

    sortedDays.forEach((day) => {
      const dayIntervals = days[day]?.intervals || [];

      let dailySlots: string[] = [];

      dayIntervals.forEach((interval) => {
        const [start, end] = interval.split(" - ");
        const slots = generateTimeSlots(start, end, tempsInter, setting);
        dailySlots.push(...slots); // Using push spread to add slots
      });

      // Sort daily slots
      dailySlots.sort();

      // Translate day to French
      const translatedDay = dayTranslations[day] || day;

      if (dailySlots.length > 0) {
        allTimeSlots[translatedDay] = dailySlots;
      }
    });

    return allTimeSlots;
  };

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [slotToSend, setSlotToSend] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<string>("");
  const [currentDay, setCurrentDay] = useState<string>(
    date ? date.format("dddd") : ""
  );

  useEffect(() => {
    setCurrentDay(dayTranslations[currentDay] || currentDay);
  }, [currentDay]);

  // Sorting test array
  const cray: any = available[0];

  const timeSlots = generateDailyTimeSlots(cray || {});
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSlotClick = (slot: string, day: string) => {
    console.log('slot',day)
    const dayIndex = Object.keys(dayTranslations).findIndex(
      (key) => dayTranslations[key] === day
    );
    const selectedDate = moment(dateTostart)
      .startOf("isoWeek")
      .add(weekOffset, "weeks")
      .add(dayIndex, "days")
      .set("hour", Number(slot.split(":")[0]))
      .set("minute", Number(slot.split(":")[1]))
      .toDate();
     
      console.log('selectedDate',selectedDate)

    setSelectedSlots(new Set([slot]));
    setSlotToSend(slot);
    setSelectedDates(selectedDate.toISOString());
  };
  const [weekOffset, setWeekOffset] = useState(0);
  const maxWeeksToNavigate = parseInt(options[4]) || 1;
  
  // Start the week from today and display the next 7 days
  const startDate = moment(dateTostart).add(weekOffset, "weeks").startOf("isoWeek");

  const days = Array.from({ length: 7 }, (_, i) =>
    startDate.clone().add(i, 'days')
  ).filter(day => !dateToSkip.includes(day.toISOString()));

  const isInCurrentWeek = weekOffset === 0;
  const canNavigateForward = weekOffset < maxWeeksToNavigate;

  const validation = options[2] || "false";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validate = validation === "true";
    try {
      // Validate the token to get the associated email
      const tokenResponse = await fetcher.post(
        `/rendezvous/validatetoken/${token}`
      );
      const { email, slotConfirmed } = tokenResponse.data;

      if (slotConfirmed) {
        message.error("Slot has already been confirmed for this token.");
        return;
      }

      // Fetch the userId using the email
      const userResponse = await fetcher.get(
        `clientsChoice/user/by-email?email=${email}`
      );
      const userId = userResponse.data.id;


      // Confirm the slot using the userId


      const Updaterdv = await fetcher.patch("rendezvous/update-by-client", {
        dateTime: selectedDates, // Use the actual date as needed
        creneau: slotToSend,
        relationKey: relationKey,
        isValid: validate,
      });

      if (Updaterdv.status === 200) {
        setIsConfirmed(true);
        await fetcher.patch(`/rendezvous/confirmedToken/${token}`);
        message.success("Rendez-vous confirmé avec succès !");
      } else {
        message.error("Échec de la confirmation du rendez-vous.");
      }
    } catch (error) {
      console.error("Error during the slot confirmation process:", error);
      message.error(
        "Une erreur s'est produite lors de la confirmation du rendez-vous."
      );
    }
  };

  if (isConfirmed) {
    return (
      <Result
        status="success"
        title="Merci"
        subTitle="Votre créneau a été envoyé avec succès."
      />
    );
  }

  const num = parseInt(options[1]) || 10;
  const maxDays = parseInt(options[3]) || 7;


  // const isSlotAlreadyBooked = (slot: string, selectedDate: moment.Moment) => {
  //   const filteredRdv = rdvAlreadyBooked?.filter((rdv) => rdv.creneau !== "");
  //   const newArray = filteredRdv?.map(item => {
  //     const date = new Date(item.dateTime);
  //     date.setHours(date.getHours() - 1);
  //     return {
  //       ...item,
  //       dateTime: date.toISOString()
  //     };
  //   });
    
  //   return newArray?.some((rdv) => {
  //     const rdvDate = moment(rdv.dateTime);
  //     const [slotStart] = slot.split(" - ");
  //     const slotMoment = moment(selectedDate).set({
  //       hour: parseInt(slotStart.split(":")[0], 10),
  //       minute: parseInt(slotStart.split(":")[1], 10),
  //     });
  //     console.log('rdv',filteredRdv)
  //     return rdvDate.isSame(slotMoment, "minute");
  //   });
  // };


  const isSlotAlreadyBooked = (slot: string, selectedDate: moment.Moment) => {
    const filteredRdv = rdvAlreadyBooked?.filter((rdv) => rdv.creneau !== "");
   
    // const newArray = filteredRdv?.map(item => {
    //   const date = new Date(item.dateTime);

    //   date.setHours(date.getHours() - item.duration);
    //   console.log('date',date)
    //   return {
    //     ...item,
    //     dateTime: date.toISOString()
    //   };
    // });

    const newArray = filteredRdv?.reduce((acc, item) => {
      const date = new Date(item.dateTime);

      date.setHours(date.getHours() - item.duration);
      const startDate = new Date(date);
      const endDate = new Date(date);

      endDate.setHours(endDate.getHours() + item.duration);
  
      let currentStartDate = startDate;
  
      // Fragmentation en segments d'une heure
      while (currentStartDate < endDate) {
        const currentEndDate = new Date(currentStartDate);
        currentEndDate.setHours(currentEndDate.getHours() + 1);
  
        acc.push({
          ...item,
          dateTime: currentStartDate.toISOString(),
          duration: 1, // Chaque segment est d'une heure
        });
  
        currentStartDate = currentEndDate;
      }
  
      return acc;
    }, []);


    return newArray?.some((rdv) => {
      const rdvDate = moment(rdv.dateTime);
      const [slotStart] = slot.split(" - ");
      const slotMoment = moment(selectedDate).set({
        hour: parseInt(slotStart.split(":")[0], 10),
        minute: parseInt(slotStart.split(":")[1], 10),
      });
      
      return rdvDate.isSame(slotMoment, "minute");
    });
  };




  



  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Choisissez un rendez-vous</h1>

      <div className="flex flex-row gap-2">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={isInCurrentWeek}
          className={isInCurrentWeek ? "hidden" : "cursor-pointer"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300">Jour</th>
              <th className="p-2 border border-gray-300">Date</th>
              <th className="p-2 border border-gray-300">Créneau Horaire</th>
            </tr>
          </thead>
          <tbody>
            {days
              .slice(0, maxDays)
              .filter((dayMoment) => dayMoment.isSameOrAfter(moment(dateTostart), "day"))
              .map((dayMoment) => {
                
                const day = dayMoment.format("dddd");
                const translatedDay = dayTranslations[day] || day;
                const currentDate = dayMoment.format("DD/MM/YYYY");
                const slots = timeSlots[translatedDay];
                if (!slots || slots.length === 0) return null; // Skip days without slots
                return (
                  <tr key={day}>
                    <td className="p-2 border border-gray-300">
                      {dayTranslations2[translatedDay]}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {currentDate}
                    </td>
                    <td className="p-2 border border-gray-300">
                      <div className="w-full flex flex-wrap gap-2 m-2">
                        {slots.slice(0, num).map(
                        (
                          slot // Display all available slots
                        ) => {
                          const dayIndex = Object.keys(dayTranslations).findIndex(
                            (key) => dayTranslations[key] === day
                          );
                           const selectedDate = moment(date)
                            .startOf("isoWeek")
                            .add(weekOffset, "weeks")
                            .add(dayIndex, "days");

                            const slotMoment = selectedDate.clone().set({
                              hour: parseInt(slot.split(":")[0], 10),
                              minute: parseInt(slot.split(":")[1], 10),
                            });
    
                          const isBooked = isSlotAlreadyBooked(slot, selectedDate);

                          const isPast = slotMoment.isBefore(moment());
                          return (
                            <Button
                              key={slot}
                              onClick={() => !isBooked && handleSlotClick(slot, translatedDay)}        className={
                                selectedSlots.has(slot) && !isBooked && !isPast ? "bg-blue-500 text-white"
                                  : isBooked
                                  ? "hidden text-white cursor-not-allowed"
                                  : isPast
                                  ? "hidden text-white"
                                  : "bg-gray-200"
                              }
                              disabled={isBooked}
                            >
                              {slot}
                            </Button>
                       ) }
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={!canNavigateForward}
            className={!canNavigateForward ? "hidden" : "cursor-pointer"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={handleSubmit} className="">
          Confirmer
        </Button>
      </div>
    </div>
  );
}

export default Timetable;