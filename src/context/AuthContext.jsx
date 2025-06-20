// Ficheiro: Testes/derrota2-frontend/src/context/AuthContext.jsx
// VERSÃO ATUALIZADA para lidar com o fluxo de login de 2FA

import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para definir o estado de autenticação final
  const setAuthState = useCallback((finalToken) => {
    localStorage.setItem('@AppX:token', finalToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;
    const decodedUser = JSON.parse(atob(finalToken.split('.')[1]));
    setUser({ id: decodedUser.id, email: decodedUser.email, role: decodedUser.role });
    setToken(finalToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('@AppX:token');
    sessionStorage.removeItem('@AppX:preAuthToken'); // Limpar também o token temporário
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    function loadStoragedData() {
      const storagedToken = localStorage.getItem('@AppX:token');
      if (storagedToken) {
        try {
          const decodedUser = JSON.parse(atob(storagedToken.split('.')[1]));
          if (decodedUser.exp * 1000 < Date.now()) {
            logout();
          } else {
            setAuthState(storagedToken);
          }
        } catch (error) {
          console.error("Token inválido no localStorage, limpando...", error);
          logout();
        }
      }
      setLoading(false);
    }
    loadStoragedData();
  }, [logout, setAuthState]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // O erro 401 durante a validação 2FA não deve deslogar, por isso verificamos a URL
        if (error.response?.status === 401 && !error.config.url.includes('/2fa/validate')) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  async function register(nome, email, password) {
    try {
      await api.post('/usuarios/cadastro', { nome, email, senha: password });
      return await login(email, password);
    } catch (error) {
      console.error("Falha no cadastro", error.response?.data?.error || error.message);
      return false;
    }
  }

  // --- FUNÇÃO DE LOGIN MODIFICADA ---
  async function login(email, password) {
    try {
      const response = await api.post('/usuarios/login', { email, senha: password });

      // 1. Verificar se a 2FA é necessária
      if (response.data.twoFactorRequired) {
        const { preAuthToken } = response.data;
        // Guardamos o token temporário no sessionStorage, que é mais seguro
        // pois é limpo quando o browser/aba é fechado.
        sessionStorage.setItem('@AppX:preAuthToken', preAuthToken);
        navigate('/verify-2fa'); // Redireciona para a página de verificação
        return { twoFactorRequired: true };
      }
      
      // 2. Se não for, o fluxo é o normal
      const { token: finalToken } = response.data;
      setAuthState(finalToken);
      return { success: true };

    } catch (error) {
      console.error("Falha no login", error.response?.data?.error || error.message);
      return { success: false, error: error.response?.data?.error || "Erro inesperado." };
    }
  }

  // --- NOVA FUNÇÃO PARA FINALIZAR O LOGIN 2FA ---
  const finish2FA_Login = (finalToken) => {
    setAuthState(finalToken);
    sessionStorage.removeItem('@AppX:preAuthToken'); // Limpa o token temporário
    navigate('/'); // Envia o usuário para a página inicial
  };

  const authContextValue = useMemo(
    () => ({
      signed: !!user,
      user,
      token,
      loading,
      login,
      logout,
      register,
      finish2FA_Login, // 3. Exporta a nova função
    }),
    [user, token, loading, logout, register] // Adicionei 'register' às dependências
  );

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}