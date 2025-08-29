import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import conveniosService, { create as createConvenio, update as updateConvenio, remove as removeConvenio } from '../services/conveniosService';

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

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-2) 100%);
  color: white;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--surface-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
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

const CardTitle = styled.h3`
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
`;

const ErrorBox = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  border: 1px solid #fcc;
`;

const Empty = styled.div`
  padding: 1rem;
  color: #6b7280;
`;

const Convenios = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, item: null, loading: false, error: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await conveniosService.list();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar convênios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(e => String(e.nome_convenio || '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <Container>
      <Title>Convênios</Title>
      {error && <ErrorBox>{error}</ErrorBox>}

      <Controls>
        <SearchInput placeholder="Buscar por nome" value={search} onChange={e => setSearch(e.target.value)} />
        <PrimaryButton onClick={() => { setNome(''); setEditingId(null); setIsModalOpen(true); }}>Cadastrar convênio</PrimaryButton>
      </Controls>

      {loading ? (
        <Empty>Carregando...</Empty>
      ) : filtered.length === 0 ? (
        <Empty>Nenhum convênio encontrado.</Empty>
      ) : (
        <CardGrid>
          {filtered.map(c => (
            <Card key={c.id_convenio}>
              <CardHeader>
                <CardTitle>{c.nome_convenio}</CardTitle>
                <Actions>
                  <IconButton title="Editar" onClick={() => { setNome(c.nome_convenio); setEditingId(c.id_convenio); setIsModalOpen(true); }}>✏️</IconButton>
                  <IconButton title="Excluir" onClick={() => setConfirmDelete({ open: true, item: c, loading: false, error: '' })}>🗑️</IconButton>
                </Actions>
              </CardHeader>
            </Card>
          ))}
        </CardGrid>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(ev) => { if (ev.target === ev.currentTarget) setIsModalOpen(false); }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Editar convênio' : 'Novo convênio'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setError('');
              try {
                if (editingId) await updateConvenio(editingId, nome); else await createConvenio(nome);
                const data = await conveniosService.list();
                setItems(Array.isArray(data) ? data : []);
                setIsModalOpen(false);
                setEditingId(null);
                setNome('');
              } catch (err) {
                setError(err.message || 'Erro ao salvar convênio');
              } finally {
                setSaving(false);
              }
            }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <label>
                  <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nome *</div>
                  <input value={nome} onChange={e => setNome(e.target.value)} required style={{ padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, width: '100%' }} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#f3f4f6', color: '#374151', padding: '0.6rem 0.9rem', borderRadius: 8 }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(ev) => { if (ev.target === ev.currentTarget) setConfirmDelete({ open: false, item: null, loading: false, error: '' }); }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Confirmar exclusão</h3>
            {confirmDelete.error && (<div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{confirmDelete.error}</div>)}
            <p>Excluir convênio "{confirmDelete.item?.nome_convenio}"?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setConfirmDelete({ open: false, item: null, loading: false, error: '' })} style={{ background: '#f3f4f6', color: '#374151', padding: '0.6rem 0.9rem', borderRadius: 8 }}>Cancelar</button>
              <button type="button" onClick={async () => {
                setConfirmDelete(prev => ({ ...prev, loading: true, error: '' }));
                try {
                  await removeConvenio(confirmDelete.item.id_convenio);
                  const data = await conveniosService.list();
                  setItems(Array.isArray(data) ? data : []);
                  setConfirmDelete({ open: false, item: null, loading: false, error: '' });
                } catch (err) {
                  setConfirmDelete(prev => ({ ...prev, loading: false, error: err.message || 'Erro ao excluir' }));
                }
              }} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8 }}>{confirmDelete.loading ? 'Excluindo...' : 'Excluir'}</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Convenios;


