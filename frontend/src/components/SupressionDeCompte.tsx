import { fetcher } from '../axios';
import { useAuth  } from '../lib/hooks/auth';
import React, { useState } from 'react';
import { message } from "antd";

function DeleteAccount() {
  const { user , logout } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
   
      const response = await fetcher.post("/auth/verify-password", {
        password: password,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        setMessage('Mot de passe incorrect. Impossible de supprimer le compte.');
        setLoading(false);
        return;
      }
  
     
        fetcher.delete(`/users/delete/${user?.id}`).then((res) => {
          if (res.data.success) {
            logout();
            // window.location.reload();
          } else {
            setMessage("Erreur lors de la suppression.");
          }
        });
  
 
    } catch (error) {
      setMessage("Erreur lors de la suppression du compte. Verifiez votre mot de passe.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Supprimer mon compte</h1>
        {!confirmDelete ? (
          <div>
            <p className="mb-4">Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</p>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
              onClick={() => setConfirmDelete(true)}
            >
              Oui, supprimer mon compte
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4">Veuillez entrer votre mot de passe pour confirmer la suppression de votre compte.</p>
            <input
              type="password"
              className="w-full mb-4 p-2 border rounded"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition mr-2"
              onClick={handleDelete}
              disabled={loading || !password}
            >
              {loading ? 'Suppression en cours...' : 'Confirmer la suppression'}
            </button>
            <button
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
              onClick={() => setConfirmDelete(false)}
            >
              Annuler
            </button>
          </div>
        )}
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

export default DeleteAccount;
