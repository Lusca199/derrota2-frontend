// Ficheiro: Testes/derrota2-frontend/src/pages/ProfilePage.jsx
// Versão FINAL, COMPLETA e SEM ABSTRAÇÕES

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PublicationItem from '../components/PublicationItem';
import FollowButton from '../components/FollowButton';
import UserListModal from '../components/UserListModal';

import { Box, Typography, Paper, CircularProgress, Alert, Avatar, Grid, Button, IconButton, Modal, TextField, Fade, Backdrop, Stack, Menu, MenuItem, Divider, List } from '@mui/material';
import { blue } from '@mui/material/colors';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const editModalStyle = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)', width: 400,
  bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2,
};

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { signed, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = signed && user && Number(user.id) === Number(userId);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState({ nome: '', biografia: '', localizacao: '' });
  const [listModalState, setListModalState] = useState({ open: false, title: '', fetchUrl: '' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const fileInputRef = useRef(null);

  // Função unificada para buscar todos os dados (perfil e posts)
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileResponse = await api.get(`/usuarios/${userId}`);
      setProfile(profileResponse.data);

      if (profileResponse.data.is_blocked_by_me) {
        setPosts([]); // Se estiver bloqueado, limpa a lista de posts
      } else {
        const postsResponse = await api.get(`/publicacoes/user/${userId}`);
        setPosts(postsResponse.data);
        setEditData({
          nome: profileResponse.data.nome || '',
          biografia: profileResponse.data.biografia || '',
          localizacao: profileResponse.data.localizacao || '',
        });
      }
    } catch (err) {
      console.error("Erro ao buscar dados do perfil:", err);
      setError("Não foi possível carregar o perfil do usuário.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [userId, fetchProfileData]);

  // --- Funções de Handle COMPLETAS ---
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

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put('/usuarios/perfil', editData);
      setProfile(prevProfile => ({...prevProfile, ...response.data}));
      handleCloseEditModal();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Não foi possível atualizar o perfil.');
    }
  };

  const handleBlockUser = async () => {
    handleMenuClose();
    const usernameToBlock = profile?.email?.split('@')[0] || 'este usuário';
    const confirmBlock = window.confirm(`Tem a certeza de que deseja bloquear @${usernameToBlock}?`);
    if (confirmBlock) {
      try {
        await api.post(`/relationships/block/${userId}`);
        fetchProfileData(); // Re-busca os dados para mostrar a tela de bloqueio
      } catch (err) {
        alert(err.response?.data?.error || "Não foi possível bloquear o usuário.");
      }
    }
  };

  const handleUnblockUser = async () => {
    try {
      await api.delete(`/relationships/block/${userId}`);
      fetchProfileData(); // Re-busca os dados para mostrar o perfil completo novamente
    } catch (err) {
      alert(err.response?.data?.error || "Não foi possível desbloquear o usuário.");
    }
  };

  // Funções de handle para modais e menus
  const handleAvatarClick = () => { if (isOwnProfile) fileInputRef.current.click(); };
  const handleOpenEditModal = () => setOpenEditModal(true);
  const handleCloseEditModal = () => setOpenEditModal(false);
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const handleOpenFollowers = () => setListModalState({ open: true, title: 'Seguidores', fetchUrl: `/relationships/${userId}/followers` });
  const handleOpenFollowing = () => setListModalState({ open: true, title: 'Seguindo', fetchUrl: `/relationships/${userId}/following` });
  const handleCloseListModal = () => setListModalState({ open: false, title: '', fetchUrl: '' });
  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  // --- Lógica de Renderização ---
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Alert severity="warning">Perfil não encontrado.</Alert>;

  const fullImageUrl = profile.foto_perfil_url ? `http://localhost:3001${profile.foto_perfil_url}` : null;

  // Se o perfil estiver bloqueado, mostra esta UI simplificada
  if (profile.is_blocked_by_me) {
    const username = profile.email?.split('@')[0] || 'Este usuário';
    return (
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <Avatar src={fullImageUrl} sx={{ bgcolor: blue[500], width: 150, height: 150, fontSize: '4rem', margin: 'auto' }}>
          {!fullImageUrl && (profile.nome ? profile.nome[0].toUpperCase() : '?')}
        </Avatar>
        <Typography variant="h5" component="h1" sx={{ mt: 2 }}>
          @{username} está bloqueado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: '400px', margin: 'auto' }}>
          Você não pode ver as publicações ou o perfil de @{username}.
        </Typography>
        <Button variant="outlined" color="inherit" onClick={handleUnblockUser} sx={{ mt: 3, borderRadius: '9999px', borderColor: 'grey.500' }}>
          Desbloquear
        </Button>
      </Paper>
    );
  }

  // Se não estiver bloqueado, mostra o perfil completo normal
  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, height: '40px' }}>
          {isOwnProfile ? ( <Button variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditModal}>Editar Perfil</Button> )
           : signed ? (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleMenuOpen}><MoreHorizIcon /></IconButton>
              <FollowButton profileId={parseInt(userId, 10)} />
            </Stack>
           ) : null}
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar src={fullImageUrl} sx={{ bgcolor: blue[500], width: 150, height: 150, fontSize: '4rem', cursor: isOwnProfile ? 'pointer' : 'default', border: '2px solid white' }} onClick={handleAvatarClick} />
              {isOwnProfile && <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleAvatarClick} sx={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)', '&:hover': { backgroundColor: '#fff' } }}><PhotoCamera /></IconButton>}
            </Box>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box sx={{textAlign: {xs: 'center', md: 'left'}, width: '100%'}}>
              <Typography variant="h4" component="h1" gutterBottom>{profile.nome}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>@{profile.email.split('@')[0]}</Typography>
              <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap', minHeight: '40px' }}>{profile.biografia || 'Nenhuma biografia fornecida.'}</Typography>
              <Typography variant="body1" color="text.secondary"><strong>Localização:</strong> {profile.localizacao || 'Não informado.'}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: {xs: 'center', md: 'flex-start'} }}>
                  <Box onClick={handleOpenFollowing} sx={{cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}><Typography component="span" fontWeight="bold">{profile.following_count}</Typography><Typography component="span" color="text.secondary"> Seguindo</Typography></Box>
                  <Box onClick={handleOpenFollowers} sx={{cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}><Typography component="span" fontWeight="bold">{profile.followers_count}</Typography><Typography component="span" color="text.secondary"> Seguidores</Typography></Box>
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>Membro desde: {new Date(profile.criado_em).toLocaleDateString()}</Typography>
            </Box>
          </Grid>
        </Grid>
        {isOwnProfile && <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />}
      </Paper>

      <Divider sx={{ my: 1 }} />
      <Typography variant="h6" sx={{ px: 2, pt: 2, pb: 1 }}>Publicações</Typography>
      <List sx={{p: 0}}>
        {posts.length > 0 ? (
          posts.map(post => <PublicationItem key={post.id_pub} publication={post} />)
        ) : (
          <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>Este usuário ainda não fez publicações.</Typography>
        )}
      </List>

      <UserListModal open={listModalState.open} onClose={handleCloseListModal} title={listModalState.title} fetchUrl={listModalState.fetchUrl} />
      <Modal open={openEditModal} onClose={handleCloseEditModal}><Fade in={openEditModal}><Box sx={editModalStyle}><Typography variant="h6" component="h2" sx={{ mb: 2 }}>Editar seu perfil</Typography><TextField fullWidth label="Nome" name="nome" value={editData.nome} onChange={handleEditChange} sx={{ mb: 2 }} /><TextField fullWidth multiline rows={3} label="Biografia" name="biografia" value={editData.biografia} onChange={handleEditChange} sx={{ mb: 2 }} /><TextField fullWidth label="Localização" name="localizacao" value={editData.localizacao} onChange={handleEditChange} sx={{ mb: 2 }} /><Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button onClick={handleCloseEditModal}>Cancelar</Button><Button variant="contained" onClick={handleProfileUpdate}>Salvar Alterações</Button></Box></Box></Fade></Modal>
      <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}><MenuItem onClick={handleBlockUser} sx={{ color: 'error.main' }}>Bloquear @{profile?.email?.split('@')[0]}</MenuItem></Menu>
    </>
  );
}

export default ProfilePage;