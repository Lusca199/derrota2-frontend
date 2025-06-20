// Ficheiro: Testes/derrota2-frontend/src/components/NotificationItem.jsx
// Versão FINAL com lógica de navegação

import api from '../services/api';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAR O useNavigate

// MUI Imports
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
  // 2. OBTER A FUNÇÃO DE NAVEGAÇÃO
  const navigate = useNavigate();
  
  const handleClick = async () => {
    // A lógica de marcar como lida continua a mesma
    if (!notification.lida) {
      try {
        await api.patch(`/notificacoes/${notification.id_notif}/read`);
        onMarkAsRead(notification.id_notif); 
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }

    // 3. ADICIONAR A LÓGICA DE NAVEGAÇÃO
    // Verifica se existe um ID de origem para navegar
    if (!notification.origem_id) {
      console.log("Notificação sem origem_id, não é possível navegar.");
      return;
    }

    // Decide para onde navegar com base no tipo da notificação
    switch (notification.tipo) {
      case 'FOLLOW':
        navigate(`/profile/${notification.origem_id}`);
        break;
      
      case 'LIKE':
      case 'REPLY':
      case 'MENCION': // 'Mencionar' em português, 'MENCION' como está no seu ENUM
        navigate(`/post/${notification.origem_id}`);
        break;
      
      default:
        console.log(`Tipo de notificação (${notification.tipo}) não possui uma ação de navegação definida.`);
    }
  };

  return (
    <ListItem
      button
      onClick={handleClick}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: notification.lida ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <ListItemIcon>
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