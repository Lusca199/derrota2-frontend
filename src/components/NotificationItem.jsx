// Ficheiro: Testes/derrota2-frontend/src/components/NotificationItem.jsx
// NOVO FICHEIRO

import api from '../services/api';
import { Box, Typography, ListItem, ListItemIcon, ListItemText, Badge } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

// Mapeia o tipo de notificação vindo do backend para um ícone do Material-UI
const notificationIcons = {
  'FOLLOW': <PersonIcon fontSize="large" sx={{ color: 'primary.main' }} />,
  'LIKE': <FavoriteIcon fontSize="large" sx={{ color: 'error.main' }} />,
  'REPLY': <ChatBubbleIcon fontSize="large" sx={{ color: 'success.main' }} />,
  'MENCION': <AlternateEmailIcon fontSize="large" sx={{ color: 'info.main' }} />,
};

function NotificationItem({ notification, onMarkAsRead }) {
  
  const handleClick = async () => {
    // Se a notificação já não estiver lida, faz a chamada à API
    if (!notification.lida) {
      try {
        await api.patch(`/notificacoes/${notification.id_notif}/read`);
        // Avisa o componente pai (NotificationsPage) para atualizar o estado
        onMarkAsRead(notification.id_notif); 
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }
    // No futuro, podemos adicionar navegação aqui.
    // Ex: clicar numa notificação de 'like' leva para a publicação.
  };

  return (
    <ListItem
      button
      onClick={handleClick}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        // Aplica um fundo ligeiramente diferente se a notificação não foi lida
        bgcolor: notification.lida ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <ListItemIcon>
        {/* Mostra um ponto (Badge) se a notificação não foi lida */}
        <Badge color="primary" variant="dot" invisible={notification.lida}>
          {notificationIcons[notification.tipo] || <PersonIcon fontSize="large" />}
        </Badge>
      </ListItemIcon>
      <ListItemText
        primary={notification.mensagem}
        secondary={new Date(notification.timestamp).toLocaleString('pt-BR')}
      />
    </ListItem>
  );
}

export default NotificationItem;