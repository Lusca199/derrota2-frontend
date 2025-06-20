// Ficheiro: Testes/derrota2-frontend/src/components/ModeratorRoute.jsx
// NOVO FICHEIRO

import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Um componente "guardião" que só renderiza os seus filhos se o usuário
 * logado tiver a função (role) de 'MODERATOR'. Caso contrário,
 * redireciona para a página inicial.
 */
function ModeratorRoute({ children }) {
  const { signed, user } = useAuth();

  // Verifica se o usuário está logado e se a sua role é 'MODERATOR'
  if (signed && user && user.role === 'MODERATOR') {
    // Se for um moderador, renderiza a página/componente filho
    return children;
  }

  // Se não for um moderador, redireciona para a página inicial.
  // A prop 'replace' evita que o usuário possa usar o botão "voltar" do navegador
  // para tentar aceder à rota de moderação novamente.
  return <Navigate to="/" replace />;
}

ModeratorRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModeratorRoute;