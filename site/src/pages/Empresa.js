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
  @media (min-width: 900px) {
    grid-template-columns: 1.2fr 1fr;
  }
  @media (min-width: 1280px) {
    grid-template-columns: 1.5fr 1fr;
  }
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

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  min-height: 100px;
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

const Empresa = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome_empresa: '', descricao_empresa: '', telefone: '', endereco: '', horario_atendimento: { seg: [], ter: [], qua: [], qui: [], sex: [], sab: [], dom: [] } });
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

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
          setForm({ nome_empresa: data.nome_empresa || '', descricao_empresa: data.descricao_empresa || '', telefone: data.telefone || '', endereco: data.endereco || '', horario_atendimento: horario });
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
    } catch (err) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container>Carregando...</Container>;

  return (
    <Container>
      <Title>Empresa</Title>
      {error && <div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{error}</div>}

      <Form onSubmit={submit}>
        <Card>
          <SectionTitle>Identificação</SectionTitle>
          <Field $full>
            <Label>Nome</Label>
            <Input value={form.nome_empresa} onChange={e => setForm({ ...form, nome_empresa: e.target.value })} />
          </Field>
          <Field $full>
            <Label>Descrição</Label>
            <TextArea value={form.descricao_empresa} onChange={e => setForm({ ...form, descricao_empresa: e.target.value })} />
          </Field>
          <Field>
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field $full>
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </Field>
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
                      <Input type="time" value={it.inicio} onChange={e => { const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], inicio: e.target.value }; setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }} />
                      <span>até</span>
                      <Input type="time" value={it.fim} onChange={e => { const arr = [...form.horario_atendimento[key]]; arr[idx] = { ...arr[idx], fim: e.target.value }; setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }} />
                      <SecondaryButton type="button" onClick={() => { const arr = [...form.horario_atendimento[key]]; arr.splice(idx,1); setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }}>🗑️</SecondaryButton>
                    </div>
                  ))}
                  <SecondaryButton type="button" onClick={() => { const arr = [...(form.horario_atendimento[key] || [])]; arr.push({ inicio: '08:00', fim: '12:00' }); setForm({ ...form, horario_atendimento: { ...form.horario_atendimento, [key]: arr } }); }}>Adicionar intervalo</SecondaryButton>
                </div>
              )}
            </div>
          ))}
        </Card>

        <Card style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <SecondaryButton type="button" onClick={() => window.history.back()}>Cancelar</SecondaryButton>
          <PrimaryButton type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</PrimaryButton>
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


