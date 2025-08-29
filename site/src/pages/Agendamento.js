import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import authService from '../services/authService';
import especialistasService from '../services/especialistasService';
import clientesService from '../services/clientesService';
import ClienteModal from '../components/ClienteModal';

const Container = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #333;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const DayCell = styled.div`
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  color: #374151;
`;

const EventTag = styled.div`
  padding: 4px 6px;
  border-radius: 8px;
  background: ${p => p.$bg || '#f3f4f6'};
  color: var(--text-primary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-color);
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 12px 0;
`;

const Button = styled.button`
  background: #f3f4f6;
  color: #374151;
  padding: 6px 10px;
  border-radius: 8px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-2) 100%);
  color: white;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-weight: 700;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ModalCard = styled.div`
  background: white;
  width: 100%;
  max-width: 520px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  color: #111827;
  font-size: 0.95rem;
  font-weight: 700;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
`;

const Segmented = styled.div`
  background: #f3f4f6;
  padding: 4px;
  border-radius: 10px;
  display: inline-flex;
  gap: 4px;
`;

const SegButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  background: ${p => (p.$active ? 'white' : 'transparent')};
  font-weight: 700;
  color: ${p => (p.$active ? '#111827' : '#374151')};
`;

const DayList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const Results = styled.div`
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.08);
  z-index: 10020;
`;

const ResultItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  background: white;
  border-bottom: 1px solid #f3f4f6;
  &:hover { background: #f9fafb; }
  &:last-child { border-bottom: none; }
`;

