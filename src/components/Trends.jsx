import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importações do MUI
import { Typography, List, Box, Paper, IconButton, TextField, InputAdornment } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';

// Componente para um único item de tendência, para reutilização
const TrendItem = ({ category, name, posts }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      py: 1.5,
      px: 2,
      '&:hover': { bgcolor: 'action.hover' },
      cursor: 'pointer'
    }}
  >
    <Box>
      <Typography variant="caption" color="text.secondary">{category}</Typography>
      <Typography variant="body1" fontWeight="bold">{name}</Typography>
      <Typography variant="caption" color="text.secondary">{posts}</Typography>
    </Box>
    <IconButton size="small">
      <MoreHorizIcon />
    </IconButton>
  </Box>
);

function Trends() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Função para lidar com a submissão da busca
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navega para a página de busca, passando o termo como um parâmetro de URL
      navigate(`/search?q=${searchTerm.trim()}`);
      setSearchTerm(''); // Limpa o campo após a busca
    }
  };

  const trends = [
    { category: 'Trending in Brazil', name: '#ReactJS', posts: '15.2k posts' },
    { category: 'Technology · Trending', name: 'Material-UI', posts: '10.1k posts' },
    { category: 'Entertainment · Trending', name: '#Derrotinha2NoAr', posts: '9.8k posts' },
    { category: 'Technology · Trending', name: '#Vite', posts: '8.7k posts' },
    { category: 'Web Development · Trending', name: '#NodeJS', posts: '7.5k posts' },
  ];

  return (
    // O Paper serve como o container principal para a coluna da direita
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 4 }}>
      
      {/* Secção da Barra de Busca */}
      <Box sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Buscar no Derrotinha2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: '9999px', bgcolor: 'action.focus' } // Estilo arredondado e com fundo
            }}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>

      {/* Secção das Trends */}
      <Box sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ px: 2, pb: 1 }}>Trends para você</Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {trends.map(trend => (
          <TrendItem key={trend.name} {...trend} />
        ))}
      </List>
      <Box sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer', borderTop: 1, borderColor: 'divider' }}>
          <Typography color="primary.main">Show more</Typography>
      </Box>
    </Paper>
  );
}

export default Trends;
