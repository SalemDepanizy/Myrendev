
import React, { useEffect, useState } from "react";
import { Select } from "antd";
import { ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { start } from "repl";

const { Option } = Select;

// Génération des options de temps
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      options.push(time);
    }
  }
  return options;
};

const TimeInterval = ({ interval, onChange, onRemove, errorMessage, isFirstInterval }) => {
  // console.log('isFirstInterval', isFirstInterval);
  const timeOptions = generateTimeOptions();
  const startTimeIndex = timeOptions.indexOf(interval.start);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {/* Début de l'intervalle */}
        <Select
          value={interval.start}
          onChange={(value) => onChange({ ...interval, start: value })}
          className="w-32"
        >
          {timeOptions.map((time) => (
            <Option key={time} value={time}>
              {time}
            </Option>
          ))}
        </Select>
        <span>à</span>
        {/* Fin de l'intervalle */}
        <Select
          value={interval.end}
          onChange={(value) => onChange({ ...interval, end: value })}
          className="w-32"
        >
          {timeOptions.map((time, index) => (
            <Option
              key={time}
              value={time}
              disabled={index <= startTimeIndex}
            >
              {time}
            </Option>
          ))}
        </Select>
        {!isFirstInterval && ( // Ne pas afficher le bouton Supprimer pour le premier intervalle
          <button
            onClick={onRemove}
            className="p-2 text-red-500 transform duration-500 ease-in-out hover:scale-100 hover:text-gray-300"
          >
            <DeleteOutlined className="w-6 h-6" />
          </button>
        )}
      </div>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </div>
  );
};

const ScheduleSelector = ({ day, schedule, onScheduleChange, style, onDataFromChild,auto , data}) => {

  const defaultInterval =  { start: "08:00", end: "12:00" } ; // Interval par défaut
  const [intervals, setIntervals] = useState(Array.isArray(schedule) && schedule.length > 0 ? schedule : [defaultInterval]);
  const [allIntervals, setAllIntervals] = useState<any[]>([]);
  const [existing, setExisting] = useState<any>();
  const [test , setTest]=useState<any>();

let hehe  = [];
useEffect(() => {
  if (data && Object.keys(data).includes(day)) { // Check if data exists and day is a key in data
    setExisting(data[day].intervals);
  }
},[day])


useEffect(() => {
if(existing){
  setAllIntervals(existing.map((interval) => ({ start: interval.split('-')[0], end: interval.split('-')[1] })));
}
}, [existing]);

useEffect(() => {
  if(allIntervals.length > 0){
    setIntervals(allIntervals);
  }
}, [allIntervals]);

  let tab : any[] = [];
  
  useEffect(() => {
    if(auto.length > 0){ 
        // const defaultIntervals = auto;
       setIntervals(auto);
       onScheduleChange(day, auto);
    }
  }, [auto]);

  
  const handleIntervalChange = (index, updatedInterval, interval) => {
    const newIntervals = [...intervals];
    newIntervals[index] = updatedInterval;
    setIntervals(newIntervals);
    onScheduleChange(day, newIntervals);  
    onDataFromChild(day, newIntervals );
}

useEffect(() => {
  onDataFromChild(day, intervals);
}, [intervals]);

  const addNewInterval = () => {
    const lastInterval = intervals[intervals.length - 1];
    const lastEndTime = lastInterval.end;
    const [lastHours, lastMinutes] = lastEndTime.split(':').map(Number);
  
    // Calculer la nouvelle heure de début en ajoutant 1 heure à la fin de l'intervalle précédent
    let newStartHours = lastHours + 1;
    if (newStartHours >= 24) {
      newStartHours %= 24; // Gérer le dépassement de minuit (si nécessaire)
    }
  
    const newStartMinutes = lastMinutes;
    const newStartTime = `${newStartHours.toString().padStart(2, '0')}:${newStartMinutes.toString().padStart(2, '0')}`;
    
    const newEndTime = `${(newStartHours+1).toString().padStart(2, '0')}:${newStartMinutes.toString().padStart(2, '0')}`; // Fin par défaut pour le nouvel intervalle
    const newInterval = { start: newStartTime, end: newEndTime };

    setIntervals([...intervals, newInterval]);

  };


  const removeInterval = (index) => {
    const newIntervals = intervals.filter((_, i) => i !== index);
    setIntervals(newIntervals);
    onScheduleChange(day, newIntervals);
  };

  const validateInterval = (interval) => {
    const startTime = new Date(`2024-01-01T${(interval.start).trim()}:00Z`).getTime();
    const endTime = new Date(`2024-01-01T${(interval.end).trim()}:00Z`).getTime();
    return endTime > startTime;
  };


return (
  <div className={`flex flex-col space-y-4 border rounded-md p-4 shadow-lg ${style}`}>
    <h3 className="font-bold capitalize">{day}</h3>
    {intervals.map((interval, index) => (
      <TimeInterval
        key={index}
        interval={interval}
        onChange={(updatedInterval) => handleIntervalChange(index, updatedInterval, interval)}
        onRemove={() => removeInterval(index)}
        errorMessage={!validateInterval(interval) && "L'heure de fin doit être postérieure à l'heure de début."}
        isFirstInterval={index === 0} 
      />
    ))}
    <button
      onClick={addNewInterval}
      className="flex items-center justify-center p-2 bg-black rounded-xl hover:bg-gray-600 text-white text-sm"
    >
      Ajouter un intervalle
    </button>
  </div>
);
};

export default ScheduleSelector;

