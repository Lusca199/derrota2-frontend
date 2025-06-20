// src/components/CommentItem.jsx
// Versão FINAL com funcionalidade de resposta e formulário aninhado

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../services/api';

// Importações do MUI
import { Box, Typography, Avatar, Link, IconButton, TextField, Button, Stack } from '@mui/material';
import { blue } from '@mui/material/colors';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';


// --- NOVO SUB-COMPONENTE: Formulário específico para respostas ---
function ReplyForm({ publicationId, parentComment, onCancelReply, onCommentPosted }) {
  // Preenche o @username automaticamente para facilitar
  const authorToReply = parentComment.nome_autor.split(' ')[0];
  const [text, setText] = useState(`@${authorToReply} `);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      // Envia o comentário com o ID do pai para aninhar a resposta
      const response = await api.post(`/comentarios/${publicationId}`, { 
        texto: text, 
        coment_pai_id: parentComment.id_comentario 
      });
      onCommentPosted(response.data); // Avisa a página principal sobre o novo comentário
    } catch (error) {
      console.error('Erro ao postar resposta:', error);
      alert(error.response?.data?.error || 'Não foi possível enviar a sua resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, ml: 1, p: 1.5, bgcolor: 'action.focus', borderRadius: 2 }}>
      <TextField
        variant="standard"
        fullWidth
        multiline
        autoFocus
        placeholder="Poste a sua resposta"
        value={text}
        onChange={(e) => setText(e.target.value)}
        InputProps={{ disableUnderline: true }}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
        <Button size="small" onClick={onCancelReply}>Cancelar</Button>
        <Button type="submit" size="small" variant="contained" disabled={!text.trim() || submitting}>
          {submitting ? 'A responder...' : 'Responder'}
        </Button>
      </Stack>
    </Box>
  );
}


// --- Componente CommentItem atualizado para usar as novas props ---
function CommentItem({ comment, publicationId, isReplying, onStartReply, onCancelReply, onCommentPosted }) {
  const fullAuthorImageUrl = comment.autor_foto_perfil_url
    ? `http://localhost:3001${comment.autor_foto_perfil_url}`
    : null;

  return (
    <Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={fullAuthorImageUrl} sx={{ bgcolor: blue[500], width: 40, height: 40 }} component={RouterLink} to={`/profile/${comment.autor_id}`} />
        {comment.children && comment.children.length > 0 && (
          <Box sx={{ flexGrow: 1, width: '2px', bgcolor: 'divider', mt: 1 }} />
        )}
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
            <Box>
                <Link component={RouterLink} to={`/profile/${comment.autor_id}`} underline="hover" color="inherit" fontWeight="bold">
                  {comment.nome_autor}
                </Link>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  · {new Date(comment.criado_em).toLocaleDateString('pt-BR')}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', my: 1 }}>
              {comment.texto}
            </Typography>
        </Box>

        <Box sx={{ mt: 0.5, mb: 1 }}>
            <IconButton size="small" onClick={() => onStartReply(comment.id_comentario)} disabled={comment.nivel >= 5}>
                <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
        </Box>

        {/* --- Renderização condicional do formulário de resposta --- */}
        {isReplying && (
            <ReplyForm 
                publicationId={publicationId}
                parentComment={comment}
                onCancelReply={onCancelReply}
                onCommentPosted={onCommentPosted}
            />
        )}

        {/* --- A RECURSÃO AGORA PASSA TODAS AS PROPS PARA OS FILHOS --- */}
        {comment.children && comment.children.length > 0 && (
          <Box>
            {comment.children.map(childComment => (
              <CommentItem 
                  key={childComment.id_comentario} 
                  comment={childComment}
                  publicationId={publicationId}
                  isReplying={isReplying} // Aqui deveria ser o ID do comentário em resposta
                  onStartReply={onStartReply}
                  onCancelReply={onCancelReply}
                  onCommentPosted={onCommentPosted}
               />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default CommentItem;