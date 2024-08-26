import React, { useState } from "react";
import Slider from "antd/es/slider";
import message from "antd/es/message";
import Button from "antd/es/button";
import { fetcher } from "../../axios";
import { AxiosResponse } from "axios";

interface SliderValues {
  [key: string]: number[];
}

function ModalDispo() {
  const defaultSliderValues: SliderValues = {
    lundi: [0, 10],
    mardi: [0, 10],
    mercredi: [0, 10],
    jeudi: [0, 10],
    vendredi: [0, 10],
    samedi: [0, 10],
    dimanche: [0, 10],
  };

  const [sliderValues, setSliderValues] = useState<SliderValues>(
    defaultSliderValues
  );
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [sliderVisible, setSliderVisible] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(Object.keys(defaultSliderValues).map(key => [key, false]))
  );
  const [selectedSliderValues, setSelectedSliderValues] = useState<SliderValues>({});

  const handleSliderChange = (day: string, values: number[]) => {
    //  console.log(`Slider ${day} changed:`, values);
    setSelectedSliderValues((prevValues) => ({
      ...prevValues,
      [day]: values,
    }));
    setSliderValues((prevValues) => ({
      ...prevValues,
      [day]: values,
    }));
  };

  const handleSliderLabelClick = (day: string) => {
    setActiveSlider((prevActiveSlider) => (prevActiveSlider === day ? null : day));
    setSliderVisible((prevVisible) => ({
      ...prevVisible,
      [day]: !prevVisible[day],
    }));
  };

  const handleSliderDoubleClick = (day: string) => {
    const updatedValues = [...sliderValues[day]];
    if (updatedValues.length + 2 <= 6) { // Limite à 6 handles au total (3 paires)
      const handle1 = Math.floor(Math.random() * 24);
      const handle2 = handle1 + 1;
      updatedValues.push(handle1, handle2);
      updatedValues.sort((a, b) => a - b); // Trie pour maintenir l'ordre
      setSliderValues((prevValues) => ({
        ...prevValues,
        [day]: updatedValues,
      }));
    }
    setSliderVisible((prevVisible) => ({
      ...prevVisible,
      [day]: true,
    }));
  };

  const handleAddHandleClick = (day: string) => {
    const updatedValues = [...sliderValues[day]];
    if (updatedValues.length + 2 <= 6) { // Limite à 6 handles au total (3 paires)
      const handle1 = Math.floor(Math.random() * 24);
      const handle2 = handle1 + 1;
      updatedValues.push(handle1, handle2);
      updatedValues.sort((a, b) => a - b); // Trie pour maintenir l'ordre
      setSliderValues((prevValues) => ({
        ...prevValues,
        [day]: updatedValues,
      }));
    }
  };

  const handleFillSliders = () => {
    const filledDay = Object.keys(selectedSliderValues).find(day => !selectedSliderValues[day].every(value => value === 0));
    if (filledDay) { // Vérifie si au moins un slider est rempli
      const filledSliderValues = selectedSliderValues[filledDay];
      Object.keys(sliderValues).forEach((day) => {
        if (day !== filledDay) {
          setSliderValues((prevValues) => ({
            ...prevValues,
            [day]: filledSliderValues,
          }));
        }
      });
    } else {
      message.warning("Aucun slider n'est rempli pour utiliser cette fonction.");
    }
  };

  const handleRemoveHandleClick = (day: string) => {
    const updatedValues = [...sliderValues[day]];
    if (updatedValues.length - 2 >= 2) { // Vérifie s'il reste au moins une paire de handles
      updatedValues.splice(-2, 2); // Supprime les deux dernières valeurs du tableau
      setSliderValues((prevValues) => ({
        ...prevValues,
        [day]: updatedValues,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Vérifie si au moins un jour a été sélectionné
    const selectedDays = Object.keys(selectedSliderValues).filter(day =>
      selectedSliderValues[day].some(value => value !== 0)
    );
  
    if (selectedDays.length === 0) {
      message.warning("Veuillez sélectionner au moins un jour avant de confirmer.");
      return;
    }
  
    try {
      const promises: Promise<AxiosResponse<any, any>>[] = [];
      selectedDays.forEach(async (day) => {
        const dayValues = sliderValues[day];
        if (dayValues) {
          const fromString = `${dayValues[0]},${dayValues[2]}`;
          const toString = `${dayValues[1]},${dayValues[3]}`;
          const extraString = `${dayValues[4]},${dayValues[5]}`;
  
          promises.push(
            fetcher.post("disponibilite/create", {
              day: [day],
              from: fromString,
              to: toString,
              extra: extraString,
            })
          );
        }
      });
  
      const responses = await Promise.all(promises);
  
      responses.forEach((response) => {
        if (response.status !== 200) {
          throw new Error(`Échec de la création pour une journée`);
        }
      });
  
      message.success("Disponibilité créée avec succès.");
    } catch (error) {
      console.error("Une erreur s'est produite :", error);
      message.error("Une erreur s'est produite : " + error);
    }
  };
  


  return (
    <div className="flex justify-center items-center flex-col">
      <form className="w-full h-full" onSubmit={handleFormSubmit}>
        <div className="mt-4">
          {Object.keys(sliderValues).map((day) => (
            <div key={day} className="mb-4 flex items-center">
              <label
                className="mr-2"
                onClick={() => handleSliderLabelClick(day)}
                onDoubleClick={() => handleSliderDoubleClick(day)}
                style={{ cursor: "pointer" }}
              >
                {day}
              </label>
              {sliderVisible[day] && (
                <div className="w-full flex items-center"> {/* Changer la largeur du slider ici */}
                  <Button onClick={() => handleRemoveHandleClick(day)} className="mr-2 border-none">-</Button>
                  <Slider
                  className="w-full"
                    range={{ draggableTrack: true }}
                    step={0.5}
                    value={sliderValues[day]} // Utilisez 'value' au lieu de 'defaultValue'
                    min={0}
                    max={23.5}
                    onChange={(values) => handleSliderChange(day, values)}
                    tipFormatter={(value?: number | undefined) => {
                      if (typeof value === "undefined") {
                        return "";
                      }
                      const hour = Math.floor(value);
                      const minutes = value % 1 === 0 ? "00" : "30";
                      return `${hour}:${minutes}`;
                    }}
                  />
                  <Button onClick={() => handleAddHandleClick(day)} className="ml-2 border-none">+</Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleFillSliders}
            className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover-bg-teal-400 w-45"
          >
            Remplir Sliders
          </button>
          <button
            type="submit"
            className="focus:outline-none px-4 bg-teal-500 p-3 ml-3 rounded-lg text-white hover-bg-teal-400 w-45"
          >
            Confirmer
          </button>
        </div>
      </form>
    </div>
  );
}

export default ModalDispo;