import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import authService from '../services/authService';
import ToggleSwitch from '../components/ToggleSwitch';
import { useThemeCustom } from '../contexts/ThemeContext';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai';
import usuariosService from '../services/usuariosService';
import niveisService from '../services/niveisService';
import especialistasService from '../services/especialistasService';

const Container = styled.div`
  padding: 1rem 0;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  color: #333;
`;

const Tabs = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0 12px 0;
`;

const TabButton = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  background: ${p => (p.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6')};
  color: ${p => (p.$active ? 'white' : '#374151')};
  font-weight: 600;
`;

const Card = styled.div`
  background: var(--surface-bg);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
`;

const Configuracoes = () => {
  const [tab, setTab] = useState('contas'); // 'contas' | 'usuarios' | 'nivel'
  const [showPass, setShowPass] = useState(false);
  const { theme, setTheme } = useThemeCustom();
  const [showPass2, setShowPass2] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [usuariosError, setUsuariosError] = useState('');
  const [niveis, setNiveis] = useState([]);
  const [niveisLoading, setNiveisLoading] = useState(false);
  const [especialistas, setEspecialistas] = useState([]);
  const [nivelModalOpen, setNivelModalOpen] = useState(false);
  const [nivelSaving, setNivelSaving] = useState(false);
  const [nivelEditing, setNivelEditing] = useState(null); // {id, nome}
  const [nivelNome, setNivelNome] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userSaving, setUserSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // {id, nome, email}
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userNivel, setUserNivel] = useState('');
  const [userEspecialista, setUserEspecialista] = useState('');
  const [userPass, setUserPass] = useState('');
  const [userPass2, setUserPass2] = useState('');
  const [showUserPass, setShowUserPass] = useState(false);
  const [showUserPass2, setShowUserPass2] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const loadUsuarios = async () => {
      if (tab !== 'usuarios') return;
      setUsuariosLoading(true);
      setUsuariosError('');
      try {
        const [items, niveisRows, specs] = await Promise.all([
          usuariosService.list(),
          niveisService.list(),
          especialistasService.list().catch(() => [])
        ]);
        setUsuarios(items);
        setNiveis(niveisRows);
        setEspecialistas(Array.isArray(specs) ? specs : []);
      } catch (e) {
        setUsuariosError(e.message || 'Erro ao carregar usuários');
      } finally {
        setUsuariosLoading(false);
      }
    };
    loadUsuarios();
  }, [tab]);

  // Carregar níveis quando a aba "nível" for aberta diretamente
  useEffect(() => {
    const loadNiveis = async () => {
      if (tab !== 'nivel') return;
      setNiveisLoading(true);
      try {
        const rows = await niveisService.list();
        setNiveis(rows);
      } catch (e) {
        // Silencia erro aqui; ações na UI já tratam erros específicos
      } finally {
        setNiveisLoading(false);
      }
    };
    loadNiveis();
  }, [tab]);

  return (
    <Container>
      <Title>Configurações</Title>
      <Tabs>
        <TabButton $active={tab === 'contas'} onClick={() => setTab('contas')}>Contas</TabButton>
        <TabButton $active={tab === 'usuarios'} onClick={() => setTab('usuarios')}>Usuários</TabButton>
        <TabButton $active={tab === 'nivel'} onClick={() => setTab('nivel')}>Nível</TabButton>
      </Tabs>

      {tab === 'contas' && (
        <Card>
          <h3>Minha conta</h3>
          <p>Atualize seu nome, e-mail e senha.</p>
          <div style={{ display: 'grid', gap: 10, maxWidth: 480 }}>
            <label>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nome</div>
              <input defaultValue={(authService.getCurrentUser()?.nome || authService.getCurrentUser()?.nome_usuario || authService.getCurrentUser()?.name || '')} id="acc_nome" style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
            </label>
            <label>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>E-mail</div>
              <input defaultValue={(authService.getCurrentUser()?.email) || ''} id="acc_email" type="email" style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
            </label>
            <div>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Tema</div>
              <ToggleSwitch
                checked={theme === 'dark'}
                onChange={(checked) => { setTheme(checked ? 'dark' : 'light'); }}
                labelOn="Escuro"
                labelOff="Claro"
              />
            </div>
            <label>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nova senha</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input id="acc_pass" type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ flex: 1, padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: '#f3f4f6', padding: '8px 10px', borderRadius: 8 }}>
                  {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </label>
            <label>
              <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Confirmar senha</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input id="acc_pass2" type={showPass2 ? 'text' : 'password'} placeholder="••••••••" style={{ flex: 1, padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
                <button type="button" onClick={() => setShowPass2(v => !v)} style={{ background: '#f3f4f6', padding: '8px 10px', border: 'none', borderRadius: 8 }}>
                  {showPass2 ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={async () => {
                const nome = document.getElementById('acc_nome').value;
                const email = document.getElementById('acc_email').value;
                const senha = document.getElementById('acc_pass').value;
                const senha2 = document.getElementById('acc_pass2').value;
                const temaSel = (theme === 'dark') ? 'dark' : 'light';
                const u = authService.getCurrentUser() || {};
                const id = u.id || u.id_usuario || u.user_id;
                try {
                  if (senha || senha2) {
                    if (senha !== senha2) {
                      alert('As senhas não conferem.');
                      return;
                    }
                  }
                  await authService.updateAccountRemote({ id_usuario: id, nome, email, senha, tema: (temaSel === 'dark') });
                  alert('Conta atualizada com sucesso.');
                } catch (e) {
                  alert(e.message || 'Erro ao atualizar conta');
                }
              }} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>Salvar alterações</button>
            </div>
          </div>
        </Card>
      )}
      {tab === 'usuarios' && (
        <Card>
          <h3>Usuários</h3>
          <p>Crie, edite e desative usuários que acessam o sistema.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => { setEditingUser(null); setUserNome(''); setUserEmail(''); setUserNivel(String(niveis[0]?.id_nivel || '')); setUserEspecialista(''); setUserPass(''); setUserPass2(''); setUserModalOpen(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-2) 100%)', color: 'white', padding: '0.5rem 0.8rem', borderRadius: 8, fontWeight: 600 }}>
              <AiOutlinePlus /> Novo usuário
            </button>
          </div>
          {usuariosLoading && <div style={{ marginTop: 8 }}>Carregando...</div>}
          {usuariosError && <div style={{ marginTop: 8, color: '#b91c1c' }}>{usuariosError}</div>}
          {!usuariosLoading && !usuariosError && (
            <div style={{ marginTop: 12 }}>
              {usuarios.length === 0 ? (
                <div style={{ color: '#6b7280' }}>Nenhum usuário encontrado.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                  {usuarios.map(u => {
                    const id = u.id_usuario || u.id || u.user_id;
                    const nome = u.nome_usuario || u.nome || 'Sem nome';
                    return (
                      <div key={id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700, color: '#111827' }}>{nome}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button title="Editar" onClick={() => { const levelId = (() => { const byId = u.id_nivel || u.nivel_id; if (byId) return String(byId); const byName = niveis.find(n => String(n.nivel).toLowerCase() === String(u.nivel || '').toLowerCase()); if (byName?.id_nivel) return String(byName.id_nivel); return String(niveis[0]?.id_nivel || ''); })(); const espId = u.id_especialista || ''; setEditingUser({ id, nome: nome, email: u.email || '', nivel: levelId, id_especialista: espId }); setUserNome(nome); setUserEmail(u.email || ''); setUserNivel(levelId); setUserEspecialista(String(espId || '')); setUserPass(''); setUserPass2(''); setUserModalOpen(true); }} style={{ background: '#f3f4f6', padding: 8, borderRadius: 8 }}>✏️</button>
                            <button title="Excluir" onClick={() => { setDeleteTarget({ id, nome: nome }); setDeleteOpen(true); }} style={{ background: '#fee2e2', color: '#b91c1c', padding: 8, borderRadius: 8 }}>
                              <AiOutlineDelete />
                            </button>
                          </div>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>{u.email || '—'}</div>
                        <div style={{ color: '#4b5563', fontSize: 12, fontWeight: 600 }}>Nível: {(() => {
                          const found = niveis.find(n => n.id_nivel === (u.id_nivel || u.nivel || u.nivel_id));
                          return found ? found.nivel : (u.nivel || 'usuario');
                        })()}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {userModalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setUserModalOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 520, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>{editingUser ? 'Editar usuário' : 'Novo usuário'}</h3>
              <button onClick={() => setUserModalOpen(false)} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: 8 }}>Fechar</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nome</div>
                <input value={userNome} onChange={e => setUserNome(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>E-mail</div>
                <input value={userEmail} onChange={e => setUserEmail(e.target.value)} type="email" style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nível</div>
                <select value={String(userNivel)} onChange={e => { const val = e.target.value; setUserNivel(val); const nivelObj = niveis.find(n => String(n.id_nivel) === String(val)); const isEsp = String(nivelObj?.nivel || '').toLowerCase().includes('especial'); if (!isEsp) setUserEspecialista(''); }} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }}>
                  {niveis.map(n => (
                    <option key={n.id_nivel} value={String(n.id_nivel)}>{n.nivel}</option>
                  ))}
                </select>
              </label>
              {(() => {
                const nivelObj = niveis.find(n => String(n.id_nivel) === String(userNivel));
                const isEspecialista = String(nivelObj?.nivel || '').toLowerCase().includes('especial');
                if (!isEspecialista) return null;
                return (
                  <label>
                    <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Especialista</div>
                    <select value={String(userEspecialista)} onChange={e => setUserEspecialista(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }}>
                      <option value="">Selecione...</option>
                      {especialistas.map(es => (
                        <option key={es.id_especialista} value={String(es.id_especialista)}>{es.nome_especialista}</option>
                      ))}
                    </select>
                  </label>
                );
              })()}
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>{editingUser ? 'Nova senha (opcional)' : 'Senha'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={userPass} onChange={e => setUserPass(e.target.value)} type={showUserPass ? 'text' : 'password'} placeholder="••••••••" style={{ flex: 1, padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
                  <button type="button" onClick={() => setShowUserPass(v => !v)} style={{ background: '#f3f4f6', padding: '8px 10px', borderRadius: 8 }}>
                    {showUserPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </label>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>{editingUser ? 'Confirmar nova senha (opcional)' : 'Confirmar senha'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={userPass2} onChange={e => setUserPass2(e.target.value)} type={showUserPass2 ? 'text' : 'password'} placeholder="••••••••" style={{ flex: 1, padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
                  <button type="button" onClick={() => setShowUserPass2(v => !v)} style={{ background: '#f3f4f6', padding: '8px 10px', borderRadius: 8 }}>
                    {showUserPass2 ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setUserModalOpen(false)} style={{ background: '#f3f4f6', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>Cancelar</button>
                <button onClick={async () => {
                  if (!userNome || !userEmail) { alert('Informe nome e e-mail'); return; }
                  if (!editingUser && !userPass) { alert('Informe a senha'); return; }
                  if ((userPass || userPass2) && userPass !== userPass2) { alert('As senhas não conferem'); return; }
                  try {
                    setUserSaving(true);
                    const nivelObj = niveis.find(n => String(n.id_nivel) === String(userNivel));
                    const isEspecialista = String(nivelObj?.nivel || '').toLowerCase() === 'especialista';
                    const espIdToSend = isEspecialista ? Number(userEspecialista || editingUser?.id_especialista || 0) || undefined : undefined;
                    if (isEspecialista && !espIdToSend) {
                      alert('Selecione o especialista para este usuário.');
                      setUserSaving(false);
                      return;
                    }
                    if (editingUser) {
                      await usuariosService.update(editingUser.id, { nome: userNome, email: userEmail, senha: userPass || undefined, nivel: Number(userNivel), id_nivel: Number(userNivel), id_especialista: espIdToSend });
                    } else {
                      await usuariosService.create({ nome: userNome, email: userEmail, senha: userPass, nivel: Number(userNivel), id_nivel: Number(userNivel), id_especialista: espIdToSend });
                    }
                    const [items, niveisRows] = await Promise.all([
                      usuariosService.list(),
                      niveisService.list()
                    ]);
                    setUsuarios(items);
                    setNiveis(niveisRows);
                    setUserModalOpen(false);
                  } catch (e) {
                    alert(e.message || 'Erro ao salvar usuário');
                  } finally {
                    setUserSaving(false);
                  }
                }} disabled={userSaving} style={{ opacity: userSaving ? 0.7 : 1, background: 'linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-2) 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>{editingUser ? 'Salvar alterações' : 'Criar usuário'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 420, borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Confirmar exclusão</h3>
            <p>Deseja excluir o usuário <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteOpen(false)} style={{ background: '#f3f4f6', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>Cancelar</button>
              <button onClick={async () => {
                try {
                  await usuariosService.remove(deleteTarget.id);
                  const items = await usuariosService.list();
                  setUsuarios(items);
                  setDeleteOpen(false);
                } catch (e) {
                  alert(e.message || 'Erro ao excluir usuário');
                }
              }} style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 700 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
      {tab === 'nivel' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Níveis de usuário</h3>
              <p style={{ marginTop: 4 }}>Gerencie os perfis de acesso.</p>
            </div>
          </div>
          {niveisLoading ? (
            <div style={{ marginTop: 12 }}>Carregando...</div>
          ) : (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {niveis.map(n => (
                <div key={n.id_nivel} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{n.nivel}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button title="Editar" onClick={() => { setNivelEditing({ id: n.id_nivel, nome: n.nivel }); setNivelNome(n.nivel); setNivelModalOpen(true); }} style={{ background: '#f3f4f6', padding: 8, borderRadius: 8 }}>✏️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {nivelModalOpen && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setNivelModalOpen(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 420, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Editar nível</h3>
              <button onClick={() => setNivelModalOpen(false)} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: 8 }}>Fechar</button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <label>
                <div style={{ color: '#374151', fontSize: 14, marginBottom: 6 }}>Nome</div>
                <input value={nivelNome} onChange={e => setNivelNome(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8 }} />
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setNivelModalOpen(false)} style={{ background: '#f3f4f6', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>Cancelar</button>
                <button onClick={async () => {
                  if (!nivelEditing) return;
                  try {
                    setNivelSaving(true);
                    await niveisService.update(nivelEditing.id, { nivel: nivelNome });
                    const rows = await niveisService.list();
                    setNiveis(rows);
                    setNivelModalOpen(false);
                  } catch (e) {
                    alert(e.message || 'Erro ao salvar nível');
                  } finally {
                    setNivelSaving(false);
                  }
                }} disabled={nivelSaving} style={{ opacity: nivelSaving ? 0.7 : 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '0.6rem 0.9rem', borderRadius: 8, fontWeight: 600 }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default Configuracoes;


