import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  // Login: resolve domínio e autentica no banco do tenant em um único endpoint
  async login(domain, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        dominio: domain,
        email,
        senha: password
      });

      const data = response.data || {};

      // Persistência local mínima
      localStorage.setItem('userInfo', JSON.stringify({
        id: data.id,
        email: data.email,
        nome: data.nome
      }));
      localStorage.setItem('clientInfo', JSON.stringify({
        dominio: domain,
        db_url: data.db_url
      }));

      return {
        success: true,
        user: { id: data.id, email: data.email, name: data.nome },
        clientInfo: { domain, db_url: data.db_url }
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('E-mail ou senha incorretos');
      } else if (error.response?.status === 404) {
        throw new Error('Domínio não encontrado');
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  }

  // Verificar se o usuário está logado
  isAuthenticated() {
    const userInfo = localStorage.getItem('userInfo');
    return !!userInfo;
  }

  // Obter informações do usuário logado
  getCurrentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Obter informações do cliente
  getCurrentClient() {
    const clientInfo = localStorage.getItem('clientInfo');
    return clientInfo ? JSON.parse(clientInfo) : null;
  }

  // Logout
  logout() {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('clientInfo');
  }

  // Token não utilizado neste fluxo por enquanto
}

export default new AuthService();
