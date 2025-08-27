import axios from 'axios';
import authService from './authService';

// Base da API: usa proxy do CRA em dev
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function ensureDomain() {
  const client = authService.getCurrentClient();
  const domain = client?.dominio;
  if (!domain) {
    throw new Error('Domínio não definido. Faça login novamente.');
  }
  return domain;
}

async function list() {
  const dominio = ensureDomain();
  const response = await axios.get(`${API_BASE_URL}/especialistas`, {
    params: { dominio }
  });
  const payload = response.data || {};
  if (!payload.success) {
    throw new Error(payload.message || 'Erro ao buscar especialistas');
  }
  return payload.data || [];
}

async function getById(id) {
  const dominio = ensureDomain();
  const response = await axios.get(`${API_BASE_URL}/especialistas/${id}`, {
    params: { dominio }
  });
  const payload = response.data || {};
  if (!payload.success) {
    throw new Error(payload.message || 'Especialista não encontrado');
  }
  return payload.data;
}

async function create(data) {
  const dominio = ensureDomain();
  const response = await axios.post(`${API_BASE_URL}/especialistas`, { dominio, ...data });
  const payload = response.data || {};
  if (!payload.success) {
    throw new Error(payload.message || 'Erro ao criar especialista');
  }
  return payload.data;
}

async function listExpertise(idEspecialista) {
  const dominio = ensureDomain();
  const res = await axios.get(`${API_BASE_URL}/especialistas/${idEspecialista}/especialidades`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao buscar especialidades do especialista');
  return payload.data || [];
}

async function addExpertise(idEspecialista, idEspecialidade) {
  const dominio = ensureDomain();
  const res = await axios.post(`${API_BASE_URL}/especialistas/${idEspecialista}/especialidades`, { dominio, id_especialidade: idEspecialidade });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao vincular especialidade');
  return true;
}

async function removeExpertise(idEspecialista, idEspecialidade) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/especialistas/${idEspecialista}/especialidades/${idEspecialidade}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao desvincular especialidade');
  return true;
}

async function update(id, data) {
  const dominio = ensureDomain();
  const res = await axios.put(`${API_BASE_URL}/especialistas/${id}`, { dominio, ...data });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao atualizar especialista');
  return true;
}

async function listConvenios(idEspecialista) {
  const dominio = ensureDomain();
  const res = await axios.get(`${API_BASE_URL}/especialistas/${idEspecialista}/convenios`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao buscar convênios do especialista');
  return payload.data || [];
}

async function addConvenio(idEspecialista, idConvenio) {
  const dominio = ensureDomain();
  const res = await axios.post(`${API_BASE_URL}/especialistas/${idEspecialista}/convenios`, { dominio, id_convenio: idConvenio });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao vincular convênio');
  return true;
}

async function removeConvenio(idEspecialista, idConvenio) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/especialistas/${idEspecialista}/convenios/${idConvenio}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao desvincular convênio');
  return true;
}

async function listGA(idEspecialista) {
  const dominio = ensureDomain();
  const res = await axios.get(`${API_BASE_URL}/gerencia_agenda/${idEspecialista}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao buscar gerência');
  return payload.data || [];
}

async function upsertGA(idEspecialista, idConvenio, maxConsulta, antecedencia) {
  const dominio = ensureDomain();
  const res = await axios.post(`${API_BASE_URL}/gerencia_agenda/${idEspecialista}`, { dominio, id_convenio: idConvenio, max_consulta: maxConsulta, antecedencia });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao salvar gerência');
  return true;
}

async function removeGA(idEspecialista, idConvenio) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/gerencia_agenda/${idEspecialista}/${idConvenio}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao excluir gerência');
  return true;
}

const especialistasService = { list, getById, create, listExpertise, addExpertise, removeExpertise, update, listConvenios, addConvenio, removeConvenio, listGA, upsertGA, removeGA };
export default especialistasService;

export async function remove(id) {
  const dominio = ensureDomain();
  const res = await axios.delete(`${API_BASE_URL}/especialistas/${id}`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao excluir especialista');
  return true;
}


