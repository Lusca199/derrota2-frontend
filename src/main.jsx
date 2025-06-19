// src/main.jsx (Código atualizado)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 1. Importe o ThemeProvider e o nosso tema
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Nosso novo arquivo de tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envolva toda a aplicação com o ThemeProvider */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline "reseta" o CSS para garantir consistência */}
      <CssBaseline /> 
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);