// Ficheiro: Testes/derrota2-frontend/src/context/AuthContext.jsx
// Versão FINAL, corrigida para incluir a ROLE do usuário

import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('@AppX:token');
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
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          const decodedUser = JSON.parse(atob(storagedToken.split('.')[1]));
          if (decodedUser.exp * 1000 < Date.now()) {
            logout();
          } else {
            // --- CORREÇÃO 1 AQUI ---
            // Incluímos a 'role' ao carregar o usuário do token guardado
            setUser({ id: decodedUser.id, email: decodedUser.email, role: decodedUser.role });
            setToken(storagedToken);
          }
        } catch (error) {
          console.error("Token inválido no localStorage, limpando...", error);
          logout();
        }
      }
      setLoading(false);
    }
    loadStoragedData();
  }, [logout]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
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

  async function login(email, password) {
    try {
      const response = await api.post('/usuarios/login', { email, senha: password });
      const { token: newToken } = response.data;

      localStorage.setItem('@AppX:token', newToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const decodedUser = JSON.parse(atob(newToken.split('.')[1]));
      
      // --- CORREÇÃO 2 AQUI ---
      // Incluímos a 'role' ao definir o usuário após o login
      setUser({ id: decodedUser.id, email: decodedUser.email, role: decodedUser.role });
      setToken(newToken);
      return true;
    } catch (error) {
      console.error("Falha no login", error.response?.data?.error || error.message);
      return false;
    }
  }

  const authContextValue = useMemo(
    () => ({
      signed: !!user,
      user,
      token,
      loading,
      login,
      logout,
      register,
    }),
    [user, token, loading, logout]
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