const Agendamento = () => {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({ id_cliente: '', id_especialista: '', data: '', horario: '09:00' });
  const [especialistas, setEspecialistas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [clientOpen, setClientOpen] = useState(false);
  const [editingAgId, setEditingAgId] = useState(null);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [newClientSaving, setNewClientSaving] = useState(false);
  const [newClientError, setNewClientError] = useState('');
  const [newClientForm, setNewClientForm] = useState({ nome: '', contato: '' });
  const [specSearch, setSpecSearch] = useState('');
  const [specOpen, setSpecOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, loading: false, error: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const dominio = authService.getCurrentClient()?.dominio;
        const res = await axios.get(`${API_BASE_URL}/agendamentos`, { params: { dominio } });
        const data = res.data || {};
        setItems(Array.isArray(data.agendamentos) ? data.agendamentos : []);
        try {
          const esp = await especialistasService.list();
          setEspecialistas(Array.isArray(esp) ? esp : []);
        } catch (_) {}
        try {
          const cls = await clientesService.list();
          setClientes(Array.isArray(cls) ? cls : []);
        } catch (_) {}
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [current]);

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay(); // 0-dom
    const startOffset = (firstWeekDay + 6) % 7; // começar na segunda
    const numDays = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [current]);

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of items) {
      const dateStr = (ev.data_agendamento || ev.data || '').slice(0, 10);
      if (!dateStr) continue;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    }
    return map;
  }, [items]);

  const nextPeriod = () => {
    if (view === 'month') setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    else if (view === 'week') setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
    else setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1));
  };
  const prevPeriod = () => {
    if (view === 'month') setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    else if (view === 'week') setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7));
    else setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1));
  };

  const label = useMemo(() => {
    if (view === 'month') return current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (view === 'week') {
      const d = new Date(current);
      const day = (d.getDay() + 6) % 7; // segunda=0
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return `${start.toLocaleDateString('pt-BR')} — ${end.toLocaleDateString('pt-BR')}`;
    }
    return current.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  }, [current, view]);

  const weekDays = useMemo(() => {
    const d = new Date(current);
    const day = (d.getDay() + 6) % 7;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [current]);

  const dayKey = (d) => (d ? d.toISOString().slice(0, 10) : '');
  const eventsForDate = (d) => (eventsByDay[dayKey(d)] || []).slice().sort((a,b) => String(a.horario).localeCompare(String(b.horario)));

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const isSameDate = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const openEdit = (ev) => {
    setCreateError('');
    const dateStr = (ev.data_agendamento || ev.data || '').slice(0,10);
    const timeStr = String(ev.horario || '').slice(0,5);
    setCreateForm({ id_cliente: String(ev.id_cliente || ''), id_especialista: String(ev.id_especialista || ''), data: dateStr, horario: timeStr || '09:00' });
    // preencher buscas
    const foundClient = clientes.find(c => String(c.id_cliente) === String(ev.id_cliente));
    setClientSearch(foundClient?.nome || '');
    const foundSpec = especialistas.find(s => String(s.id_especialista) === String(ev.id_especialista));
    setSpecSearch(foundSpec?.nome_especialista || '');
    setEditingAgId(ev.id_agendamento);
    setCreateOpen(true);
  };

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(c => String(c.nome || '').toLowerCase().includes(q) || String(c.contato || '').toLowerCase().includes(q));
  }, [clientes, clientSearch]);

  const filteredSpecs = useMemo(() => {
    const q = specSearch.trim().toLowerCase();
    if (!q) return especialistas;
    return especialistas.filter(e => String(e.nome_especialista || '').toLowerCase().includes(q));
  }, [especialistas, specSearch]);

  const onlyDigits = (v) => String(v || '').replace(/\D/g, '');
  const formatPhoneInput = (digits) => {
    let d = onlyDigits(digits);
    if (!d) return '';
    if (!d.startsWith('55')) d = '55' + d;
    const cc = '+55';
    const rest = d.slice(2, 15);
    const ddd = rest.slice(0, 2);
    const local = rest.slice(2);
    if (local.length > 5) return `${cc} (${ddd}) ${local.slice(0,5)}-${local.slice(5,9)}`;
    if (local.length > 0 && local.length <= 5) return `${cc} (${ddd}) ${local}`;
    return `${cc} (${ddd})`;
  };

  return (
    <Container>
      <Title>Agendamento</Title>
      <Toolbar>
        <Button onClick={prevPeriod}>◀</Button>
        <div style={{ fontWeight: 700, color: '#1f2937' }}>{label}</div>
        <Button onClick={nextPeriod}>▶</Button>
        <div style={{ flex: 1 }} />
        <PrimaryButton onClick={() => { setCreateError(''); setClientSearch(''); setSpecSearch(''); setCreateForm({ id_cliente: '', id_especialista: '', data: new Date().toISOString().slice(0,10), horario: '09:00' }); setCreateOpen(true); }} style={{ marginRight: 8 }}>Novo agendamento</PrimaryButton>
        <Segmented>
          <SegButton $active={view==='month'} onClick={() => setView('month')}>Mês</SegButton>
          <SegButton $active={view==='week'} onClick={() => { setView('week'); setCurrent(new Date()); }}>Semana</SegButton>
          <SegButton $active={view==='day'} onClick={() => { setView('day'); setCurrent(new Date()); }}>Dia</SegButton>
        </Segmented>
      </Toolbar>
      {loading ? (
        <div>Carregando...</div>
      ) : view === 'month' ? (
        <CalendarGrid>
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(h => (
            <div key={h} style={{ fontWeight: 700, color: '#6b7280' }}>{h}</div>
          ))}
          {days.map((d, idx) => {
            const key = d ? d.toISOString().slice(0,10) : `empty-${idx}`;
            const dayEvents = d ? (eventsByDay[key] || []) : [];
            return (
              <DayCell key={key} onClick={() => { if (d) { setCreateError(''); setClientSearch(''); setSpecSearch(''); setCreateForm({ id_cliente: '', id_especialista: '', data: d.toISOString().slice(0,10), horario: '09:00' }); setCreateOpen(true); } }}>
                <DayHeader>
                  <span style={d && isSameDate(d, today) ? { background: '#a5b4fc', color: 'white', borderRadius: 999, padding: '2px 8px', fontWeight: 800 } : undefined}>{d ? d.getDate() : ''}</span>
                </DayHeader>
                <div style={{ display: 'grid', gap: 4 }}>
                  {dayEvents.slice(0, 5).map(ev => (
                    <EventTag key={`${ev.id_agendamento}-${ev.horario}`} $bg={(ev.cor || '').replace('rgb', 'rgba').replace(')', ',0.18)')} onClick={(e) => { e.stopPropagation(); openEdit(ev); }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: ev.cor || '#9ca3af' }} />
                      <span style={{ fontWeight: 700 }}>{(ev.horario || '').toString().slice(0,5)}</span>
                      <span style={{ color: '#374151' }}>{ev.nome_especialista || 'Especialista'}</span>
                    </EventTag>
                  ))}
                  {dayEvents.length > 5 && (
                    <span style={{ color: '#6b7280', fontSize: 12 }}>+{dayEvents.length - 5} mais</span>
                  )}
                </div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      ) : view === 'week' ? (
        <CalendarGrid>
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(h => (
            <div key={h} style={{ fontWeight: 700, color: '#6b7280' }}>{h}</div>
          ))}
          {weekDays.map((d) => {
            const key = dayKey(d);
            const dayEvents = eventsForDate(d);
            return (
              <DayCell key={key} onClick={() => { setCreateError(''); setClientSearch(''); setSpecSearch(''); setCreateForm({ id_cliente: '', id_especialista: '', data: d.toISOString().slice(0,10), horario: '09:00' }); setCreateOpen(true); }}>
                <DayHeader>
                  <span style={isSameDate(d, today) ? { background: '#a5b4fc', color: 'white', borderRadius: 999, padding: '2px 8px', fontWeight: 800 } : undefined}>{d.getDate()}</span>
                </DayHeader>
                <div style={{ display: 'grid', gap: 4 }}>
                  {dayEvents.map(ev => (
                    <EventTag key={`${ev.id_agendamento}-${ev.horario}`} $bg={(ev.cor || '').replace('rgb', 'rgba').replace(')', ',0.18)')} onClick={(e) => { e.stopPropagation(); openEdit(ev); }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: ev.cor || '#9ca3af' }} />
                      <span style={{ fontWeight: 700 }}>{String(ev.horario).slice(0,5)}</span>
                      <span style={{ color: '#374151' }}>{ev.nome_especialista || 'Especialista'}</span>
                    </EventTag>
                  ))}
                </div>
              </DayCell>
            );
          })}
        </CalendarGrid>
      ) : (
        <DayList>
          {eventsForDate(current).length === 0 ? (
            <div style={{ color: '#6b7280' }}>Nenhum agendamento.</div>
          ) : (
            eventsForDate(current).map(ev => (
              <EventTag key={`${ev.id_agendamento}-${ev.horario}`} $bg={(ev.cor || '').replace('rgb', 'rgba').replace(')', ',0.18)')} onClick={() => openEdit(ev)}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: ev.cor || '#9ca3af' }} />
                <span style={{ fontWeight: 800, minWidth: 48 }}>{String(ev.horario).slice(0,5)}</span>
                <span style={{ fontWeight: 600 }}>{ev.nome_especialista || 'Especialista'}</span>
                <span style={{ marginLeft: 'auto', color: '#6b7280' }}>Duração: {ev.duracao ? `${ev.duracao}m` : '-'}</span>
              </EventTag>
            ))
          )}
        </DayList>
      )}

      {createOpen && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false); }}>
          <ModalCard>
            <h3 style={{ marginTop: 0 }}>{editingAgId ? 'Editar agendamento' : 'Novo agendamento'}</h3>
            {createError && (<div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{createError}</div>)}
            <div style={{ display: 'grid', gap: 10 }}>
              <Field>
                <Label>Cliente</Label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Input
                    placeholder="Buscar e selecionar"
                    value={clientSearch}
                    onChange={e => { setClientSearch(e.target.value); setCreateForm(f => ({ ...f, id_cliente: '' })); setClientOpen(true); }}
                    onFocus={() => setClientOpen(true)}
                    onBlur={() => setTimeout(() => setClientOpen(false), 120)}
                  />
                  <Button type="button" onMouseDown={() => { setNewClientForm({ nome: clientSearch || '', contato: '' }); setNewClientError(''); setNewClientOpen(true); }}>＋</Button>
                  {clientOpen && (
                    <Results>
                      {filteredClients.slice(0, 50).map(cl => (
                        <ResultItem key={cl.id_cliente} type="button" onMouseDown={() => { setCreateForm(f => ({ ...f, id_cliente: String(cl.id_cliente) })); setClientSearch(cl.nome); setClientOpen(false); }}>
                          <div style={{ fontWeight: 700, color: '#111827' }}>{cl.nome}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{cl.contato || ''}</div>
                        </ResultItem>
                      ))}
                      {filteredClients.length === 0 && (
                        <div style={{ padding: '8px 10px', color: '#6b7280' }}>Nenhum cliente encontrado</div>
                      )}
                    </Results>
                  )}
                </div>
              </Field>
              <Field>
                <Label>Especialista</Label>
                <div style={{ position: 'relative' }}>
                  <Input
                    placeholder="Buscar e selecionar"
                    value={specSearch}
                    onChange={e => { setSpecSearch(e.target.value); setCreateForm(f => ({ ...f, id_especialista: '' })); setSpecOpen(true); }}
                    onFocus={() => setSpecOpen(true)}
                    onBlur={() => setTimeout(() => setSpecOpen(false), 120)}
                  />
                  {specOpen && (
                    <Results>
                      {filteredSpecs.slice(0, 50).map(es => (
                        <ResultItem key={es.id_especialista} type="button" onMouseDown={() => { setCreateForm(f => ({ ...f, id_especialista: String(es.id_especialista) })); setSpecSearch(es.nome_especialista); setSpecOpen(false); }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {es.cor && <span style={{ width: 10, height: 10, borderRadius: 999, background: es.cor }} />}
                            <div style={{ fontWeight: 700, color: '#111827' }}>{es.nome_especialista}</div>
                          </div>
                        </ResultItem>
                      ))}
                      {filteredSpecs.length === 0 && (
                        <div style={{ padding: '8px 10px', color: '#6b7280' }}>Nenhum especialista encontrado</div>
                      )}
                    </Results>
                  )}
                </div>
              </Field>
              <Field>
                <Label>Data</Label>
                <Input type="date" value={createForm.data} onChange={e => setCreateForm({ ...createForm, data: e.target.value })} />
              </Field>
              <Field>
                <Label>Horário</Label>
                <Input type="time" value={createForm.horario} onChange={e => setCreateForm({ ...createForm, horario: e.target.value })} />
              </Field>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button onClick={() => { setCreateOpen(false); setEditingAgId(null); }}>Cancelar</Button>
                {editingAgId && (
                  <Button style={{ background: '#fee2e2', color: '#b91c1c' }} onClick={() => setConfirmDelete({ open: true, loading: false, error: '' })}>Excluir</Button>
                )}
                <PrimaryButton onClick={async () => {
                  setCreateError('');
                  if (!createForm.id_cliente || !createForm.id_especialista || !createForm.data || !createForm.horario) {
                    setCreateError('Preencha todos os campos.');
                    return;
                  }
                  setCreateSaving(true);
                  try {
                    const dominio = authService.getCurrentClient()?.dominio;
                    if (editingAgId) {
                      await axios.put(`${API_BASE_URL}/agendamentos/${editingAgId}`, {
                        dominio,
                        id_cliente: Number(createForm.id_cliente),
                        id_especialista: Number(createForm.id_especialista),
                        data: createForm.data,
                        horario: createForm.horario,
                      });
                    } else {
                      await axios.post(`${API_BASE_URL}/agendamentos`, {
                        dominio,
                        id_cliente: Number(createForm.id_cliente),
                        id_especialista: Number(createForm.id_especialista),
                        data: createForm.data,
                        horario: createForm.horario,
                      });
                    }
                    // reload
                    const res = await axios.get(`${API_BASE_URL}/agendamentos`, { params: { dominio } });
                    const data = res.data || {};
                    setItems(Array.isArray(data.agendamentos) ? data.agendamentos : []);
                    setCreateOpen(false);
                    setEditingAgId(null);
                  } catch (err) {
                    setCreateError(err.response?.data?.message || err.message || 'Erro ao criar agendamento');
                  } finally {
                    setCreateSaving(false);
                  }
                }} disabled={createSaving}>{createSaving ? 'Salvando...' : 'Salvar'}</PrimaryButton>
              </div>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      <ClienteModal
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        initial={{ nome: clientSearch || '' }}
        onSaved={async (res) => {
          const cls = await clientesService.list();
          setClientes(Array.isArray(cls) ? cls : []);
          const newId = res?.id_cliente || res?.id || null;
          if (newId) {
            setCreateForm(f => ({ ...f, id_cliente: String(newId) }));
            const found = cls.find(c => (c.id_cliente === newId));
            setClientSearch(found?.nome || clientSearch);
          }
        }}
      />
      {confirmDelete.open && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete({ open: false, loading: false, error: '' }); }}>
          <ModalCard>
            <h3 style={{ marginTop: 0 }}>Confirmar exclusão</h3>
            {confirmDelete.error && (<div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{confirmDelete.error}</div>)}
            <p>Deseja excluir este agendamento? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setConfirmDelete({ open: false, loading: false, error: '' })}>Cancelar</Button>
              <PrimaryButton onClick={async () => {
                if (!editingAgId) { setConfirmDelete({ open: false, loading: false, error: '' }); return; }
                setConfirmDelete(prev => ({ ...prev, loading: true, error: '' }));
                try {
                  const dominio = authService.getCurrentClient()?.dominio;
                  await axios.delete(`${API_BASE_URL}/agendamentos/${editingAgId}`, { params: { dominio } });
                  const res = await axios.get(`${API_BASE_URL}/agendamentos`, { params: { dominio } });
                  const data = res.data || {};
                  setItems(Array.isArray(data.agendamentos) ? data.agendamentos : []);
                  setConfirmDelete({ open: false, loading: false, error: '' });
                  setCreateOpen(false);
                  setEditingAgId(null);
                } catch (err) {
                  setConfirmDelete(prev => ({ ...prev, loading: false, error: err.response?.data?.message || err.message || 'Erro ao excluir agendamento' }));
                }
              }} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>{confirmDelete.loading ? 'Excluindo...' : 'Excluir'}</PrimaryButton>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Agendamento;


