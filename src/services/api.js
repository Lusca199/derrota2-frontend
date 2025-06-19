import axios from 'axios';

const api = axios.create({
  // Usa a variável de ambiente do Netlify/Vercel, ou localhost como fallback
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
});

export default api;