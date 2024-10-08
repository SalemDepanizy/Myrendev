"use client";

import { format, isSameMinute, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import React, { memo, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import Button from "./Button";

// eslint-disable-next-line react/display-name
const AvailableHours = memo(({ freeTimes }: { freeTimes: Date[] }) => {
  const [selectedTime, setSelectedTime] = useState<Date>();

  return (
    <div className="flex flex-col items-center gap-2 mt-4 p-4">
      <span>
        Horaires disponibles:{" "}
        <span className="font-semibold text-orange-950">
          {freeTimes.length}
        </span>
      </span>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6  text-md gap-2">
        {freeTimes.map((hour, hourIdx) => (
          <div key={hourIdx}>
            <Button
              type="button"
              className={cn(
                "bg-green-200 rounded-lg px-2 text-gray-800 relative hover:border hover:border-green-400 w-[60px] h-[26px]",
                selectedTime &&
                  isSameMinute(selectedTime, hour) &&
                  "bg-green-400 text-gray-800"
              )}
              onClick={() => setSelectedTime(hour)}
            >
              <CheckCircle2
                className={cn(
                  "w-[16px] h-[16px] absolute hidden top-0 right-0 transform translate-x-1 -translate-y-1.5 text-green-700",
                  selectedTime && isSameMinute(selectedTime, hour) && "block"
                )}
              />
              {format(hour, "HH:mm")}
            </Button>
          </div>
        ))}
      </div>
      {selectedTime && (
        <div className="w-full py-6">
          <span>L’heure de réservation finale sélectionnée est : </span>
          <span className="font-semibold text-rose-950 pl-1">
            {format(selectedTime, "dd MMMM yyyy à HH:mm")}
          </span>
        </div>
      )}
    </div>
  );
});

export default AvailableHours;
