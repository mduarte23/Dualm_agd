import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import authService from '../services/authService';
import clientesService from '../services/clientesService';
import conveniosService from '../services/conveniosService';

const Container = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.6rem 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  min-width: 280px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 1200px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
`;

const Actions = styled.div`
  margin-left: auto;
  display: inline-flex;
  gap: 6px;
`;

const IconButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1;
  &:hover { background: #e5e7eb; }
`;

const Empty = styled.div`
  padding: 1rem;
  color: #6b7280;
`;

const Subtle = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 4px;
`;

// Toggle switch (on/off) — mesmo padrão da página Empresa
const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
`;

const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e5e7eb;
  transition: background 0.2s ease;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06);

  &::before {
    content: '';
    position: absolute;
    height: 22px;
    width: 22px;
    left: 2px;
    top: 2px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
`;

const ToggleWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  ${ToggleInput}:checked + ${ToggleSlider} {
    background: #34d399;
  }

  ${ToggleInput}:checked + ${ToggleSlider}::before {
    transform: translateX(22px);
  }
`;

const Cliente = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // { id_cliente, ... }
  const [form, setForm] = useState({ nome: '', contato: '', 'cpf-carteira': '', convenio: false, id_convenio: '', data_nascimento: '' });
  const [convenios, setConvenios] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const dominio = authService.getCurrentClient()?.dominio;
        const res = await axios.get(`${API_BASE_URL}/clientes`, { params: { dominio } });
        const data = res.data || {};
        if (!data.success) throw new Error(data.message || 'Falha ao listar clientes');
        setItems(Array.isArray(data.clientes) ? data.clientes : []);
        try {
          const list = await conveniosService.list();
          setConvenios(Array.isArray(list) ? list : []);
        } catch (_) {}
      } catch (e) {
        setError(e.message || 'Erro ao carregar clientes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => String(c.nome || '').toLowerCase().includes(q) || String(c.contato || '').toLowerCase().includes(q));
  }, [items, search]);

  const formatPhoneBR = (raw) => {
    try {
      let d = String(raw || '').replace(/\D/g, '');
      if (!d) return '—';
      if (!d.startsWith('55')) d = '55' + d; // garante código do país na visualização
      const cc = '+55';
      const rest = d.slice(2);
      const ddd = rest.slice(0, 2);
      const local = rest.slice(2);
      if (local.length >= 9) {
        return `${cc} (${ddd}) ${local.slice(0,5)}-${local.slice(5,9)}`;
      }
      if (local.length >= 8) {
        return `${cc} (${ddd}) ${local.slice(0,4)}-${local.slice(4,8)}`;
      }
      return `${cc} (${ddd}) ${local}`;
    } catch (_) {
      return String(raw || '—');
    }
  };

  const onlyDigits = (v) => String(v || '').replace(/\D/g, '');
  const formatPhoneInput = (digits) => {
    let d = onlyDigits(digits);
    if (!d) return '';
    if (!d.startsWith('55')) d = '55' + d;
    const cc = '+55';
    const rest = d.slice(2, 15); // limita comprimento
    const ddd = rest.slice(0, 2);
    const local = rest.slice(2);
    if (local.length > 5) return `${cc} (${ddd}) ${local.slice(0,5)}-${local.slice(5,9)}`;
    if (local.length > 0 && local.length <= 5) return `${cc} (${ddd}) ${local}`;
    return `${cc} (${ddd})`;
  };

  return (
    <Container>
      <Title>Clientes</Title>
      {error && <div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{error}</div>}
      <Controls>
        <SearchInput placeholder="Buscar por nome ou contato" value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => { setEditing(null); setForm({ nome: '', contato: '', 'cpf-carteira': '', convenio: false, id_convenio: '', data_nascimento: '' }); setModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 700 }}>Novo cliente</button>
      </Controls>

      {loading ? (
        <Empty>Carregando...</Empty>
      ) : filtered.length === 0 ? (
        <Empty>Nenhum cliente encontrado.</Empty>
      ) : (
        <CardGrid>
          {filtered.map(c => (
            <Card key={c.id_cliente}>
              <CardHeader>
                <CardTitle>{c.nome}</CardTitle>
                <Actions>
                  <IconButton title="Editar" onClick={() => { setEditing(c); setForm({ nome: c.nome || '', contato: onlyDigits(c.contato), 'cpf-carteira': c['cpf-carteira'] || '', convenio: !!c.convenio, id_convenio: c.id_convenio || '', data_nascimento: c.data_nascimento || '' }); setModalOpen(true); }}>✏️</IconButton>
                  <IconButton title="Excluir" onClick={async () => { if (!window.confirm('Excluir este cliente?')) return; try { await clientesService.remove(c.id_cliente); const rows = await clientesService.list(); setItems(rows); } catch (e) { alert(e.message || 'Erro ao excluir cliente'); } }}>🗑️</IconButton>
                </Actions>
              </CardHeader>
              <Subtle>{formatPhoneBR(c.contato)}</Subtle>
            </Card>
          ))}
        </CardGrid>
      )}

      {modalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 520, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{editing ? 'Editar cliente' : 'Novo cliente'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: 8 }}>Fechar</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nome</div>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Contato</div>
                <input value={formatPhoneInput(form.contato)} onChange={e => setForm({ ...form, contato: onlyDigits(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>CPF-Carteira</div>
                <input value={form['cpf-carteira']} onChange={e => setForm({ ...form, 'cpf-carteira': e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Habilitar convênio</div>
                <ToggleWrapper>
                  <Toggle>
                    <ToggleInput type="checkbox" checked={!!form.convenio} onChange={e => setForm({ ...form, convenio: e.target.checked })} />
                    <ToggleSlider />
                  </Toggle>
                  <span style={{ color: '#6b7280', fontSize: 14 }}>{form.convenio ? 'Ativo' : 'Inativo'}</span>
                </ToggleWrapper>
              </label>
              {form.convenio && (
                <label>
                  <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Convênio</div>
                  <select value={form.id_convenio} onChange={e => setForm({ ...form, id_convenio: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }}>
                    <option value="">Selecione</option>
                    {convenios.map(cv => (
                      <option key={cv.id_convenio} value={cv.id_convenio}>{cv.nome_convenio}</option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Data de Nascimento</div>
                <input type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={() => setModalOpen(false)} style={{ background: '#f3f4f6', padding: '0.6rem 0.9rem', borderRadius: 8 }}>Cancelar</button>
                <button onClick={async () => {
                  setSaving(true);
                  try {
                    const payload = { nome: form.nome, contato: onlyDigits(form.contato), 'cpf-carteira': form['cpf-carteira'], data_nascimento: form.data_nascimento };
                    payload.convenio = !!form.convenio;
                    payload.id_convenio = form.convenio ? (form.id_convenio === '' ? null : Number(form.id_convenio)) : null;
                    if (editing) await clientesService.update(editing.id_cliente, payload); else await clientesService.create(payload);
                    const rows = await clientesService.list();
                    setItems(rows);
                    setModalOpen(false);
                  } catch (e) {
                    alert(e.message || 'Erro ao salvar');
                  } finally {
                    setSaving(false);
                  }
                }} disabled={saving} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 700 }}>{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Cliente;


