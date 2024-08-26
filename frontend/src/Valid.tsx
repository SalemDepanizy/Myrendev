import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function UnsubscribePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/desabonnement/${token}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Échec de la désinscription.');
        }
      })
      .then(() => {
        alert('Vous avez été désabonné avec succès.');
        navigate('/'); // Redirige l'utilisateur vers la page d'accueil après désinscription
      })
      .catch((error) => {
        console.error('Erreur lors de la désinscription:', error);
        setError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [token, navigate]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <div>
      Vous avez été désabonné avec succès.
    </div>
  );
}

export default UnsubscribePage;
