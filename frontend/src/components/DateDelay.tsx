import React, { useEffect, useState } from "react";
import Select from 'react-select';

function DateDelay({ onThisDataFromChild }: { onThisDataFromChild: any }) {
  const [showOptions, setShowOptions] = useState(false); // State to track whether options are displayed
  const [valueDelay, setValueDelay] = useState<number | null>(null);
  const [delayUnit, setDelayUnit] = useState(""); // State to store selected delay unit
  const [dateToSend, setDateToSend] = useState("");

  const daysOptions = [

    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' }
  ];

  const weeksOptions = [
   
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' }
  ];

  const sendDataToParent = () => {
    const delayedDate = delayFormatDate();
    onThisDataFromChild(delayedDate);
    
  };

  function delayFormatDate() {
    // Calculate delay based on selected unit
    var currentDate = new Date();
    let delayInMs = 0;
    if (delayUnit === "jours" && valueDelay !== null) {
      // delayInMs = valueDelay * 24 * 60 * 60 * 1000;
      // currentDate.setDate(currentDate.getDate() + valueDelay);
      delayInMs = currentDate.setDate(currentDate.getDate() + valueDelay);

    } else if (delayUnit === "semaines" && valueDelay !== null) {
      // delayInMs = valueDelay * 7 * 24 * 60 * 60 * 1000;
      
      delayInMs = currentDate.setDate(currentDate.getDate() + valueDelay*7);
    }
    if (valueDelay === null) {
      delayInMs = currentDate.setDate(currentDate.getDate() + 0);
    }
    const date = new Date(delayInMs);

    // Utilisation des options de formatage correctes
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    // setDateToSend(date.toLocaleDateString("en-En", options));
    return date.toLocaleDateString("en-En", options); // Format the date in French
  }
 
  
// Créer un nouvel objet Date


  // useEffect(() => {
  //   setDateToSend(delayFormatDate());
  //   // heu = delayFormatDate();


  // }, );
  
  function handleUnitChange(selectedOption: any) {
    setDelayUnit(selectedOption.value); // Update selected delay unit
    setValueDelay(null);
  }

  function handleValueChange(newValue: number | null) {
    setValueDelay(newValue);
    //  sendDataToParent();
  }

  return (
    <div className="p-4 bg-gray-200">
      <h1 className="text-xl font-bold mb-4">Test</h1>

      <div className="flex">
        <div
          className="p-2 h-auto bg-blue-500 text-white rounded mr-2"
          onClick={() => alert("Le plus vite possible")}
        >
          Le plus vite possible
        </div>
        <div
          className="p-2 bg-blue-500 text-white rounded mr-2 w-24 cursor-pointer"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? "Cacher les options" : "Afficher les options"}
        </div>
      </div>

      {showOptions && (
        <div className="flex gap-2 mt-2">
          <Select
            className="w-36"
            options={[
              { value: 'jours', label: 'jours' },
              { value: 'semaines', label: 'semaines' }
            ]}
            onChange={handleUnitChange}
            placeholder="--Choose--"
          />
          
          <Select
            className="w-24"
            options={delayUnit === 'jours' ? daysOptions : weeksOptions}
            onChange={(selectedOption) => handleValueChange(selectedOption?.value as number)}
            placeholder={valueDelay}
            isDisabled={!delayUnit}
          />
        </div>
      )}
      <p className="mt-2">Formatted Date: {delayFormatDate()}</p>
      <div onClick={sendDataToParent} className="p-2 bg-blue-500 text-white rounded cursor-pointer w-1/2">envoyer</div>
    </div>
  );
}
export default DateDelay;
