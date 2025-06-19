// src/components/FollowButton.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function FollowButton({ profileId }) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Se o profileId for válido, busca o status da relação
    if (profileId) {
      setIsLoading(true);
      api.get(`/relationships/status/${profileId}`)
        .then(response => {
          setIsFollowing(response.data.following);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [profileId]);

  const handleToggleFollow = async () => {
    // Desativa o botão temporariamente para evitar cliques duplos
    setIsLoading(true); 
    try {
      if (isFollowing) {
        await api.delete(`/relationships/follow/${profileId}`);
        setIsFollowing(false);
      } else {
        await api.post(`/relationships/follow/${profileId}`);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
      alert("Ocorreu um erro ao processar a sua solicitação.");
    } finally {
      setIsLoading(false); // Reativa o botão
    }
  };

  // Não mostrar o botão se o usuário estiver a ver o seu próprio perfil
  if (user?.id === profileId) {
    return null;
  }
  
  return (
    <button onClick={handleToggleFollow} disabled={isLoading}>
      {isLoading ? 'A carregar...' : (isFollowing ? 'Deixar de Seguir' : 'Seguir')}
    </button>
  );
}

export default FollowButton;