import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import especialistasService, { remove as removeEspecialista } from '../services/especialistasService';
import conveniosService from '../services/conveniosService';
import especialidadesService from '../services/especialidadesService';

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
  background: white;
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
  gap: 8px;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
`;

const ColorDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  background: ${p => p.$color || '#e5e7eb'};
  border: 1px solid #e5e7eb;
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

const CardDesc = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
`;

const MetaRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
`;

const MetaItem = styled.div`
  color: #4b5563;
  font-size: 0.9rem;
`;

const MetaLabel = styled.span`
  color: #6b7280;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: ${p => (p.$ok ? '#065f46' : '#7c2d12')};
  background: ${p => (p.$ok ? '#d1fae5' : '#fee2e2')};
`;

const Empty = styled.div`
  padding: 1rem;
  color: #6b7280;
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

// Helpers de moeda BRL
function formatBRLFromNumber(n) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
  } catch (_) {
    return `R$ ${Number(n || 0).toFixed(2).replace('.', ',')}`;
  }
}

function formatBRLDisplay(value) {
  if (!value && value !== 0) return '-';
  const str = String(value);
  if (str.trim().startsWith('R$')) return str; // já formatado
  const digits = str.replace(/[^0-9,\.]/g, '').replace(',', '.');
  const num = Number(digits || 0);
  return formatBRLFromNumber(num);
}

