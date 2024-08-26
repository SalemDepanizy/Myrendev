import React, { useState } from 'react'
import { DatePicker, ConfigProvider } from 'antd';
import frFR from 'antd/es/locale/fr_FR'; // Import correct pour la locale française
import { fetcher } from '../axios';
import axios, { AxiosError } from 'axios';



function UpdateDateClient({rendezvousId}:{rendezvousId:string}) {
    const [dateTimeMod, setDateTimeMod] = useState('');
    function handleDateTimeChange(_, dateString) {
        setDateTimeMod(dateString);
      }



      async function updateRendezvous(rendezvousId) {
        console.log('')
        try {
            const response = await fetcher.patch(`/rendezvous/update-date/${rendezvousId}`, {
              dateTime: new Date(dateTimeMod),
              rendezvousId
            });
        
            if (response.data.success) {
              window.location.reload(); // Recharger la page entière après la mise à jour réussie
            }
          } catch (error) {
            if (axios.isAxiosError(error)) {
              const axiosError = error as AxiosError;
              console.error('Erreur Axios lors de la mise à jour du rendez-vous :', axiosError.response?.status);
              
              // Gérer les erreurs en fonction du code de statut HTTP
              if (axiosError.response?.status === 404) {
                // Gérer le cas où la ressource n'est pas trouvée (par exemple, afficher un message à l'utilisateur)
              } else {
                // Gérer d'autres erreurs HTTP
              }
            } else {
              console.error('Erreur inattendue lors de la mise à jour du rendez-vous :', error);
              // Gérer d'autres types d'erreurs
            }
          }
      }
      

  return (
    <div>

        <h1>Sélectionner une date et une heure</h1>
      <div className='pt-4'>
          <ConfigProvider locale={frFR}>
            <DatePicker onChange={handleDateTimeChange} />
          </ConfigProvider>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => updateRendezvous(rendezvousId)}
      >
        Mettre à jour le rendez-vous
      </button>

    </div>
  )
}

export default UpdateDateClient