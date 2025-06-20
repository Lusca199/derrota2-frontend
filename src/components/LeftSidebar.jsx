// src/components/LeftSidebar.jsx
// Versão final com link para Configurações e Moderação

import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; 

// Importações do MUI
import { Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Avatar, Typography, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// --- 1. IMPORTAR O NOVO ÍCONE DE CONFIGURAÇÕES ---
import SettingsIcon from '@mui/icons-material/Settings';
import { blue } from '@mui/material/colors';


function LeftSidebar() {
  const { signed, user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!signed) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notificacoes/unread-count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error("Não foi possível buscar a contagem de notificações:", error);
      }
    };

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalId);

  }, [signed]);


  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleAccountClick = (event) => setAnchorEl(event.currentTarget);
  const handleAccountClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleAccountClose();
    logout();
    navigate('/login');
  };

  const handleNavigateToSettings = () => {
    handleAccountClose();
    navigate('/settings');
  };

  if (!signed) {
    return null; 
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pr: 2 }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: '9999px', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><HomeIcon sx={{ fontSize: 28 }} /></ListItemIcon>
            <ListItemText primary={<Typography variant="h6">Página Inicial</Typography>} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/notificacoes" sx={{ borderRadius: '9999px', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: 28 }} />
              </Badge>
            </ListItemIcon>
            <ListItemText primary={<Typography variant="h6">Notificações</Typography>} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to={`/profile/${user.id}`} sx={{ borderRadius: '9999px', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon sx={{ fontSize: 28 }} /></ListItemIcon>
            <ListItemText primary={<Typography variant="h6">Meu Perfil</Typography>} />
          </ListItemButton>
        </ListItem>
        
        {user && user.role === 'MODERATOR' && (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/moderation" sx={{ borderRadius: '9999px', py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'warning.main' }}>
                <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
              </ListItemIcon>
              <ListItemText primary={<Typography variant="h6">Moderação</Typography>} />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      
      <Button variant="contained" fullWidth sx={{ mt: 2, py: 1.5, fontSize: '17px' }}>
        Postar
      </Button>
      
      <Box sx={{ flexGrow: 1 }} /> 

      <Box sx={{ mt: 'auto' }}>
        <Button 
          onClick={handleAccountClick}
          sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            textAlign: 'left',
            p: 1,
            borderRadius: '9999px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: blue[500], width: 40, height: 40 }}>{user.email[0].toUpperCase()}</Avatar>
            <Box>
              <Typography variant="body1" fontWeight="bold" sx={{lineHeight: 1.2}}>{user.email.split('@')[0]}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.2}}>@{user.email.split('@')[0]}</Typography>
            </Box>
          </Box>
          <MoreHorizIcon />
        </Button>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleAccountClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{mb: 1}}
        >
            {/* --- 2. NOVO ITEM DE MENU ADICIONADO AQUI --- */}
            <MenuItem onClick={handleNavigateToSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configurações
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{color: 'error.main'}}>
                Sair de @{user.email.split('@')[0]}
            </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default LeftSidebar;