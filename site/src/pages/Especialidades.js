import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import especialidadesService, { update as updateEspecialidade, remove as removeEspecialidade } from '../services/especialidadesService';

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const Especialidades = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState('');
  const [editing, setEditing] = useState(null); // {id, nome}

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await especialidadesService.list();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar especialidades');
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
    return items.filter(e => String(e.nome_especialidade || '').toLowerCase().includes(q));
  }, [items, search]);

  const handleOpen = () => {
    setNome('');
    setIsModalOpen(true);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateEspecialidade(editing.id_especialidade, nome);
      } else {
        await especialidadesService.create(nome);
      }
      const data = await especialidadesService.list();
      setItems(Array.isArray(data) ? data : []);
      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err.message || 'Erro ao criar especialidade');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (esp) => {
    setEditing(esp);
    setNome(esp.nome_especialidade || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (esp) => {
    if (!window.confirm(`Excluir especialidade "${esp.nome_especialidade}"?`)) return;
    setError('');
    try {
      await removeEspecialidade(esp.id_especialidade);
      const data = await especialidadesService.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao excluir especialidade');
    }
  };

  return (
    <Container>
      <Title>Especialidades</Title>
      {error && <ErrorBox>{error}</ErrorBox>}

      <Controls>
        <SearchInput
          placeholder="Buscar por nome"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <PrimaryButton onClick={handleOpen}>Cadastrar especialidade</PrimaryButton>
      </Controls>

      {loading ? (
        <Empty>Carregando...</Empty>
      ) : filtered.length === 0 ? (
        <Empty>Nenhuma especialidade encontrada.</Empty>
      ) : (
        <CardGrid>
          {filtered.map(e => (
            <Card key={e.id_especialidade}>
              <CardHeader>
                <CardTitle>{e.nome_especialidade}</CardTitle>
                <Actions>
                  <IconButton title="Editar" onClick={() => handleEdit(e)}>✏️</IconButton>
                  <IconButton title="Excluir" onClick={() => handleDelete(e)}>🗑️</IconButton>
                </Actions>
              </CardHeader>
            </Card>
          ))}
        </CardGrid>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(ev) => { if (ev.target === ev.currentTarget) setIsModalOpen(false); }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 16, width: '100%', maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>{editing ? 'Editar especialidade' : 'Nova especialidade'}</h3>
            <form onSubmit={handleSubmit}>
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
    </Container>
  );
};

export default Especialidades;



