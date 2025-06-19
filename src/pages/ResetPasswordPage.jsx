// src/pages/ResetPasswordPage.jsx (Novo Ficheiro)

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

// Importações do MUI
import { Button, TextField, Box, Typography, Container, Alert, CircularProgress, Link as MuiLink } from '@mui/material';

function ResetPasswordPage() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição não encontrado. Por favor, solicite um novo link.');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/usuarios/resetar-senha', { token, senha });
      setSuccess(response.data.message + ' Você será redirecionado para o login em 5 segundos.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível redefinir a senha.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
        <Container component="main" maxWidth="xs">
            <Alert severity="error" sx={{ mt: 4 }}>Token inválido ou não fornecido.</Alert>
            <MuiLink href="/esqueci-senha" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                Solicitar um novo link
            </MuiLink>
        </Container>
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Crie uma Nova Senha
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nova Senha"
            type="password"
            id="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={loading || !!success}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Nova Senha"
            type="password"
            id="confirmPassword"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            disabled={loading || !!success}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !senha || !confirmarSenha || !!success}
          >
            {loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default ResetPasswordPage;