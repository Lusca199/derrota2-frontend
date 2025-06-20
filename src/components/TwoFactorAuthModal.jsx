// Ficheiro: Testes/derrota2-frontend/src/components/TwoFactorAuthModal.jsx
// NOVO FICHEIRO

import { useState, useEffect } from 'react';
import api from '../services/api';

// Importações do MUI
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Estilo para a caixa do modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 2, sm: 4 },
  display: 'flex',
  flexDirection: 'column',
};

function TwoFactorAuthModal({ open, onClose, onActivationSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // O useEffect é acionado sempre que o modal abre
  useEffect(() => {
    if (open) {
      // Reseta os estados para uma nova tentativa
      setLoading(true);
      setError('');
      setQrCodeUrl('');
      setToken('');
      setIsVerifying(false);

      // Busca o QR Code do backend
      api.post('/2fa/generate')
        .then(response => {
          setQrCodeUrl(response.data.qrCodeUrl);
        })
        .catch(err => {
          console.error("Erro ao gerar QR Code:", err);
          setError('Não foi possível iniciar o processo. Tente novamente mais tarde.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Por favor, insira um código válido de 6 dígitos.');
      return;
    }
    setIsVerifying(true);
    setError('');

    try {
      await api.post('/2fa/verify', { token });
      onActivationSuccess(); // Informa o componente pai do sucesso
      onClose(); // Fecha o modal
    } catch (err) {
      setError(err.response?.data?.error || 'Ocorreu um erro ao verificar o token.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Configurar Autenticação de Dois Fatores
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
        ) : error && !qrCodeUrl ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Stepper activeStep={qrCodeUrl ? 1 : 0} orientation="vertical">
            {/* Passo 1: Escanear o QR Code */}
            <Step key="scan-qr" active>
              <StepLabel>Escaneie o QR Code</StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Use a sua aplicação de autenticação (Google Authenticator, Authy, etc.) para escanear a imagem abaixo.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                  <img src={qrCodeUrl} alt="QR Code para 2FA" />
                </Box>
              </StepContent>
            </Step>
            
            {/* Passo 2: Verificar o Token */}
            <Step key="verify-token" active>
              <StepLabel>Verifique o Código</StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Insira o código de 6 dígitos gerado pela sua aplicação para finalizar a ativação.
                </Typography>
                <TextField
                  fullWidth
                  label="Código de 6 dígitos"
                  variant="outlined"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isVerifying}
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5em' } }}
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleVerify}
                    disabled={isVerifying || token.length !== 6}
                  >
                    {isVerifying ? <CircularProgress size={24} color="inherit"/> : 'Verificar e Ativar'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        )}
      </Box>
    </Modal>
  );
}

export default TwoFactorAuthModal;