import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import clientesService from '../services/clientesService';
import conveniosService from '../services/conveniosService';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 10050;
`;

const ModalCard = styled.div`
  background: white;
  width: 100%;
  maxWidth: 520px;
  border-radius: 12px;
  padding: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

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
  ${ToggleInput}:checked + ${ToggleSlider} { background: #34d399; }
  ${ToggleInput}:checked + ${ToggleSlider}::before { transform: translateX(22px); }
`;

export default function ClienteModal({ open, onClose, onSaved, editing, initial }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [convenios, setConvenios] = useState([]);
  const [form, setForm] = useState({ nome: '', contato: '', 'cpf-carteira': '', convenio: false, id_convenio: '', data_nascimento: '' });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await conveniosService.list();
        setConvenios(Array.isArray(list) ? list : []);
      } catch (_) {}
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        nome: editing.nome || '',
        contato: editing.contato || '',
        'cpf-carteira': editing['cpf-carteira'] || '',
        convenio: !!editing.convenio,
        id_convenio: editing.id_convenio || '',
        data_nascimento: editing.data_nascimento || ''
      });
    } else {
      setForm({ nome: initial?.nome || '', contato: initial?.contato || '', 'cpf-carteira': '', convenio: false, id_convenio: '', data_nascimento: '' });
    }
    setError('');
  }, [open, editing, initial]);

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

  if (!open) return null;

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>{editing ? 'Editar cliente' : 'Novo cliente'}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: 8 }}>Fechar</button>
        </div>
        {error && (<div style={{ background: '#fee', color: '#c33', padding: '8px 10px', borderRadius: 8, marginBottom: 10 }}>{error}</div>)}
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
            <button onClick={onClose} style={{ background: '#f3f4f6', padding: '0.6rem 0.9rem', borderRadius: 8 }}>Cancelar</button>
            <button onClick={async () => {
              setSaving(true);
              try {
                const payload = {
                  nome: form.nome,
                  contato: onlyDigits(form.contato),
                  'cpf-carteira': form['cpf-carteira'],
                  data_nascimento: form.data_nascimento,
                  convenio: !!form.convenio,
                  id_convenio: form.convenio ? (form.id_convenio === '' ? null : Number(form.id_convenio)) : null,
                };
                let result = null;
                if (editing) { await clientesService.update(editing.id_cliente, payload); result = { id_cliente: editing.id_cliente, ...payload }; }
                else { result = await clientesService.create(payload); }
                if (onSaved) onSaved(result);
                onClose();
              } catch (e) {
                setError(e.message || 'Erro ao salvar');
              } finally {
                setSaving(false);
              }
            }} disabled={saving} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 700 }}>{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}


