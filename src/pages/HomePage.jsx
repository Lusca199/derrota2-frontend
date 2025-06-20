// src/pages/HomePage.jsx (versão final com abas de feed)

import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePublicationForm from '../components/CreatePublicationForm';
import PublicationItem from '../components/PublicationItem';

// Importações do MUI (adicionamos Tabs e Tab)
import { Typography, List, CircularProgress, Box, Tabs, Tab } from '@mui/material';

function HomePage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signed } = useAuth();

  // 1. Estado para controlar a aba ativa: 'foryou' ou 'following'
  const [currentTab, setCurrentTab] = useState('foryou');

  // 2. useEffect agora depende de `currentTab` para refazer a busca
  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      // Constrói a URL com base na aba ativa
      const url = currentTab === 'following' 
        ? '/publicacoes?feedType=following' 
        : '/publicacoes';
      
      try {
        const response = await api.get(url);
        setPublications(response.data);
      } catch (error) {
        console.error("Erro ao buscar publicações:", error);
        setPublications([]); // Limpa as publicações em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [currentTab]); // A dependência faz com que a função execute sempre que a aba mudar

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleNewPublication = (newPublication) => {
    // Adiciona a nova publicação ao topo da lista atual
    setPublications(prevPublications => [newPublication, ...prevPublications]);
    // Opcional: Mudar para a aba "Seguindo" para ver o próprio post recém-criado
    setCurrentTab('following');
  };

  const handleDeletePublication = (deletedPostId) => {
    setPublications(publications.filter(pub => pub.id_pub !== deletedPostId));
  };

  const handleUpdatePublication = (updatedPublication) => {
    setPublications(
      publications.map(pub =>
        pub.id_pub === updatedPublication.id_pub ? updatedPublication : pub
      )
    );
  };
  
  // 4. Mensagem de feed vazio dinâmica
  const emptyFeedMessage = currentTab === 'following'
    ? 'Nenhuma publicação encontrada no seu feed. Siga pessoas para ver o que elas partilham!'
    : 'Ainda não há publicações na plataforma.';

  return (
    <Box>
      <Typography variant="h5" sx={{ px: 2, pt: 2, pb: 1, fontWeight: 'bold' }}>
        Página Inicial
      </Typography>

      {/* 3. Interface de Abas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Para Si" value="foryou" />
          <Tab label="Seguindo" value="following" />
        </Tabs>
      </Box>

      {signed && <CreatePublicationForm onNewPublication={handleNewPublication} />}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : publications.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
          {publications.map(pub => (
            <PublicationItem
              key={pub.id_pub}
              publication={pub}
              onPostDeleted={handleDeletePublication}
              onPostUpdated={handleUpdatePublication}
            />
          ))}
        </List>
      ) : (
        <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary', p: 2 }}>
          {emptyFeedMessage}
        </Typography>
      )}
    </Box>
  );
}

export default HomePage;