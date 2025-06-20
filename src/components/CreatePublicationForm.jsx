// src/components/CreatePublicationForm.jsx (versão com upload de IMAGEM e VÍDEO)

import { useState, useRef } from 'react';
import api from '../services/api';

// Importações do MUI (adicionamos MovieIcon e CloseIcon)
import { Box, TextField, Button, Alert, IconButton, CircularProgress } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie'; // Ícone atualizado
import CloseIcon from '@mui/icons-material/Close';

function CreatePublicationForm({ onNewPublication }) {
  const [texto, setTexto] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState(''); // 1. NOVO ESTADO para guardar o tipo de mídia
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setMediaType(file.type); // Guarda o tipo do ficheiro (ex: 'image/jpeg' ou 'video/mp4')
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType(''); // Limpa também o tipo
    fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!texto.trim() && !mediaFile) {
      setError('A publicação precisa de ter texto ou um ficheiro de mídia.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('texto', texto);
    if (mediaFile) {
      formData.append('publicationMedia', mediaFile);
    }

    try {
      const response = await api.post('/publicacoes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTexto('');
      removeMedia();
      onNewPublication(response.data);
    } catch (err) {
      console.error('Erro ao criar publicação:', err);
      const errorMessage = err.response?.data?.error || 'Não foi possível criar a publicação. Verifique o tamanho e tipo do ficheiro.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="O que está acontecendo?"
          multiline
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          fullWidth
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { fontSize: '20px', paddingY: '12px' } }}
        />

        {/* --- 2. LÓGICA DE PRÉ-VISUALIZAÇÃO CONDICIONAL --- */}
        {mediaPreview && (
          <Box sx={{ mt: 2, position: 'relative' }}>
            <IconButton onClick={removeMedia} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'} }}>
              <CloseIcon sx={{color: 'white'}} />
            </IconButton>
            
            {/* Se for imagem, mostra <img>. Se for vídeo, mostra <video>. */}
            {mediaType.startsWith('image/') ? (
              <img src={mediaPreview} alt="Pré-visualização" style={{ width: '100%', borderRadius: '16px', maxHeight: '400px', objectFit: 'cover' }} />
            ) : mediaType.startsWith('video/') ? (
              <video src={mediaPreview} controls autoPlay muted style={{ width: '100%', borderRadius: '16px', maxHeight: '400px' }} />
            ) : null}
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          {/* --- 3. INPUT AGORA ACEITA IMAGEM E VÍDEO --- */}
          <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleMediaChange} hidden />
          
          <IconButton color="primary" onClick={() => fileInputRef.current.click()}>
            <MovieIcon />
          </IconButton>
          
          <Button type="submit" variant="contained" disabled={loading || (!texto.trim() && !mediaFile)} sx={{ px: 2, py: 1, fontSize: '15px' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Publicar'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default CreatePublicationForm;