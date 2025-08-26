import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  // Consulta o domínio na tabela empresas_clientes e retorna o IP do banco
  async getClientDatabase(domain) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/client-database`, {
        params: { domain }
      });
      
      if (response.data.success) {
        return {
          success: true,
          clientIp: response.data.clientIp,
          clientName: response.data.clientName,
          databaseConfig: response.data.databaseConfig
        };
      } else {
        throw new Error(response.data.message || 'Domínio não encontrado');
      }
    } catch (error) {
      console.error('Erro ao consultar domínio:', error);
      throw new Error('Erro ao consultar domínio. Verifique se está correto.');
    }
  }

  // Faz login no banco de dados do cliente
  async loginToClientDatabase(clientIp, email, password, databaseConfig) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/client-login`, {
        clientIp,
        email,
        password,
        databaseConfig
      });

      if (response.data.success) {
        // Salvar token e informações do usuário
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('clientInfo', JSON.stringify(response.data.clientInfo));
        
        return {
          success: true,
          user: response.data.user,
          clientInfo: response.data.clientInfo,
          token: response.data.token
        };
      } else {
        throw new Error(response.data.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        throw new Error('E-mail ou senha incorretos');
      } else if (error.response?.status === 404) {
        throw new Error('Usuário não encontrado neste sistema');
      } else {
        throw new Error('Erro ao fazer login. Tente novamente.');
      }
    }
  }

  // Login principal que orquestra todo o processo
  async login(domain, email, password) {
    try {
      // 1. Consultar o domínio para obter o IP do banco do cliente
      console.log('Consultando domínio:', domain);
      const clientDb = await this.getClientDatabase(domain);
      
      // 2. Fazer login no banco do cliente
      console.log('Fazendo login no banco do cliente:', clientDb.clientIp);
      const loginResult = await this.loginToClientDatabase(
        clientDb.clientIp,
        email,
        password,
        clientDb.databaseConfig
      );

      return {
        success: true,
        user: loginResult.user,
        clientInfo: loginResult.clientInfo,
        clientDatabase: clientDb
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar se o usuário está logado
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('clientInfo');
  }

  // Obter token de autenticação
  getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

export default new AuthService();
