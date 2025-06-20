// src/pages/PublicationDetailPage.jsx
// Versão com o estado para gerir as respostas a comentários

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PublicationItem from '../components/PublicationItem';
import CommentItem from '../components/CommentItem.jsx';
import { Box, Typography, CircularProgress, TextField, Button, Avatar, Paper, Alert } from '@mui/material';

const buildCommentTree = (commentsList) => {
  const commentMap = {};
  const tree = [];
  commentsList.forEach(comment => {
    commentMap[comment.id_comentario] = { ...comment, children: [] };
  });
  commentsList.forEach(comment => {
    if (comment.coment_pai_id) {
      if (commentMap[comment.coment_pai_id]) {
        commentMap[comment.coment_pai_id].children.push(commentMap[comment.id_comentario]);
      }
    } else {
      tree.push(commentMap[comment.id_comentario]);
    }
  });
  return tree;
};


// O formulário principal para comentários de primeiro nível
const CommentForm = ({ publicationId, onCommentPosted }) => {
    const { signed, user } = useAuth();
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        
        setSubmitting(true);
        try {
            // Este formulário só envia comentários de primeiro nível (sem coment_pai_id)
            const response = await api.post(`/comentarios/${publicationId}`, { texto: text });
            onCommentPosted(response.data);
            setText('');
        } catch (error) {
            console.error('Erro ao postar comentário:', error);
            alert('Não foi possível enviar o seu comentário.');
        } finally {
            setSubmitting(false);
        }
    };

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


function PublicationDetailPage() {
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- 1. NOVO ESTADO PARA CONTROLAR A QUAL COMENTÁRIO ESTAMOS A RESPONDER ---
  const [replyingTo, setReplyingTo] = useState(null); // Guarda o ID do comentário pai

  useEffect(() => {
    const fetchPublicationAndComments = async () => {
      try {
        setLoading(true);
        setError('');
        const [pubResponse, commentsResponse] = await Promise.all([
          api.get(`/publicacoes/${publicationId}`),
          api.get(`/comentarios/${publicationId}`)
        ]);
        setPublication(pubResponse.data);
        const tree = buildCommentTree(commentsResponse.data);
        setCommentTree(tree);
      } catch (err) {
        setError('Não foi possível carregar a publicação e os comentários.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicationAndComments();
  }, [publicationId]);

  // --- 2. FUNÇÕES PARA ABRIR E FECHAR O MODO DE RESPOSTA ---
  const handleStartReply = (commentId) => {
    setReplyingTo(commentId);
  };
  
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCommentPosted = () => {
    // Por simplicidade, recarregamos a página para ver a nova resposta.
    // No futuro, podemos implementar uma atualização do estado sem reload.
    window.location.reload();
  };
  
  const handlePostDeleted = () => { navigate('/'); };
  const handlePostUpdated = (updatedPost) => { setPublication(updatedPost); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!publication) return <Alert severity="warning">Publicação não encontrada.</Alert>;

 return (
    <Paper elevation={0}>
      <PublicationItem 
        publication={publication} 
        onPostDeleted={handlePostDeleted} 
        onPostUpdated={handlePostUpdated}
      />
      <CommentForm publicationId={publicationId} onCommentPosted={handleCommentPosted} />
      <Box sx={{ p: 2 }}>
        {commentTree.length > 0 ? (
            commentTree.map((comment) => (
                // --- 3. PASSAR AS NOVAS PROPRIEDADES PARA CADA COMMENTITEM ---
                <CommentItem 
                    key={comment.id_comentario} 
                    comment={comment}
                    publicationId={publicationId}
                    isReplying={replyingTo === comment.id_comentario}
                    onStartReply={handleStartReply}
                    onCancelReply={handleCancelReply}
                    onCommentPosted={handleCommentPosted}
                />
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