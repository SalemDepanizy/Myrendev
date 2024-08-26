import { format, parseISO } from "date-fns";
import React from "react";
import { fr } from "date-fns/locale";
function Modal({ event, onClose }) {
  console.log(' Modal event:', event);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
       
        <p className="  mb-2">Le {format(
                  parseISO(event.dateTime),
                  "dd MMMM yyyy ",
                  {
                    locale: fr,
                  }
                )} </p>
        <p className="">Creneau : {event.creneau}</p>
        <p className="">Intervenant : {event.monitor.name}</p>
        <p className="">Contact de l'intervenant :  <a href={`mailto:${event.monitor.email}`}>{event.client.email}</a></p>
        <p className=""> Client: {event.client.name} {event.client.lastname}</p>
        <p className=""> Adresse : {event.client.address} {event.client.codePostal}</p>
        <p>Contact du client : <a href={`mailto:${event.client.email}`}>{event.client.email}</a></p>
      </div>
    </div>
  );
}

export default Modal;