function formatBRLInput(raw) {
  const onlyDigits = String(raw).replace(/\D/g, '');
  const num = Number(onlyDigits || 0) / 100; // centavos
  return formatBRLFromNumber(num);
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 840px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  padding: 16px;
  max-height: 85vh;
  overflow: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 12px 0;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${p => p.$full ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  color: #374151;
  font-size: 0.9rem;
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

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 100px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
`;

const SecondaryButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
`;

const DaySection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const DayHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: #f9fafb;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
`;

const DayBody = styled.div`
  padding: 10px 12px;
`;

const ColorPreview = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: ${p => p.$color || 'transparent'};
`;

function getScheduleLines(horario_atendimento) {
  if (!horario_atendimento) return [];
  try {
    const raw = typeof horario_atendimento === 'string' ? JSON.parse(horario_atendimento) : horario_atendimento;
    const days = [
      ['seg', 'Seg'], ['ter', 'Ter'], ['qua', 'Qua'], ['qui', 'Qui'], ['sex', 'Sex'], ['sab', 'Sáb'], ['dom', 'Dom']
    ];
    if (Array.isArray(raw)) {
      const value = raw.map(h => `${h.inicio}–${h.fim}`).join(', ');
      return value ? [{ label: 'Seg–Dom', value }] : [];
    }
    if (raw && typeof raw === 'object') {
      const lines = [];
      for (const [key, label] of days) {
        const arr = raw[key] || [];
        if (Array.isArray(arr) && arr.length > 0) {
          const value = arr.map(h => `${h.inicio}–${h.fim}`).join(', ');
          lines.push({ label, value });
        }
      }
      return lines;
    }
    return [];
  } catch (_) {
    return [];
  }
}

// Helper de cor
function hexToRgbString(hex) {
  const clean = (hex || '').replace('#', '').trim();
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

const Especialistas = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_especialista: '',
    descricao: '',
    // formato por dia: { seg:[{inicio,fim}], ter:[...], ... }
    horario_atendimento: {
      seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: []
    },
    valor_consulta: '',
    aceita_convenio: false,
    tempo_consulta: '',
    gerenciar_agenda: true,
  });
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecSaving, setNewSpecSaving] = useState(false);
  const [newSpecMessage, setNewSpecMessage] = useState('');
  const [especialidades, setEspecialidades] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [selectedEspecialidades, setSelectedEspecialidades] = useState([]); // ids vinculados
  const [specPickerOpen, setSpecPickerOpen] = useState(false);
  const [specPickerSearch, setSpecPickerSearch] = useState('');
  const [tempSelectedEspecialidades, setTempSelectedEspecialidades] = useState([]);
  const [pickerNewSpecName, setPickerNewSpecName] = useState('');
  const [pickerNewSpecSaving, setPickerNewSpecSaving] = useState(false);
  const [pickerMessage, setPickerMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedConvenios, setSelectedConvenios] = useState([]);
  const [convPickerOpen, setConvPickerOpen] = useState(false);
  const [convPickerSearch, setConvPickerSearch] = useState('');
  const [tempSelectedConvenios, setTempSelectedConvenios] = useState([]);
  const [convPickerNewName, setConvPickerNewName] = useState('');
  const [convPickerSaving, setConvPickerSaving] = useState(false);
  const [convPickerMessage, setConvPickerMessage] = useState('');
  const [gaOpen, setGAOpen] = useState(false);
  const [gaMap, setGAMap] = useState({}); // {id_convenio: {max, ant}}
  const [confirmDelete, setConfirmDelete] = useState({ open: false, item: null, loading: false, error: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await especialistasService.list();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
        // Carrega especialidades e convênios para seleção
        const esp = await especialidadesService.list();
        if (!cancelled) setEspecialidades(Array.isArray(esp) ? esp : []);
        try {
          const convs = await conveniosService.list();
          if (!cancelled) setConvenios(Array.isArray(convs) ? convs : []);
        } catch (_) {}
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar especialistas');
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
    return items.filter(e =>
      String(e.nome_especialista || '').toLowerCase().includes(q) ||
      String(e.descricao || '').toLowerCase().includes(q)
    );
  }, [items, search]);

  // Fecha modal com ESC
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isModalOpen]);

  const handleCreate = () => {
    setForm({
      nome_especialista: '',
      descricao: '',
      horario_atendimento: { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] },
      valor_consulta: '',
      aceita_convenio: false,
      tempo_consulta: '',
      gerenciar_agenda: true,
    });
    setIsModalOpen(true);
    setExpandedDays(new Set());
    setNewSpecName('');
    setNewSpecMessage('');
    setSelectedEspecialidades([]);
    setSelectedConvenios([]);
  };

  const handleEdit = async (esp) => {
    // Pré-carrega dados no formulário
    setForm({
      nome_especialista: esp.nome_especialista || '',
      descricao: esp.descricao || '',
      horario_atendimento: (() => {
        try {
          const raw = typeof esp.horario_atendimento === 'string' ? JSON.parse(esp.horario_atendimento) : esp.horario_atendimento;
          if (Array.isArray(raw)) {
            // converte lista simples para todos os dias iguais
            return { seg: raw, ter: raw, qua: raw, qui: raw, sex: raw, sab: raw, dom: raw };
          }
          if (raw && typeof raw === 'object') return raw;
          return { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
        } catch (_) {
          return { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
        }
      })(),
      valor_consulta: esp.valor_consulta || '',
      aceita_convenio: esp.aceita_convenio === true,
      tempo_consulta: esp.tempo_consulta || '',
      gerenciar_agenda: esp.gerenciar_agenda === true,
      cor: esp.cor || ''
    });
    // Carrega especialidades já vinculadas
    try {
      const vinc = await especialistasService.listExpertise(esp.id_especialista);
      const ids = Array.isArray(vinc) ? vinc.map(v => v.id_especialidade) : [];
      setSelectedEspecialidades(ids);
    } catch (_) {
      setSelectedEspecialidades([]);
    }
    // Carrega convênios vinculados
    try {
      const convs = await especialistasService.listConvenios(esp.id_especialista);
      const ids = Array.isArray(convs) ? convs.map(v => v.id_convenio) : [];
      setSelectedConvenios(ids);
    } catch (_) {
      setSelectedConvenios([]);
    }
    setIsModalOpen(true);
    setEditingId(esp.id_especialista);
  };

  const toggleDay = (key) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Persistir valor_consulta como número decimal no backend
      let valorNumber = null;
      if (form.valor_consulta) {
        const digits = String(form.valor_consulta).replace(/[^0-9,\.]/g, '').replace(',', '.');
        valorNumber = Number(digits || 0).toFixed(2);
      }
      const payload = { ...form, valor_consulta: valorNumber, horario_atendimento: JSON.stringify(form.horario_atendimento) };
      let created = null;
      if (editingId) {
        await especialistasService.update(editingId, payload);
        created = { id_especialista: editingId };
      } else {
        created = await especialistasService.create(payload);
      }
      // Vincular especialidades selecionadas
      try {
        if (Array.isArray(selectedEspecialidades) && selectedEspecialidades.length > 0 && created?.id_especialista) {
          for (const idEsp of selectedEspecialidades) {
            // ignora erros individuais para não travar o fluxo
            try { await especialistasService.addExpertise(created.id_especialista, idEsp); } catch (_) {}
          }
        }
      } catch (_) {}
      // Vincular convênios selecionados quando aceita_convenio = true
      try {
        if (form.aceita_convenio && Array.isArray(selectedConvenios) && selectedConvenios.length > 0 && created?.id_especialista) {
          for (const idConv of selectedConvenios) {
            try { await especialistasService.addConvenio(created.id_especialista, idConv); } catch (_) {}
          }
        }
      } catch (_) {}
      // reload list
      const data = await especialistasService.list();
      setItems(Array.isArray(data) ? data : []);
      setIsModalOpen(false);
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar especialista');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (esp) => {
    setConfirmDelete({ open: true, item: esp, loading: false, error: '' });
  };

  return (
    <Container>
      <Title>Especialistas</Title>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Controls>
        <SearchInput
          placeholder="Buscar por nome ou descrição"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <PrimaryButton onClick={handleCreate}>Cadastrar especialista</PrimaryButton>
      </Controls>

      {loading ? (
        <Empty>Carregando...</Empty>
      ) : filtered.length === 0 ? (
        <Empty>Nenhum especialista encontrado.</Empty>
      ) : (
        <CardGrid>
          {filtered.map(e => (
            <Card key={e.id_especialista}>
              <CardHeader>
                <CardTitle><ColorDot $color={e.cor} />{e.nome_especialista}</CardTitle>
                <Actions>
                  <IconButton title="Editar" onClick={() => handleEdit(e)}>✏️</IconButton>
                  <IconButton title="Excluir" onClick={() => handleDelete(e)}>🗑️</IconButton>
                </Actions>
              </CardHeader>
              <CardDesc>{e.descricao || 'Sem descrição'}</CardDesc>
              <MetaRow>
                <MetaItem style={{ gridColumn: '1 / -1' }}>
                  <MetaLabel>Horários: </MetaLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 6, marginTop: 6 }}>
                    {getScheduleLines(e.horario_atendimento).length === 0 ? (
                      <span style={{ color: '#6b7280' }}>Não informado</span>
                    ) : (
                      getScheduleLines(e.horario_atendimento).map((ln, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: 6 }}>
                          <span style={{ width: 42, color: '#6b7280' }}>{ln.label}</span>
                          <span>{ln.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Valor: </MetaLabel>
                  {formatBRLDisplay(e.valor_consulta)}
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Convênio: </MetaLabel>
                  <Badge $ok={e.aceita_convenio === true}>{e.aceita_convenio ? 'Sim' : 'Não'}</Badge>
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Duração: </MetaLabel>
                  {e.tempo_consulta ? `${e.tempo_consulta} min` : '-'}
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Ger. agenda: </MetaLabel>
                  <Badge $ok={e.gerenciar_agenda === true}>{e.gerenciar_agenda ? 'Ativo' : 'Inativo'}</Badge>
                </MetaItem>
              </MetaRow>
            </Card>
          ))}
        </CardGrid>
      )}

      {isModalOpen && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <ModalCard>
            <ModalTitle>{editingId ? 'Editar especialista' : 'Novo especialista'}</ModalTitle>
            <Form onSubmit={handleSubmitCreate}>
              <Field $full>
                <Label>Nome *</Label>
                <Input
                  value={form.nome_especialista}
                  onChange={e => setForm({ ...form, nome_especialista: e.target.value })}
                  required
                />
              </Field>
              <Field $full>
                <Label>Especialidades</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <SecondaryButton type="button" onClick={() => { setSpecPickerOpen(true); setTempSelectedEspecialidades(selectedEspecialidades); setPickerMessage(''); setPickerNewSpecName(''); }}>Adicionar especialidades</SecondaryButton>
                  <span style={{ color: '#6b7280' }}>
                    {selectedEspecialidades.length} selecionada(s)
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {especialidades.filter(e => selectedEspecialidades.includes(e.id_especialidade)).map(e => (
                      <span key={e.id_especialidade} style={{ padding: '4px 8px', borderRadius: 999, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{e.nome_especialidade}</span>
                    ))}
                  </div>
                </div>
              </Field>
              <Field $full>
                <Label>Descrição</Label>
                <TextArea
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                />
              </Field>
              <Field $full>
                <Label>Horário de atendimento por dia</Label>
                {[
                  ['seg','Segunda'],['ter','Terça'],['qua','Quarta'],['qui','Quinta'],['sex','Sexta'],['sab','Sábado'],['dom','Domingo']
                ].map(([key,label]) => (
                  <DaySection key={key}>
                    <DayHeader type="button" onClick={() => toggleDay(key)}>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      <span style={{ color: '#6b7280' }}>
                        {(form.horario_atendimento[key] || []).length} intervalo(s) {expandedDays.has(key) ? '▾' : '▸'}
                      </span>
                    </DayHeader>
                    {expandedDays.has(key) && (
                      <DayBody>
                        {(form.horario_atendimento[key] || []).map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <span>de</span>
                            <Input type="time" value={it.inicio} onChange={e => {
                              const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], inicio: e.target.value };
                              setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } });
                            }} />
                            <span>até</span>
                            <Input type="time" value={it.fim} onChange={e => {
                              const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], fim: e.target.value };
                              setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } });
                            }} />
                            <IconButton type="button" onClick={() => {
                              const arr = [...form.horario_atendimento[key]]; arr.splice(idx,1);
                              setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } });
                            }}>🗑️</IconButton>
                          </div>
                        ))}
                        <SecondaryButton type="button" onClick={() => {
                          const arr = [...(form.horario_atendimento[key] || [])];
                          arr.push({ inicio: '08:00', fim: '12:00' });
                          setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } });
                        }}>Adicionar intervalo</SecondaryButton>
                      </DayBody>
                    )}
                  </DaySection>
                ))}
              </Field>
              <Field>
                <Label>Valor consulta</Label>
                <Input
                  value={formatBRLInput(form.valor_consulta)}
                  onChange={e => setForm({ ...form, valor_consulta: e.target.value })}
                />
              </Field>
              <Field>
                <Label>Cor</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ColorPreview $color={form.cor} />
                  <input
                    type="color"
                    value={(form.cor || '').startsWith('#') ? form.cor : ''}
                    onChange={e => {
                      const rgb = hexToRgbString(e.target.value);
                      if (rgb) setForm({ ...form, cor: rgb });
                    }}
                    title="Seletor de cor"
                    style={{ width: 40, height: 32, border: 'none', background: 'transparent' }}
                  />
                </div>
              </Field>
              <Field>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={form.tempo_consulta}
                  onChange={e => setForm({ ...form, tempo_consulta: e.target.value })}
                />
              </Field>
              <Field>
                <Label>Aceita convênio</Label>
                <Select
                  value={form.aceita_convenio ? 'true' : 'false'}
                  onChange={e => setForm({ ...form, aceita_convenio: e.target.value === 'true' })}
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Select>
              </Field>
              {form.aceita_convenio && (
                <Field $full>
                  <Label>Convênios (selecione um ou mais)</Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <SecondaryButton type="button" onClick={() => { setConvPickerOpen(true); setTempSelectedConvenios(selectedConvenios); setConvPickerMessage(''); setConvPickerNewName(''); }}>Adicionar convênios</SecondaryButton>
                    <span style={{ color: '#6b7280' }}>{selectedConvenios.length} selecionado(s)</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {convenios.filter(c => selectedConvenios.includes(c.id_convenio)).map(c => (
                        <span key={c.id_convenio} style={{ padding: '4px 8px', borderRadius: 999, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{c.nome_convenio}</span>
                      ))}
                    </div>
                  </div>
                </Field>
              )}
              <Field>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.gerenciar_agenda}
                    onChange={e => setForm({ ...form, gerenciar_agenda: e.target.checked })}
                  />
                  Gerenciar agenda
                </label>
                {form.gerenciar_agenda && (
                  <div style={{ marginTop: 8 }}>
                    <SecondaryButton type="button" disabled={selectedConvenios.length === 0} onClick={async () => {
                      // abre modal simples para editar por convênio
                      setGAOpen(true);
                      try {
                        const data = await especialistasService.listGA(editingId || 0);
                        setGAMap(Array.isArray(data) ? data.reduce((acc, it) => { acc[it.id_convenio] = { max: it.max_consulta, ant: it.antecedencia }; return acc; }, {}) : {});
                      } catch (_) {}
                    }}>Gerenciar limites por convênio</SecondaryButton>
                  </div>
                )}
              </Field>
              <ModalActions>
                <SecondaryButton type="button" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancelar</SecondaryButton>
                <PrimaryButton type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</PrimaryButton>
              </ModalActions>
            </Form>
          </ModalCard>
        </ModalOverlay>
      )}
      {specPickerOpen && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setSpecPickerOpen(false); }}>
          <ModalCard>
            <ModalTitle>Selecionar especialidades</ModalTitle>
            {pickerMessage && (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                {pickerMessage}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <SearchInput placeholder="Buscar..." value={specPickerSearch} onChange={e => setSpecPickerSearch(e.target.value)} />
              <Input placeholder="Nova especialidade" value={pickerNewSpecName} onChange={e => setPickerNewSpecName(e.target.value)} />
              <PrimaryButton type="button" disabled={pickerNewSpecSaving || !pickerNewSpecName.trim()} onClick={async () => {
                setPickerNewSpecSaving(true);
                setPickerMessage('');
                try {
                  const created = await especialidadesService.create(pickerNewSpecName.trim());
                  const esp = await especialidadesService.list();
                  setEspecialidades(Array.isArray(esp) ? esp : []);
                  setPickerNewSpecName('');
                  setPickerMessage('Especialidade criada.');
                  if (created?.id_especialidade) {
                    setTempSelectedEspecialidades(prev => [...prev, created.id_especialidade]);
                  }
                  setTimeout(() => setPickerMessage(''), 2500);
                } catch (err) {
                  setPickerMessage(err.message || 'Erro ao criar especialidade');
                } finally {
                  setPickerNewSpecSaving(false);
                }
              }}>Adicionar</PrimaryButton>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, maxHeight: '50vh', overflow: 'auto', paddingRight: 4 }}>
              {especialidades
                .filter(e => e.nome_especialidade.toLowerCase().includes(specPickerSearch.trim().toLowerCase()))
                .map(op => {
                  const active = tempSelectedEspecialidades.includes(op.id_especialidade);
                  return (
                    <button key={op.id_especialidade} type="button" onClick={() => {
                      setTempSelectedEspecialidades(prev => prev.includes(op.id_especialidade)
                        ? prev.filter(id => id !== op.id_especialidade)
                        : [...prev, op.id_especialidade]);
                    }} style={{
                      padding: '10px 12px', borderRadius: 10, border: '2px solid ' + (active ? '#667eea' : '#e5e7eb'), background: active ? 'rgba(102,126,234,0.08)' : 'white', color: active ? '#374151' : '#6b7280', textAlign: 'left'
                    }}>
                      {op.nome_especialidade}
                    </button>
                  );
                })}
            </div>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setSpecPickerOpen(false)}>Fechar</SecondaryButton>
              <PrimaryButton type="button" onClick={() => { setSelectedEspecialidades(tempSelectedEspecialidades); setSpecPickerOpen(false); }}>Aplicar</PrimaryButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
      {convPickerOpen && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setConvPickerOpen(false); }}>
          <ModalCard>
            <ModalTitle>Selecionar convênios</ModalTitle>
            {convPickerMessage && (
              <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                {convPickerMessage}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <SearchInput placeholder="Buscar..." value={convPickerSearch} onChange={e => setConvPickerSearch(e.target.value)} />
              <Input placeholder="Novo convênio" value={convPickerNewName} onChange={e => setConvPickerNewName(e.target.value)} />
              <PrimaryButton type="button" disabled={convPickerSaving || !convPickerNewName.trim()} onClick={async () => {
                setConvPickerSaving(true);
                setConvPickerMessage('');
                try {
                  const created = await conveniosService.create(convPickerNewName.trim());
                  const list = await conveniosService.list();
                  setConvenios(Array.isArray(list) ? list : []);
                  setConvPickerNewName('');
                  setConvPickerMessage('Convênio criado.');
                  if (created?.id_convenio) {
                    setTempSelectedConvenios(prev => [...prev, created.id_convenio]);
                  }
                  setTimeout(() => setConvPickerMessage(''), 2500);
                } catch (err) {
                  setConvPickerMessage(err.message || 'Erro ao criar convênio');
                } finally {
                  setConvPickerSaving(false);
                }
              }}>Adicionar</PrimaryButton>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, maxHeight: '50vh', overflow: 'auto', paddingRight: 4 }}>
              {convenios
                .filter(c => c.nome_convenio.toLowerCase().includes(convPickerSearch.trim().toLowerCase()))
                .map(cv => {
                  const active = tempSelectedConvenios.includes(cv.id_convenio);
                  return (
                    <button key={cv.id_convenio} type="button" onClick={() => {
                      setTempSelectedConvenios(prev => prev.includes(cv.id_convenio)
                        ? prev.filter(id => id !== cv.id_convenio)
                        : [...prev, cv.id_convenio]);
                    }} style={{
                      padding: '10px 12px', borderRadius: 10, border: '2px solid ' + (active ? '#667eea' : '#e5e7eb'), background: active ? 'rgba(102,126,234,0.08)' : 'white', color: active ? '#374151' : '#6b7280', textAlign: 'left'
                    }}>
                      {cv.nome_convenio}
                    </button>
                  );
                })}
            </div>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setConvPickerOpen(false)}>Fechar</SecondaryButton>
              <PrimaryButton type="button" onClick={() => { setSelectedConvenios(tempSelectedConvenios); setConvPickerOpen(false); }}>Aplicar</PrimaryButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
      {gaOpen && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setGAOpen(false); }}>
          <ModalCard>
            <ModalTitle>Gerenciar agenda por convênio</ModalTitle>
            <div style={{ display: 'grid', gap: 8 }}>
              {convenios.filter(cv => selectedConvenios.includes(cv.id_convenio)).map(cv => (
                <div key={cv.id_convenio} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px', gap: 8, alignItems: 'center' }}>
                  <div>{cv.nome_convenio}</div>
                  <Input type="number" placeholder="Max consultas" value={(gaMap[cv.id_convenio]?.max ?? '')}
                    onChange={e => setGAMap(prev => ({ ...prev, [cv.id_convenio]: { max: e.target.value, ant: prev[cv.id_convenio]?.ant ?? '' } }))} />
                  <Input type="number" placeholder="Antecedência (dias)" value={(gaMap[cv.id_convenio]?.ant ?? '')}
                    onChange={e => setGAMap(prev => ({ ...prev, [cv.id_convenio]: { max: prev[cv.id_convenio]?.max ?? '', ant: e.target.value } }))} />
                </div>
              ))}
            </div>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setGAOpen(false)}>Fechar</SecondaryButton>
              <PrimaryButton type="button" onClick={async () => {
                try {
                  const idEsp = editingId;
                  if (!idEsp) { setGAOpen(false); return; }
                  for (const cv of convenios) {
                    const vals = gaMap[cv.id_convenio];
                    if (!vals) continue;
                    await especialistasService.upsertGA(idEsp, cv.id_convenio, vals.max, vals.ant);
                  }
                  setGAOpen(false);
                } catch (err) {
                  alert(err.message || 'Erro ao salvar gerência');
                }
              }}>Salvar</PrimaryButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
      {confirmDelete.open && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete({ open: false, item: null, loading: false, error: '' }); }}>
          <ModalCard>
            <ModalTitle>Confirmar exclusão</ModalTitle>
            {confirmDelete.error && (
              <ErrorBox>{confirmDelete.error}</ErrorBox>
            )}
            <p>Tem certeza que deseja excluir o especialista "{confirmDelete.item?.nome_especialista}"? Essa ação não pode ser desfeita.</p>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setConfirmDelete({ open: false, item: null, loading: false, error: '' })}>Cancelar</SecondaryButton>
              <PrimaryButton type="button" onClick={async () => {
                setConfirmDelete(prev => ({ ...prev, loading: true, error: '' }));
                try {
                  await removeEspecialista(confirmDelete.item.id_especialista);
                  const data = await especialistasService.list();
                  setItems(Array.isArray(data) ? data : []);
                  setConfirmDelete({ open: false, item: null, loading: false, error: '' });
                } catch (err) {
                  setConfirmDelete(prev => ({ ...prev, loading: false, error: err.message || 'Erro ao excluir' }));
                }
              }}>{confirmDelete.loading ? 'Excluindo...' : 'Excluir'}</PrimaryButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Especialistas;


