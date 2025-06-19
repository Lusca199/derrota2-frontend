// src/components/CommentItem.jsx

import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Avatar, Link } from '@mui/material';
import { blue } from '@mui/material/colors';

function CommentItem({ comment }) {
  // Constrói a URL completa para a imagem de perfil do autor do comentário
  const fullAuthorImageUrl = comment.autor_foto_perfil_url
    ? `http://localhost:3001${comment.autor_foto_perfil_url}`
    : null;

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
      {/* Avatar do autor, que também é um link para o perfil dele */}
      <Avatar
        src={fullAuthorImageUrl}
        sx={{ bgcolor: blue[500], width: 40, height: 40, mt: 0.5 }}
        component={RouterLink}
        to={`/profile/${comment.autor_id}`}
        aria-label={`Perfil de ${comment.nome_autor}`}
      >
        {/* Se não houver imagem, mostra a primeira letra do nome */}
        {!fullAuthorImageUrl && (comment.nome_autor ? comment.nome_autor[0].toUpperCase() : '?')}
      </Avatar>
      
      <Box sx={{ width: '100%' }}>
        {/* Cabeçalho do comentário com nome do autor e data */}
        <Box>
          <Typography variant="body1" fontWeight="bold" component="span">
            <Link component={RouterLink} to={`/profile/${comment.autor_id}`} underline="hover" color="inherit">
              {comment.nome_autor}
            </Link>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
            · {new Date(comment.criado_em).toLocaleDateString('pt-BR')}
          </Typography>
        </Box>
        
        {/* O texto do comentário */}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', my: 1 }}>
          {comment.texto}
        </Typography>
      </Box>
    </Box>
  );
}

export default CommentItem;