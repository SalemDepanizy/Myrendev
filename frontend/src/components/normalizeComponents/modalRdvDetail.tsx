import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faTag, faUser, faEnvelope, faMapMarkerAlt, faPhone, faImages } from '@fortawesome/free-solid-svg-icons';


type ModalProps = {
    isOpen: boolean;
    rendezvous?: any;
    onClose: () => void;
  };
  
  const ModalRdvDetails: React.FC<ModalProps> = ({ isOpen, rendezvous, onClose }) => {
    if (!isOpen || !rendezvous) return null;
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg w-11/12 max-w-3xl relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-xl">X</button>
          <h2 className="text-2xl font-bold mb-4">{rendezvous.title}</h2>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500 mr-3" /> <strong>Date:</strong> <span className="ml-2">{rendezvous.dateTime}</span></p>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faClock} className="text-green-500 mr-3" /> <strong>Creneau:</strong> <span className="ml-2">{rendezvous.creneau}</span></p>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faTag} className="text-yellow-500 mr-3" /> <strong>Description:</strong> <span className="ml-2">{rendezvous.description || 'Aucune description'}</span></p>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faUser} className="text-purple-500 mr-3" /> <strong>Client:</strong> <span className="ml-2">{rendezvous.payload.client.name}</span></p>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faEnvelope} className="text-red-500 mr-3" /> <strong>Email Client:</strong> <a href={`mailto:${rendezvous.payload.client.email}`} className="text-blue-600 hover:underline ml-2">{rendezvous.payload.client.email}</a></p>
          <p className="flex items-center mb-1"><FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-500 mr-3" /> <strong>Adresse Client:</strong> <span className="ml-2">{rendezvous.payload.client.address}, {rendezvous.payload.client.ville}, {rendezvous.payload.client.codePostal}</span></p>
          {rendezvous.payload.forfait && <p className="flex items-center mb-1"><FontAwesomeIcon icon={faTag} className="text-yellow-500 mr-3" /> <strong>Intervention:</strong> <span className="ml-2">{rendezvous.payload.forfait.name} {rendezvous.payload.forfait.heure} </span></p>}
          {rendezvous.payload.monitor && <p className="flex items-center mb-1"><FontAwesomeIcon icon={faUser} className="text-purple-500 mr-3" /> <strong>Collaborateur:</strong> <span className="ml-2">{rendezvous.payload.monitor.name}</span></p>}
          {rendezvous.payload.monitor && <p className="flex items-center mb-1"><FontAwesomeIcon icon={faEnvelope} className="text-red-500 mr-3" /> <strong>Email Collaborateur:</strong> <a href={`mailto:${rendezvous.payload.monitor.email}`} className="text-blue-600 hover:underline ml-2">{rendezvous.payload.monitor.email}</a></p>}
          {rendezvous.payload.monitor && <p className="flex items-center mb-1"><FontAwesomeIcon icon={faPhone} className="text-gray-600 mr-3" /> <strong>Téléphone Collaborateur:</strong> <span className="ml-2">{rendezvous.payload.monitor.phone}</span></p>}
          {rendezvous.images && rendezvous.images.length > 0 && (
            <div className="mt-4">
              <h3 className="flex items-center mb-3"><FontAwesomeIcon icon={faImages} className="text-gray-500 mr-3" /> Images:</h3>
              {/* {rendezvous.images.map((image) => (
                <img.payload
                  key={image.filename}
                  src={`path/to/images/${image.filename}`} // Remplace par le chemin correct
                  alt={image.filename}
                  className="max-w-xs mr-2 mb-2"
                />
              ))} */}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default ModalRdvDetails;