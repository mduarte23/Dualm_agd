import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const niveisService = {
  async list() {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.get(`${API_BASE_URL}/niveis`, { params: { dominio } });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao listar níveis');
    return data.niveis || [];
  },
  async create({ nivel }) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.post(`${API_BASE_URL}/niveis`, { dominio, nivel });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao criar nível');
    return data.nivel;
  },
  async update(id, { nivel }) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.put(`${API_BASE_URL}/niveis/${id}`, { dominio, nivel });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao atualizar nível');
    return data.nivel;
  },
  async remove(id) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.delete(`${API_BASE_URL}/niveis/${id}`, { params: { dominio } });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao remover nível');
    return true;
  }
};

export default niveisService;
