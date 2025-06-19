// src/components/LeftSidebar.jsx (Código atualizado com polimento visual)

import { useState }from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Avatar, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { blue } from '@mui/material/colors';


function LeftSidebar() {
  const { signed, user, logout } = useAuth();
  const navigate = useNavigate();

  // Lógica para controlar a abertura do menu da conta
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleAccountClick = (event) => setAnchorEl(event.currentTarget);
  const handleAccountClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleAccountClose();
    logout();
    navigate('/login');
  };

  if (!signed) {
    return null; 
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pr: 2 }}>
      {/* Itens de Navegação */}
      <List>
        {/* Usamos o `sx` para aumentar o tamanho da fonte e do ícone */}
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: '9999px', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><HomeIcon sx={{ fontSize: 28 }} /></ListItemIcon>
            <ListItemText primary={<Typography variant="h6">Página Inicial</Typography>} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to={`/profile/${user.id}`} sx={{ borderRadius: '9999px', py: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon sx={{ fontSize: 28 }} /></ListItemIcon>
            <ListItemText primary={<Typography variant="h6">Meu Perfil</Typography>} />
          </ListItemButton>
        </ListItem>
      </List>
      
      {/* Botão de Postar */}
      <Button variant="contained" fullWidth sx={{ mt: 2, py: 1.5, fontSize: '17px' }}>
        Postar
      </Button>
      
      {/* Empurra o menu do utilizador para o fundo */}
      <Box sx={{ flexGrow: 1 }} /> 

      {/* Menu do Utilizador */}
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
            <MenuItem onClick={handleLogout} sx={{fontWeight: 'bold'}}>
                Sair de @{user.email.split('@')[0]}
            </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default LeftSidebar;