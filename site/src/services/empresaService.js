import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function ensureDomain() {
  const client = authService.getCurrentClient();
  const domain = client?.dominio;
  if (!domain) throw new Error('Domínio não definido. Faça login novamente.');
  return domain;
}

export async function getEmpresa() {
  const dominio = ensureDomain();
  const res = await axios.get(`${API_BASE_URL}/empresa`, { params: { dominio } });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao carregar empresa');
  return payload.data;
}

export async function updateEmpresa(data) {
  const dominio = ensureDomain();
  const res = await axios.put(`${API_BASE_URL}/empresa`, { dominio, ...data });
  const payload = res.data || {};
  if (!payload.success) throw new Error(payload.message || 'Erro ao salvar empresa');
  return true;
}


