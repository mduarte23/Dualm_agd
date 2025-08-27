import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function ensureDomain() {
  const client = authService.getCurrentClient();
  const domain = client?.dominio;
  if (!domain) throw new Error('Domínio não definido. Faça login novamente.');
  return domain;
}

async function list() {
  const dominio = ensureDomain();
  const res = await axios.get(`${API_BASE_URL}/convenios`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao buscar convênios');
  return payload.data || [];
}

const conveniosService = { list };
export default conveniosService;

export async function create(nome_convenio) {
  const dominio = ensureDomain();
  const res = await axios.post(`${API_BASE_URL}/convenios`, { dominio, nome_convenio });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao criar convênio');
  return payload.data;
}

export async function update(id, nome_convenio) {
  const dominio = ensureDomain();
  const res = await axios.put(`${API_BASE_URL}/convenios/${id}`, { dominio, nome_convenio });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao atualizar convênio');
  return true;
}

export async function remove(id) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/convenios/${id}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao excluir convênio');
  return true;
}


