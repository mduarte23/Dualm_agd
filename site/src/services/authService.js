import axios from 'axios';

// Base da API
// Em desenvolvimento, deixe vazio para usar o proxy do CRA (definido no package.json)
// Em produção, defina REACT_APP_API_URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class AuthService {
  // Login: autentica e retorna o usuário do tenant
  async login(domain, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        dominio: domain,
        email,
        senha: password
      });

      const data = response.data || {};

      if (!data.success) {
        throw new Error(data.message || 'Falha no login');
      }

      const user = data.usuario || {};

      // Persistir usuário e domínio atual
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('clientInfo', JSON.stringify({ dominio: domain }));

      return {
        success: true,
        user,
        clientInfo: { domain }
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 400) {
        throw new Error('Preencha domínio, e-mail e senha');
      }
      if (status === 401) {
        throw new Error('E-mail ou senha incorretos');
      }
      throw new Error(error.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
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

  async updateAccountRemote({ id_usuario, nome, email, senha }) {
    const dominio = this.getCurrentClient()?.dominio;
    const payload = { dominio, id_usuario, nome_usuario: nome, email, senha };
    const response = await axios.put(`${API_BASE_URL}/conta`, payload);
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Erro ao atualizar conta');
    // Atualiza localmente nome/email
    const userInfo = this.getCurrentUser() || {};
    const updated = { ...userInfo, nome: nome ?? userInfo.nome, email: email ?? userInfo.email };
    localStorage.setItem('userInfo', JSON.stringify(updated));
    return { success: true, user: updated };
  }

  async forgotPassword(domain, email) {
    const response = await axios.post(`${API_BASE_URL}/login/esqueci`, {
      dominio: domain,
      email
    });
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Erro ao solicitar redefinição');
    return data;
  }

  async resetPassword(token, password) {
    const response = await axios.post(`${API_BASE_URL}/login/redefinir`, {
      token,
      senha: password,
    });
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Erro ao redefinir senha');
    return data;
  }

  async resetPasswordWithCode(domain, email, code, password) {
    const response = await axios.post(`${API_BASE_URL}/login/redefinir-codigo`, {
      dominio: domain,
      email,
      codigo: code,
      senha: password,
    });
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Erro ao redefinir senha');
    return data;
  }
}

const authService = new AuthService();
export default authService;
