// Ficheiro: Testes/derrota2-frontend/src/pages/ModerationPage.jsx
// Versão FINAL e funcional

import { useState, useEffect } from 'react';
import api from '../services/api';
import ModerationItem from '../components/ModerationItem'; // 1. Importar o novo componente

// Importações do MUI
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

function ModerationPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const response = await api.get('/moderation/queue');
        setQueue(response.data);
      } catch (err) {
        console.error("Erro ao buscar a fila de moderação:", err);
        setError('Não foi possível carregar a fila de moderação. Verifique as suas permissões.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  // 2. Implementar a lógica da função de aprovação
  const handleApprove = async (pubId) => {
    try {
      await api.post(`/moderation/approve/${pubId}`);
      // Remove o item da fila localmente para atualizar a UI instantaneamente
      setQueue(prevQueue => prevQueue.filter(post => post.id_pub !== pubId));
    } catch (err) {
      console.error("Erro ao aprovar publicação:", err);
      alert('Não foi possível aprovar a publicação.');
    }
  };

  // 2. Implementar a lógica da função de rejeição
  const handleReject = async (pubId, motivo) => {
    try {
      await api.post(`/moderation/reject/${pubId}`, { motivo });
      // Remove o item da fila localmente
      setQueue(prevQueue => prevQueue.filter(post => post.id_pub !== pubId));
    } catch (err) {
      console.error("Erro ao rejeitar publicação:", err);
      alert('Não foi possível rejeitar a publicação.');
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{p: 2}}>
      <Typography variant="h5" sx={{ pb: 2, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
        Fila de Moderação
      </Typography>

      {queue.length === 0 ? (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          Nenhuma publicação pendente. Bom trabalho!
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {/* 3. Usar o ModerationItem para renderizar cada post */}
          {queue.map((post) => (
            <ModerationItem 
                key={post.id_pub} 
                post={post} 
                onApprove={handleApprove} 
                onReject={handleReject} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ModerationPage;