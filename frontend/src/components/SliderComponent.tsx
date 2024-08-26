import React, { useState } from "react";
import Slider from "antd/es/slider";
import Button from "antd/es/button";
interface Props {
  onDataFromSliderChild: (data: string[]) => void;
}
function SliderComponent({ onDataFromSliderChild }: Props) {
  const defaultSliderValues = [0, 10]; // Plage horaire par défaut

  const [sliderValues, setSliderValues] = useState(defaultSliderValues);
  const [selectedSliderValues, setSelectedSliderValues] =
    useState(defaultSliderValues);

  const handleSliderChange = (values: number[]) => {
    setSelectedSliderValues(values);
    setSliderValues(values);
  };

  const handleAddHandleClick = () => {
    const updatedValues = [...sliderValues];
    if (updatedValues.length + 2 <= 10) {
      // Limite à 6 handles au total (3 paires)
      const handle1 = Math.floor(Math.random() * 24);
      const handle2 = handle1 + 1;
      updatedValues.push(handle1, handle2);
      updatedValues.sort((a, b) => a - b); // Trie pour maintenir l'ordre
      setSliderValues(updatedValues);
    }
  };

  const handleRemoveHandleClick = () => {
    const updatedValues = [...sliderValues];
    if (updatedValues.length - 2 >= 2) {
      // Vérifie s'il reste au moins une paire de handles
      updatedValues.splice(-2, 2); // Supprime les deux dernières valeurs du tableau
      setSliderValues(updatedValues);
    }
  };

  const pairsToStringArray = () => {
    const pairs: string[] = [];
    for (let i = 0; i < sliderValues.length; i += 2) {
      pairs.push(`${sliderValues[i]}-${sliderValues[i + 1]}`);
    }
    return pairs;
  };

  const sliderValuesStringArray = pairsToStringArray();

  const sliderData = sliderValuesStringArray;

  const sendDataToParent = () => {
    // const corpData = settingToSend;
    onDataFromSliderChild(sliderData);
  };

  return (
    <div className="flex justify-center items-center flex-row">
      <form className="w-full h-full">
        <div className="mt-4 flex items-center">
          <button
            type="button"
            onClick={handleRemoveHandleClick}
            className="mx-4"
          >
            -
          </button>
          <div className="w-full">
            <Slider
              className="w-full"
              range={{ draggableTrack: true }}
              step={0.5}
              value={sliderValues}
              min={0}
              max={23.5}
              onChange={handleSliderChange}
              tipFormatter={(value?: number | undefined) => {
                if (typeof value === "undefined") {
                  return "";
                }
                const hour = Math.floor(value);
                const minutes = value % 1 === 0 ? "00" : "30";
                return `${hour}:${minutes}`;
              }}
            />
          </div>
          <button type="button" onClick={handleAddHandleClick} className="mx-4">
            +
          </button>
        </div>
        <div className="flex justify-end pt-2">

        </div>
      </form>
      <button onClick={sendDataToParent}>save</button>
    </div>
  );
}

export default SliderComponent;
