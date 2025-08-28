import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getEmpresa, updateEmpresa } from '../services/empresaService';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0 40px;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 1100px) {
    grid-template-columns: 1.3fr 0.7fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: ${p => p.$full ? '1 / -1' : 'auto'};
  & + & { margin-top: 14px; }
`;

const Label = styled.label`
  color: #111827;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: ${p => (p.disabled ? '#f9fafb' : 'white')};
  color: ${p => (p.disabled ? '#6b7280' : 'inherit')};
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 100px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.95rem;
  line-height: 1.55;
  letter-spacing: 0.005em;
  background: ${p => (p.disabled ? '#f9fafb' : 'white')};
  color: ${p => (p.disabled ? '#6b7280' : 'inherit')};
`;

const SecondaryButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  color: #1f2937;
  margin: 0 0 12px 0;
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
`;

// Toggle switch (on/off)
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

const Empresa = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome_empresa: '', descricao_empresa: '', telefone: '', endereco: '', dispara_msg: false, horario_atendimento: { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] } });
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getEmpresa();
        if (data) {
          const horario = (() => {
            try {
              const raw = typeof data.horario_atendimento === 'string' ? JSON.parse(data.horario_atendimento) : data.horario_atendimento;
              if (raw && typeof raw === 'object') return raw;
            } catch (_) {}
            return { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] };
          })();
          const antecedencias = Array.isArray(data.antecedencias) ? data.antecedencias : (typeof data.antecedencia !== 'undefined' && data.antecedencia !== null ? [Number(data.antecedencia)] : []);
          setForm({ nome_empresa: data.nome_empresa || '', descricao_empresa: data.descricao_empresa || '', telefone: data.telefone || '', endereco: data.endereco || '', dispara_msg: Boolean(data.dispara_msg), antecedencias, horario_atendimento: horario });
          setEditing(false);
        }
      } catch (err) {
        setError(err.message || 'Erro ao carregar empresa');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleDay = (key) => {
    setExpandedDays(prev => { const p = new Set(prev); if (p.has(key)) p.delete(key); else p.add(key); return p; });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, horario_atendimento: JSON.stringify(form.horario_atendimento) };
      await updateEmpresa(payload);
      setShowSuccess(true);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container>Carregando...</Container>;

  return (
    <Container>
      <HeaderBar>
        <Title>Empresa</Title>
        {!editing ? (
          <PrimaryButton type="button" onClick={() => setEditing(true)}>Editar</PrimaryButton>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <SecondaryButton type="button" onClick={() => { window.location.reload(); }}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" form="empresa_form" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</PrimaryButton>
          </div>
        )}
      </HeaderBar>
      {error && <div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{error}</div>}

      <Form id="empresa_form" onSubmit={submit}>
        <Card>
          <SectionTitle>Identificação</SectionTitle>
          <Field $full>
            <Label>Nome</Label>
            <Input disabled={!editing} value={form.nome_empresa} onChange={e => setForm({ ...form, nome_empresa: e.target.value })} />
          </Field>
          <Field $full>
            <Label>Descrição</Label>
            <TextArea disabled={!editing} value={form.descricao_empresa} onChange={e => setForm({ ...form, descricao_empresa: e.target.value })} />
          </Field>
          <Field>
            <Label>Telefone</Label>
            <Input disabled={!editing} value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field $full>
            <Label>Endereço</Label>
            <Input disabled={!editing} value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </Field>
          <Field>
            <Label>Disparar mensagens automaticamente</Label>
            <ToggleWrapper>
              <Toggle>
                <ToggleInput type="checkbox" disabled={!editing} checked={!!form.dispara_msg} onChange={e => setForm({ ...form, dispara_msg: e.target.checked })} />
                <ToggleSlider />
              </Toggle>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Ativa/desativa automações de mensagens</span>
            </ToggleWrapper>
          </Field>
          {form.dispara_msg && (
            <Field $full>
              <Label>Dias de antecedência</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(form.antecedencias || []).map((d, idx) => (
                  <div key={`${d}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f3f4f6', borderRadius: 999 }}>
                    <span style={{ fontWeight: 700 }}>{d}d</span>
                    {editing && (
                      <button type="button" onClick={() => {
                        const next = (form.antecedencias || []).filter((_, i) => i !== idx);
                        setForm({ ...form, antecedencias: next });
                      }} style={{ background: 'transparent' }}>✖</button>
                    )}
                  </div>
                ))}
                {editing && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Input type="number" min="0" step="1" placeholder="0" style={{ width: 90 }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = e.target;
                          const val = parseInt(target.value || '');
                          if (!isNaN(val) && val >= 0) {
                            const set = new Set([...(form.antecedencias || []), val]);
                            const arr = Array.from(set).sort((a,b) => a-b);
                            setForm({ ...form, antecedencias: arr });
                            target.value = '';
                          }
                        }
                      }} />
                    <SecondaryButton type="button" onClick={(e) => {
                      const input = e.currentTarget.previousSibling;
                      const val = parseInt(input.value || '');
                      if (!isNaN(val) && val >= 0) {
                        const set = new Set([...(form.antecedencias || []), val]);
                        const arr = Array.from(set).sort((a,b) => a-b);
                        setForm({ ...form, antecedencias: arr });
                        input.value = '';
                      }
                    }}>Adicionar</SecondaryButton>
                  </div>
                )}
              </div>
            </Field>
          )}
        </Card>

        <Card>
          <SectionTitle>Horário de atendimento</SectionTitle>
          {[
            ['seg','Segunda'],['ter','Terça'],['qua','Quarta'],['qui','Quinta'],['sex','Sexta'],['sab','Sábado'],['dom','Domingo']
          ].map(([key,label]) => (
            <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => toggleDay(key)} style={{ background: '#f9fafb', padding: '6px 10px', borderRadius: 6 }}>{label} {expandedDays.has(key) ? '▾' : '▸'}</button>
              {expandedDays.has(key) && (
                <div style={{ marginTop: 8 }}>
                  {(form.horario_atendimento[key] || []).map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span>de</span>
                      <Input disabled={!editing} type="time" value={it.inicio} onChange={e => { const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], inicio: e.target.value }; setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }} />
                      <span>até</span>
                      <Input disabled={!editing} type="time" value={it.fim} onChange={e => { const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], fim: e.target.value }; setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }} />
                      {editing && (
                        <SecondaryButton type="button" onClick={() => { const arr = [...form.horario_atendimento[key]]; arr.splice(idx,1); setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }}>🗑️</SecondaryButton>
                      )}
                    </div>
                  ))}
                  {editing && (
                    <SecondaryButton type="button" onClick={() => { const arr = [...(form.horario_atendimento[key] || [])]; arr.push({ inicio: '08:00', fim: '12:00' }); setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }}>Adicionar intervalo</SecondaryButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </Card>
      </Form>
      {showSuccess && (
        <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) setShowSuccess(false); }}>
          <ModalCard>
            <h3 style={{ marginTop: 0 }}>Atualização concluída</h3>
            <p>Os dados da empresa foram salvos com sucesso.</p>
            <ModalActions>
              <SecondaryButton type="button" onClick={() => setShowSuccess(false)}>Fechar</SecondaryButton>
              <PrimaryButton type="button" onClick={() => { setShowSuccess(false); }}>Ok</PrimaryButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Empresa;


