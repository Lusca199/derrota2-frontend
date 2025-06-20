// Ficheiro: Testes/derrota2-frontend/src/pages/NotificationsPage.jsx
// NOVO FICHEIRO

import { useState, useEffect } from 'react';
import api from '../services/api';

// Componentes MUI
import { Box, Typography, CircularProgress, Alert, List } from '@mui/material';

// Componente que criaremos a seguir para renderizar cada item
import NotificationItem from '../components/NotificationItem';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efeito para buscar as notificações quando o componente é montado
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notificacoes');
        setNotifications(response.data);
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
        setError('Não foi possível carregar as suas notificações.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // O array vazio significa que este efeito executa apenas uma vez

  // Função para passar ao NotificationItem para atualizar o estado localmente
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id_notif === notificationId ? { ...n, lida: true } : n
      )
    );
  };

  // Renderização condicional
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ p: 2, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
        Notificações
      </Typography>

      {notifications.length > 0 ? (
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id_notif} 
              notification={notification} 
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </List>
      ) : (
        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
          Você não tem nenhuma notificação ainda.
        </Typography>
      )}
    </Box>
  );
}

export default NotificationsPage;