// src/App.jsx (VERSÃO FINAL com a rota de verificação 2FA)

import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import LeftSidebar from './components/LeftSidebar.jsx';
import Trends from './components/Trends.jsx';
import appIcon from './assets/icon.png';
import PublicationDetailPage from './pages/PublicationDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import ModeratorRoute from './components/ModeratorRoute.jsx';
import ModerationPage from './pages/ModerationPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
// --- 1. IMPORTAR A NOVA PÁGINA DE VERIFICAÇÃO 2FA ---
import Verify2FAPage from './pages/Verify2FAPage.jsx';


// Importações do MUI
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

function App() {
  const { signed } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <RouterLink to="/">
              <img src={appIcon} alt="Derrotinha2 Icon" style={{ height: '40px', marginRight: '10px', verticalAlign: 'middle' }} />
            </RouterLink>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Derrotinha2
            </Typography>
            {!signed && (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  Cadastro
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 3, px: 2 }}>
        
        {signed && (
          <Box 
            component="aside"
            sx={{
              width: 275,
              flexShrink: 0,
              display: { xs: 'none', lg: 'block' }
            }}
          >
            <Box sx={{ position: 'sticky', top: '80px', height: 'calc(100vh - 100px)' }}>
              <LeftSidebar />
            </Box>
          </Box>
        )}

        <Box 
          component="main"
          sx={{
            width: 600,
            maxWidth: '100%',
            borderLeft: '1px solid',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Routes>
            <Route path="/" element={signed ? <HomePage /> : <LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/post/:publicationId" element={<PublicationDetailPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/resetar-senha" element={<ResetPasswordPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notificacoes" element={<NotificationsPage />} />
            
            <Route 
              path="/moderation"
              element={
                <ModeratorRoute>
                  <ModerationPage />
                </ModeratorRoute>
              }
            />

            <Route path="/settings" element={<SettingsPage />} />

            {/* --- 2. ADICIONAR A NOVA ROTA PARA A PÁGINA DE VERIFICAÇÃO --- */}
            <Route path="/verify-2fa" element={<Verify2FAPage />} />

          </Routes>
        </Box>

        {signed && (
          <Box 
            component="aside"
            sx={{
              width: 350,
              flexShrink: 0,
              display: { xs: 'none', md: 'block' }
            }}
          >
             <Box sx={{ position: 'sticky', top: '80px' }}>
              <Trends />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;