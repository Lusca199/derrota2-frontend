// src/components/UserListModal.jsx (Novo Ficheiro)

import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

// Importações do MUI
import { Modal, Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Alert, Link, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { blue } from '@mui/material/colors';

// Estilo para a caixa do modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 2,
  display: 'flex',
  flexDirection: 'column'
};

function UserListModal({ open, onClose, title, fetchUrl }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Apenas busca os dados se o modal estiver aberto e tiver uma URL para buscar
    if (open && fetchUrl) {
      setLoading(true);
      setError('');
      setUsers([]); // Limpa a lista anterior

      api.get(fetchUrl)
        .then(response => {
          setUsers(response.data);
        })
        .catch(err => {
          console.error(`Erro ao buscar a lista de usuários de ${fetchUrl}:`, err);
          setError('Não foi possível carregar a lista de usuários.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, fetchUrl]); // O hook é re-executado quando o modal abre ou a URL muda

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', pb: 1, mb: 1 }}>
            <Typography variant="h6" component="h2">{title}</Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <List sx={{ overflowY: 'auto' }}>
            {users.length > 0 ? (
              users.map(user => (
                <ListItem 
                    button 
                    component={RouterLink} 
                    to={`/profile/${user.id_usuario}`} 
                    key={user.id_usuario}
                    onClick={onClose} // Fecha o modal ao clicar num usuário
                >
                  <ListItemAvatar>
                    <Avatar 
                        src={user.foto_perfil_url ? `http://localhost:3001${user.foto_perfil_url}` : null}
                        sx={{ bgcolor: blue[500] }}
                    >
                        {!user.foto_perfil_url && user.nome[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.nome} secondary={`@${user.email.split('@')[0]}`} />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Nenhum usuário encontrado.
              </Typography>
            )}
          </List>
        )}
      </Box>
    </Modal>
  );
}

export default UserListModal;