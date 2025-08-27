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
  const res = await axios.get(`${API_BASE_URL}/especialidades`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao buscar especialidades');
  return payload.data || [];
}

async function create(nome_especialidade) {
  const dominio = ensureDomain();
  const res = await axios.post(`${API_BASE_URL}/especialidades`, { dominio, nome_especialidade });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao criar especialidade');
  return payload.data;
}

const especialidadesService = { list, create };
export default especialidadesService;
 
export async function update(id, nome_especialidade) {
  const dominio = ensureDomain();
  const res = await axios.put(`${API_BASE_URL}/especialidades/${id}`, { dominio, nome_especialidade });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao atualizar especialidade');
  return true;
}

export async function remove(id) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/especialidades/${id}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao excluir especialidade');
  return true;
}


