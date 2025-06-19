// src/pages/HomePage.jsx (versão simplificada)

import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePublicationForm from '../components/CreatePublicationForm';
import PublicationItem from '../components/PublicationItem';

// Importações do MUI
import { Typography, List, CircularProgress, Box } from '@mui/material';

function HomePage() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { signed } = useAuth();

  const fetchPublications = async () => {
    try {
      const response = await api.get('/publicacoes');
      setPublications(response.data);
    } catch (error) {
      console.error("Erro ao buscar publicações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleNewPublication = () => {
    fetchPublications();
  };

  const handleDeletePublication = (deletedPostId) => {
    setPublications(publications.filter(pub => pub.id_pub !== deletedPostId));
  };

  const handleUpdatePublication = () => {
    fetchPublications();
  };

  // O return agora é muito mais simples, sem lógica de layout
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        Página Inicial
      </Typography>

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
        <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          Nenhuma publicação encontrada. Siga pessoas para ver o que elas estão a partilhar!
        </Typography>
      )}
    </Box>
  );
}

export default HomePage;