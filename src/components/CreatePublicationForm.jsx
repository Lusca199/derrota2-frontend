// src/components/CreatePublicationForm.jsx (versão com upload de mídia)

import { useState, useRef } from 'react';
import api from '../services/api';

// Importações do MUI (adicionamos IconButton, Image, e Close)
import { Box, TextField, Button, Alert, IconButton, CircularProgress } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

function CreatePublicationForm({ onNewPublication }) {
  const [texto, setTexto] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Criamos uma referência para o input de ficheiro escondido
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file)); // Gera uma URL local para pré-visualização
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    fileInputRef.current.value = null; // Limpa o valor do input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!texto.trim() && !mediaFile) {
      setError('A publicação precisa de ter texto ou imagem.');
      return;
    }
    setLoading(true);

    // Usamos FormData para enviar ficheiros e texto juntos
    const formData = new FormData();
    formData.append('texto', texto);
    if (mediaFile) {
      formData.append('publicationMedia', mediaFile); // O nome 'publicationMedia' deve ser o mesmo do back-end
    }

    try {
      const response = await api.post('/publicacoes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // O Axios geralmente faz isso sozinho com FormData
        },
      });
      // Limpa o formulário após o sucesso
      setTexto('');
      removeMedia();
      onNewPublication(response.data);
    } catch (err) {
      console.error('Erro ao criar publicação:', err);
      setError('Não foi possível criar a publicação. Tente novamente.');
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

        {/* Pré-visualização da imagem selecionada */}
        {mediaPreview && (
          <Box sx={{ mt: 2, position: 'relative' }}>
            <IconButton onClick={removeMedia} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'} }}>
              <CloseIcon sx={{color: 'white'}} />
            </IconButton>
            <img src={mediaPreview} alt="Pré-visualização" style={{ width: '100%', borderRadius: '16px', maxHeight: '400px', objectFit: 'cover' }} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          {/* Input de ficheiro escondido */}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleMediaChange} hidden />
          
          {/* Botão para acionar o input de ficheiro */}
          <IconButton color="primary" onClick={() => fileInputRef.current.click()}>
            <ImageIcon />
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