// src/context/AuthContext.jsx (versão final, completa e robusta)

import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadStoragedData() {
      const storagedToken = localStorage.getItem('@AppX:token');

      if (storagedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          const decodedUser = JSON.parse(atob(storagedToken.split('.')[1]));
          setUser({ id: decodedUser.id, email: decodedUser.email });
          setToken(storagedToken);
        } catch (error) {
          console.error("Token inválido no localStorage, limpando...", error);
          // Se o token for inválido, limpamos o storage para evitar erros
          localStorage.removeItem('@AppX:token');
        }
      }
      setLoading(false);
    }

    loadStoragedData();
  }, []);

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
      const { token } = response.data;
      
      localStorage.setItem('@AppX:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const decodedUser = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: decodedUser.id, email: decodedUser.email });
      setToken(token);

      return true;
    } catch (error) {
      console.error("Falha no login", error.response?.data?.error || error.message);
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('@AppX:token');
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
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
    [user, token, loading]
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