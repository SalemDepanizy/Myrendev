import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "./axios";
import Button from "./components/Button";
import { Monitor } from "./Moniteurs";

function ForfaitEdit({ forfaitId, onClose }) {
  const [data, setData] = useState({
    name: "",
    heure: 0,
    selectMorePeople: false,
    numberOfPeople: 0,
    monitorId: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const {
    data: forfait,
    isLoading: loadingForfait,
    error: errorForfait,
    mutate: mutateForfait,
  } = useSWR(`/forfait/${forfaitId ?? id}`, async (url) => {
    if (!id && !forfaitId) return null;
    return (await fetcher.get(url)).data as {
      name: string;
      heure: number;
      selectMorePeople: boolean;
      numberOfPeople: number;
      monitorId: string ;
    };
  });


  useEffect(() => {
    if (!forfait) return;
    setData(forfait);
  }, [forfait]);

  const handleSubmit = async (event) => {
event.preventDefault();

    try{
      const response = await fetcher.patch(`/forfait/update/${forfaitId ?? id}`, data);
      if (response.status === 200) {
     
        // Optionally, refresh the list of students to reflect the change
        window.location.reload();
      } else {
        throw new Error("Failed to update student status");
      }
    } catch (error) {
      alert("Error updating student status");
    }

  };

  const {
    data: monitors,
    isLoading: loadingMonitors,
    error: errorMonitors,
  } = useSWR("/users/get/monitor", async (url) => {
    return (await fetcher.get(url)).data as Monitor[];
  });

  return (
    <div className="d-flex flex-column align-items-center">
      <form className="row g-3 " onSubmit={handleSubmit}>
        <div className="col-12">
          <label htmlFor="inputName" className="form-label">
            Nom
          </label>
          <input
            type="text"
            className="form-control"
            id="inputName"
            placeholder="Entrer le Nom complet"
            autoComplete="off"
            onChange={(e) => setData({ ...data, name: e.target.value })}
            value={data.name}
          />
        </div>
        <div className="col-12">
          <label htmlFor="inputHeure" className="form-label">
            Nombre d'heures
          </label>
          <input
            type="number"
            className="form-control"
            id="inputHeure"
            placeholder="Entrer le nombre d'heures"
            autoComplete="off"
            onChange={(e) =>
              setData({ ...data, heure: Number(e.target.value) })
            }
            value={data.heure}
          />
        </div>
        <div className="mt-4">
          <label
            htmlFor="monitorDropdown"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Sélectionnez un employer:
          </label>
          <select
            id="monitorDropdown"
            className="form-select"
            value={data.monitorId}
            onChange={(e) => {
              setData({ ...data, monitorId: e.target.value.trim() === "" ? "" : e.target.value });
            }}
          >
            <option value=" ">Tous</option>
            {monitors?.map((monitor, index) => (
              <option key={index} value={monitor.id}>
                {monitor.name} {monitor.lastname}
              </option>
            ))}
            
          </select>
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="selectMorePeople"
              onChange={(e) =>
                setData({ ...data, selectMorePeople: e.target.checked })
              }
              checked={data.selectMorePeople}
            />
            <label className="form-check-label" htmlFor="selectMorePeople">
              Sélectionner plus de personne sur l'intervention
            </label>
          </div>
        </div>
        {data.selectMorePeople && (
          <div className="col-12">
            <label htmlFor="numberOfPeople" className="form-label">
              Nombre de personnes à sélectionner
            </label>
            <input
              type="number"
              className="form-control"
              id="numberOfPeople"
              placeholder="Entrer le nombre de personnes"
              value={data.numberOfPeople}
              onChange={(e) =>
                setData({ ...data, numberOfPeople: Number(e.target.value) })
              }
            />
          </div>
        )}
        <div className="col-12">
          <Button type="submit">Modifier</Button>
        </div>
      </form>
    </div>
  );
}

export default ForfaitEdit;
