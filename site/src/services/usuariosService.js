import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const usuariosService = {
  async list() {
    const dominio = authService.getCurrentClient()?.dominio;
    const response = await axios.get(`${API_BASE_URL}/usuarios`, { params: { dominio } });
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao listar usuários');
    return data.usuarios || [];
  },
  async create({ nome, email, senha, nivel, id_especialista }) {
    const dominio = authService.getCurrentClient()?.dominio;
    const payload = { dominio, nome_usuario: nome, email, senha, nivel };
    payload.id_especialista = (id_especialista === undefined ? null : id_especialista);
    const response = await axios.post(`${API_BASE_URL}/usuarios`, payload);
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao criar usuário');
    return data.usuario;
  },
  async update(id, { nome, email, senha, nivel, id_especialista }) {
    const dominio = authService.getCurrentClient()?.dominio;
    const payload = { dominio, nome_usuario: nome, email, senha, nivel };
    payload.id_especialista = (id_especialista === undefined ? null : id_especialista);
    const response = await axios.put(`${API_BASE_URL}/usuarios/${id}`, payload);
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao atualizar usuário');
    return data.usuario;
  },
  async remove(id) {
    const dominio = authService.getCurrentClient()?.dominio;
    const response = await axios.delete(`${API_BASE_URL}/usuarios/${id}`, { params: { dominio } });
    const data = response.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao remover usuário');
    return true;
  }
};

export default usuariosService;


