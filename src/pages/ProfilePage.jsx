// src/pages/ProfilePage.jsx (Versão final e COMPLETA com Bloqueio de Usuário)

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FollowButton from '../components/FollowButton';
import UserListModal from '../components/UserListModal';

// Importações do MUI (adicionamos Menu, MenuItem e MoreHorizIcon)
import { Box, Typography, Paper, CircularProgress, Alert, Avatar, Grid, Button, IconButton, Modal, TextField, Fade, Backdrop, Stack, Menu, MenuItem } from '@mui/material';
import { blue } from '@mui/material/colors';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Estilo para o Modal de Edição
const editModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate(); // Hook para redirecionar após o bloqueio
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { signed, user } = useAuth();

  const isOwnProfile = signed && Number(user.id) === Number(userId);

  // Estados para o Modal de Edição de Perfil
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState({ nome: '', biografia: '', localizacao: '' });

  // Estados para o Modal de Lista de Usuários
  const [listModalState, setListModalState] = useState({ open: false, title: '', fetchUrl: '' });

  // Estados para o novo menu de opções (Bloquear)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/usuarios/${userId}`)
      .then(response => {
        setProfile(response.data);
        setEditData({
          nome: response.data.nome || '',
          biografia: response.data.biografia || '',
          localizacao: response.data.localizacao || '',
        });
      })
      .catch(err => {
        console.error("Erro ao buscar perfil:", err);
        setError("Não foi possível carregar o perfil do usuário.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    try {
      const response = await api.put('/usuarios/perfil/foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(prevProfile => ({ ...prevProfile, foto_perfil_url: response.data.foto_perfil_url }));
    } catch (err) {
      console.error('Erro no upload:', err);
      alert('Falha ao carregar a nova foto de perfil.');
    }
  };
  
  const handleAvatarClick = () => { if (isOwnProfile) { fileInputRef.current.click(); } };
  const handleOpenEditModal = () => setOpenEditModal(true);
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleEditChange = (e) => { setEditData({ ...editData, [e.target.name]: e.target.value }); };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put('/usuarios/perfil', editData);
      setProfile(response.data); 
      handleCloseEditModal(); 
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Não foi possível atualizar o perfil.');
    }
  };

  const handleOpenFollowers = () => { setListModalState({ open: true, title: 'Seguidores', fetchUrl: `/relationships/${userId}/followers` }); };
  const handleOpenFollowing = () => { setListModalState({ open: true, title: 'Seguindo', fetchUrl: `/relationships/${userId}/following` }); };
  const handleCloseListModal = () => { setListModalState({ open: false, title: '', fetchUrl: '' }); };

  // Funções para o menu de opções e bloqueio
  const handleMenuOpen = (event) => { setMenuAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setMenuAnchorEl(null); };

  const handleBlockUser = async () => {
    handleMenuClose();
    const usernameToBlock = profile?.email?.split('@')[0] || 'este usuário';
    const confirmBlock = window.confirm(`Tem a certeza de que deseja bloquear @${usernameToBlock}?\nEsta ação irá removê-lo dos seus seguidores e impedi-lo de o seguir novamente.`);
    if (confirmBlock) {
      try {
        await api.post(`/relationships/block/${userId}`);
        alert(`@${usernameToBlock} foi bloqueado com sucesso.`);
        navigate('/');
      } catch (err) {
        console.error("Erro ao bloquear usuário:", err);
        alert("Não foi possível bloquear o usuário.");
      }
    }
  };
  
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Alert severity="warning">Perfil não encontrado.</Alert>;

  const fullImageUrl = profile.foto_perfil_url ? `http://localhost:3001${profile.foto_perfil_url}` : null;

  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, height: '40px' }}>
          {isOwnProfile ? (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditModal}>
              Editar Perfil
            </Button>
          ) : signed ? (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleMenuOpen}>
                <MoreHorizIcon />
              </IconButton>
              <FollowButton profileId={parseInt(userId, 10)} />
            </Stack>
          ) : null}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={fullImageUrl} sx={{ bgcolor: blue[500], width: 150, height: 150, fontSize: '4rem', cursor: isOwnProfile ? 'pointer' : 'default', border: '2px solid white' }} onClick={handleAvatarClick}>
                {!fullImageUrl && (profile.nome ? profile.nome[0].toUpperCase() : '?')}
              </Avatar>
              {isOwnProfile && (
                <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleAvatarClick} sx={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)', '&:hover': { backgroundColor: '#fff' } }}>
                  <PhotoCamera />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{textAlign: {xs: 'center', md: 'left'}, width: '100%'}}>
              <Typography variant="h4" component="h1" gutterBottom>
                {profile.nome}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                @{profile.email.split('@')[0]}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap', minHeight: '40px' }}>
                {profile.biografia || 'Nenhuma biografia fornecida.'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Localização:</strong> {profile.localizacao || 'Não informado.'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                  <Box onClick={handleOpenFollowing} sx={{cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}>
                      <Typography component="span" fontWeight="bold">{profile.following_count}</Typography>
                      <Typography component="span" color="text.secondary"> Seguindo</Typography>
                  </Box>
                  <Box onClick={handleOpenFollowers} sx={{cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}>
                      <Typography component="span" fontWeight="bold">{profile.followers_count}</Typography>
                      <Typography component="span" color="text.secondary"> Seguidores</Typography>
                  </Box>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                  Membro desde: {new Date(profile.criado_em).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        {isOwnProfile && ( <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" /> )}
      </Paper>

      <UserListModal 
        open={listModalState.open}
        onClose={handleCloseListModal}
        title={listModalState.title}
        fetchUrl={listModalState.fetchUrl}
      />
      
      <Modal open={openEditModal} onClose={handleCloseEditModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
        <Fade in={openEditModal}>
          <Box sx={editModalStyle}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Editar seu perfil</Typography>
            <TextField fullWidth label="Nome" name="nome" value={editData.nome} onChange={handleEditChange} sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={3} label="Biografia" name="biografia" value={editData.biografia} onChange={handleEditChange} sx={{ mb: 2 }} />
            <TextField fullWidth label="Localização" name="localizacao" value={editData.localizacao} onChange={handleEditChange} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseEditModal}>Cancelar</Button>
              <Button variant="contained" onClick={handleProfileUpdate}>Salvar Alterações</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleBlockUser} sx={{ color: 'error.main' }}>
          Bloquear @{profile?.email?.split('@')[0]}
        </MenuItem>
      </Menu>
    </>
  );
}

export default ProfilePage;