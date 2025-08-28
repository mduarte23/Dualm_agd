import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const clientesService = {
  async list() {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.get(`${API_BASE_URL}/clientes`, { params: { dominio } });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao listar clientes');
    return data.clientes || [];
  },
  async create(payload) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.post(`${API_BASE_URL}/clientes`, { dominio, ...payload });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao criar cliente');
    return data.cliente;
  },
  async update(id, payload) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.put(`${API_BASE_URL}/clientes/${id}`, { dominio, ...payload });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao atualizar cliente');
    return true;
  },
  async remove(id) {
    const dominio = authService.getCurrentClient()?.dominio;
    const res = await axios.delete(`${API_BASE_URL}/clientes/${id}`, { params: { dominio } });
    const data = res.data || {};
    if (!data.success) throw new Error(data.message || 'Falha ao remover cliente');
    return true;
  }
};

export default clientesService;


