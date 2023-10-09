import VectorSource from "ol/source/Vector";
import React, { ChangeEvent, Dispatch } from "react";

interface Props{
  onLoadGeoJSON: (file: File, delay: number) => void
  delay: number
  setDelay: Dispatch<React.SetStateAction<number>>
  vectorSource: VectorSource
}

export const MapControls = ({onLoadGeoJSON, delay, vectorSource, setDelay}: Props) => {

  const handleDelayChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDelay = parseInt(e.currentTarget.value, 10);
    if (!isNaN(newDelay)) {
      setDelay(newDelay);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      onLoadGeoJSON(file, delay);
    }
  };
  
  return (
    <div>
      <div className="inputms">
        <input
          type="text"
          placeholder="Delay (ms)"
          value={delay}
          onChange={handleDelayChange}
        />
      </div>
      <div>
        <input type="file" className="fileStyle" accept=".json" onChange={handleFileChange} />
      </div>
    </div>
  );
};