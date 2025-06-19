// src/theme.js (Novo arquivo)

import { createTheme } from '@mui/material/styles';

// Criamos nosso tema customizado, inspirado no seu styles.css e no X
const theme = createTheme({
  palette: {
    mode: 'dark', // Ativa o modo escuro
    primary: {
      main: '#731702', // O azul icônico do Twitter/X
    },
    background: {
      default: '#000000', // Fundo preto, como no X
      paper: '#15202B',   // Cor de "papel" para componentes como cards e a barra de topo
    },
    text: {
      primary: '#E7E9EA',   // Texto principal
      secondary: '#71767B', // Texto secundário (para @username, datas, etc.)
    },
    divider: '#2f3336', // Cor para as linhas divisórias
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none', // Botões no X não são em maiúsculas
      fontWeight: 'bold',
    }
  },
  components: {
    // Estilização padrão para o componente Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px', // Botões totalmente arredondados
        },
      },
    },
  },
});

export default theme;