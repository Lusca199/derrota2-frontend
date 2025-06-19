// src/components/Trends.jsx (Código atualizado com o visual do X)

import { Typography, List, Box, Paper, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
  const trends = [
    { category: 'Trending in Brazil', name: '#ReactJS', posts: '15.2k posts' },
    { category: 'Technology · Trending', name: 'Material-UI', posts: '10.1k posts' },
    { category: 'Entertainment · Trending', name: '#Derrotinha2NoAr', posts: '9.8k posts' },
    { category: 'Technology · Trending', name: '#Vite', posts: '8.7k posts' },
    { category: 'Web Development · Trending', name: '#NodeJS', posts: '7.5k posts' },
  ];

  return (
    // Usamos Paper para criar o cartão, mas com o nosso tema
    <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 4 }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">Trends para você</Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {trends.map(trend => (
          <TrendItem key={trend.name} {...trend} />
        ))}
      </List>
      <Box sx={{ p: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Typography color="primary.main">Show more</Typography>
      </Box>
    </Paper>
  );
}

export default Trends;