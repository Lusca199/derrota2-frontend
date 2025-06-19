// src/pages/PublicationDetailPage.jsx (Versão final e corrigida)

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Importações de Componentes
import PublicationItem from '../components/PublicationItem';
import CommentItem from '../components/CommentItem.jsx'; // Usando .jsx para clareza

// Importações do MUI
import { Box, Typography, CircularProgress, TextField, Button, Avatar, Paper, Alert } from '@mui/material';

// --- Sub-componente: Formulário de Comentário ---
const CommentForm = ({ publicationId, onCommentPosted }) => {
    const { signed, user } = useAuth();
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        
        setSubmitting(true);
        try {
            const response = await api.post(`/comentarios/${publicationId}`, { texto: text });
            onCommentPosted(response.data); // Envia o novo comentário para a página pai atualizar a lista
            setText(''); // Limpa o campo de texto
        } catch (error) {
            console.error('Erro ao postar comentário:', error);
            alert('Não foi possível enviar o seu comentário.');
        } finally {
            setSubmitting(false);
        }
    };

    // O formulário só aparece se o usuário estiver logado
    if (!signed) return null;

    const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, display: 'flex', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Avatar sx={{ mt: 1 }}>{userInitial}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <TextField
                    variant="standard"
                    fullWidth
                    multiline
                    placeholder="Poste a sua resposta"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    InputProps={{ disableUnderline: true, sx: {fontSize: '1.1rem'} }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button type="submit" variant="contained" disabled={!text.trim() || submitting}>
                        {submitting ? 'A responder...' : 'Responder'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};


// --- Componente Principal da Página ---
function PublicationDetailPage() {
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca os dados da publicação e seus comentários
  useEffect(() => {
    const fetchPublicationAndComments = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Usamos Promise.all para fazer as duas requisições à API em paralelo, o que é mais eficiente
        const [pubResponse, commentsResponse] = await Promise.all([
          api.get(`/publicacoes/${publicationId}`),
          api.get(`/comentarios/${publicationId}`)
        ]);
        
        setPublication(pubResponse.data);
        setComments(commentsResponse.data);

      } catch (err) {
        setError('Não foi possível carregar a publicação e os comentários.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationAndComments();
  }, [publicationId]); // O hook é re-executado se o publicationId mudar

  // Função para adicionar um novo comentário à lista sem precisar recarregar a página
  const handleCommentPosted = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };
  
  // Funções de "placeholder" para o componente PublicationItem não quebrar
  const handlePostDeleted = () => { 
    alert('Publicação apagada com sucesso!');
    navigate('/'); 
  };
  const handlePostUpdated = (updatedPost) => { 
    setPublication(updatedPost); 
  };

  // --- Renderização condicional ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!publication) {
    return <Alert severity="warning" sx={{ m: 2 }}>Publicação não encontrada.</Alert>;
  }

  // --- Renderização principal ---
  return (
    <Paper elevation={0}>
      {/* Exibe o item da publicação principal */}
      <PublicationItem 
        publication={publication} 
        onPostDeleted={handlePostDeleted} 
        onPostUpdated={handlePostUpdated}
      />
      
      {/* Exibe o formulário para postar um novo comentário */}
      <CommentForm publicationId={publicationId} onCommentPosted={handleCommentPosted} />
      
      {/* Mapeia e exibe a lista de comentários existentes */}
      <Box>
        {comments.length > 0 ? (
            comments.map((comment) => (
                <CommentItem key={comment.id_comentario} comment={comment} />
            ))
        ) : (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                Ainda não há comentários. Seja o primeiro a responder!
            </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default PublicationDetailPage;