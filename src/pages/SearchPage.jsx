// src/pages/SearchPage.jsx (Novo Ficheiro)

import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import api from '../services/api';
import PublicationItem from '../components/PublicationItem';

// Importações do MUI
import { Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Paper, Tabs, Tab } from '@mui/material';
import UserListModal from '../components/UserListModal';

// Componente para exibir um único usuário na lista de resultados
const UserResultItem = ({ user }) => (
    <ListItem button component={RouterLink} to={`/profile/${user.id_usuario}`}>
        <ListItemAvatar>
            <Avatar src={user.foto_perfil_url ? `http://localhost:3001${user.foto_perfil_url}` : null}>
                {!user.foto_perfil_url && user.nome[0].toUpperCase()}
            </Avatar>
        </ListItemAvatar>
        <ListItemText
            primary={user.nome}
            secondary={`@${user.email.split('@')[0]}`}
        />
    </ListItem>
);


function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Pega o termo de busca do URL (?q=...)
  
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0); // 0 para Publicações, 1 para Usuários

  useEffect(() => {
    if (!query) {
      setResults({ posts: [], users: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    api.get(`/search?q=${query}`)
      .then(response => {
        setResults(response.data);
      })
      .catch(err => {
        console.error("Erro na busca:", err);
        setError("Não foi possível realizar a busca.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [query]); // A busca é refeita sempre que o termo no URL muda

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
        <Box sx={{p: 2}}>
            <Typography variant="h5" fontWeight="bold">Resultados da Busca</Typography>
            <Typography color="text.secondary">Para: "{query}"</Typography>
        </Box>
        
        <Paper square>
            <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
                <Tab label={`Publicações (${results.posts.length})`} />
                <Tab label={`Usuários (${results.users.length})`} />
            </Tabs>
        </Paper>

        {/* Painel de Publicações */}
        {tab === 0 && (
            <Box>
                {results.posts.length > 0 ? (
                    results.posts.map(post => <PublicationItem key={post.id_pub} publication={post} />)
                ) : (
                    <Typography sx={{p: 3, textAlign: 'center', color: 'text.secondary'}}>Nenhuma publicação encontrada.</Typography>
                )}
            </Box>
        )}

        {/* Painel de Usuários */}
        {tab === 1 && (
             <Box>
                {results.users.length > 0 ? (
                    <List>
                        {results.users.map(user => <UserResultItem key={user.id_usuario} user={user} />)}
                    </List>
                ) : (
                    <Typography sx={{p: 3, textAlign: 'center', color: 'text.secondary'}}>Nenhum usuário encontrado.</Typography>
                )}
            </Box>
        )}
    </Box>
  );
}

export default SearchPage;