// Ficheiro: Testes/derrota2-frontend/src/pages/SettingsPage.jsx
// VERSÃO FINAL COM MODAL INTEGRADO

import { useState, useEffect } from 'react';
import api from '../services/api';
import TwoFactorAuthModal from '../components/TwoFactorAuthModal'; // 1. IMPORTAR O NOVO MODAL

// Importações do MUI
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

function SettingsPage() {
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [accountSettings, setAccountSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [is2FAModalOpen, set2FAModalOpen] = useState(false);

  // Função para buscar todos os dados, que pode ser chamada novamente
  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [notifResponse, accountResponse] = await Promise.all([
        api.get('/settings/notifications'),
        api.get('/settings/account')
      ]);
      setNotificationSettings(notifResponse.data);
      setAccountSettings(accountResponse.data);
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
      setError('Não foi possível carregar as suas configurações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const handleSettingChange = async (event) => {
    const { name, checked } = event.target;
    const oldSettings = { ...notificationSettings };
    const newSettings = { ...notificationSettings, [name]: checked };
    setNotificationSettings(newSettings);
    try {
      await api.put('/settings/notifications', newSettings);
    } catch (err) {
      console.error("Erro ao atualizar configurações:", err);
      setError('Não foi possível salvar a alteração. Por favor, tente novamente.');
      setNotificationSettings(oldSettings);
    }
  };

  // 2. FUNÇÃO CALLBACK para ser chamada quando a 2FA for ativada com sucesso
  const handle2FAActivationSuccess = () => {
    // Atualiza o estado local para refletir a mudança sem precisar recarregar a página
    setAccountSettings(prev => ({ ...prev, autenticacao_2fa: true }));
    // Poderíamos também exibir uma notificação de sucesso aqui
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ p: 2, fontWeight: 'bold' }}>
        Configurações
      </Typography>
      <Divider />
      
      {accountSettings && (
        <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Segurança da Conta
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                    <Typography>Autenticação de dois fatores</Typography>
                    <Typography variant="body2" color={accountSettings.autenticacao_2fa ? 'success.main' : 'text.secondary'}>
                        {accountSettings.autenticacao_2fa ? 'Ativada' : 'Inativa. Proteja a sua conta.'}
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<LockIcon />}
                    onClick={() => set2FAModalOpen(true)}
                    disabled={accountSettings.autenticacao_2fa}
                >
                    {accountSettings.autenticacao_2fa ? 'Gerir' : 'Ativar'}
                </Button>
            </Box>
        </Paper>
      )}

      {notificationSettings && (
        <Paper elevation={0} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Notificações
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione os tipos de notificações que você deseja receber.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={notificationSettings.notif_mencoes} onChange={handleSettingChange} name="notif_mencoes" />}
              label="Menções"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.notif_respostas} onChange={handleSettingChange} name="notif_respostas" />}
              label="Respostas"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.notif_novos_seguidores} onChange={handleSettingChange} name="notif_novos_seguidores" />}
              label="Novos seguidores"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.notif_curtidas} onChange={handleSettingChange} name="notif_curtidas" />}
              label="Curtidas"
            />
          </FormGroup>
        </Paper>
      )}

      {/* 3. RENDERIZAR O MODAL e passar as props necessárias */}
      <TwoFactorAuthModal 
        open={is2FAModalOpen} 
        onClose={() => set2FAModalOpen(false)}
        onActivationSuccess={handle2FAActivationSuccess}
      />
    </Box>
  );
}

export default SettingsPage;