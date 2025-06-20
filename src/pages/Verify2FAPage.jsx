// Ficheiro: Testes/derrota2-frontend/src/pages/Verify2FAPage.jsx
// NOVO FICHEIRO

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Importações do MUI
import { Button, TextField, Box, Typography, Container, Alert, CircularProgress } from '@mui/material';

function Verify2FAPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { finish2FA_Login } = useAuth();
  const navigate = useNavigate();

  // Verifica se o token de pré-autenticação existe ao carregar a página
  useEffect(() => {
    const preAuthToken = sessionStorage.getItem('@AppX:preAuthToken');
    if (!preAuthToken) {
      // Se não houver token, o usuário não deveria estar aqui. Redireciona para o login.
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const preAuthToken = sessionStorage.getItem('@AppX:preAuthToken');
    if (!preAuthToken) {
        setError("Sessão inválida. Por favor, faça o login novamente.");
        setLoading(false);
        return;
    }

    try {
      // Chama a API para validar o código de 6 dígitos e o token temporário
      const response = await api.post('/2fa/validate', { 
        preAuthToken: preAuthToken,
        token: token 
      });

      // Se a validação for bem-sucedida, a API retorna o token final
      const { token: finalToken } = response.data;
      
      // Usa a função do AuthContext para finalizar o processo de login
      finish2FA_Login(finalToken);

    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível verificar o código.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Verificação de Dois Fatores
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Insira o código de 6 dígitos da sua aplicação de autenticação.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="token"
            label="Código de Verificação"
            name="token"
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' } }}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || token.length !== 6}
          >
            {loading ? <CircularProgress size={24} /> : 'Verificar'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Verify2FAPage;