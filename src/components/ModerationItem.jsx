// Ficheiro: Testes/derrota2-frontend/src/components/ModerationItem.jsx
// NOVO FICHEIRO

import { useState } from 'react';

// Importações do MUI
import { Box, Typography, Button, Avatar, Paper, TextField, Divider, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

function ModerationItem({ post, onApprove, onReject }) {
  // Estado para controlar a visibilidade do campo de motivo da rejeição
  const [isRejecting, setIsRejecting] = useState(false);
  // Estado para armazenar o motivo da rejeição
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirmReject = () => {
    // Só executa a rejeição se um motivo for fornecido
    if (rejectionReason.trim()) {
      onReject(post.id_pub, rejectionReason);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider' }} elevation={0}>
      {/* Informações do autor e da publicação */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar src={post.autor_foto_perfil_url ? `http://localhost:3001${post.autor_foto_perfil_url}` : null}>
            {!post.autor_foto_perfil_url && post.nome_autor[0].toUpperCase()}
        </Avatar>
        <Box>
            <Typography variant="body1" fontWeight="bold">{post.nome_autor}</Typography>
            <Typography variant="caption" color="text.secondary">
                Postado em: {new Date(post.criado_em).toLocaleString('pt-BR')}
            </Typography>
        </Box>
      </Stack>
      
      <Typography sx={{ my: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {post.texto}
      </Typography>

      <Divider sx={{ my: 1 }}/>

      {/* Caixa de Ações */}
      {!isRejecting ? (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<HighlightOffIcon />}
            onClick={() => setIsRejecting(true)}
          >
            Rejeitar
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckCircleOutlineIcon />}
            onClick={() => onApprove(post.id_pub)}
          >
            Aprovar
          </Button>
        </Stack>
      ) : (
        // Caixa que aparece ao clicar em "Rejeitar"
        <Box>
            <TextField
                fullWidth
                multiline
                rows={2}
                label="Motivo da Rejeição (obrigatório)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                variant="outlined"
                sx={{ mb: 1 }}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="text" onClick={() => setIsRejecting(false)}>Cancelar</Button>
                <Button 
                    variant="contained" 
                    color="error"
                    onClick={handleConfirmReject}
                    disabled={!rejectionReason.trim()}
                >
                    Confirmar Rejeição
                </Button>
            </Stack>
        </Box>
      )}
    </Paper>
  );
}

export default ModerationItem;