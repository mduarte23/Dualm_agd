import React, { useState } from 'react';
import styled from 'styled-components';
import logoLight from '../assets/logo-light.svg';
import logoDark from '../assets/logo-dark.svg';
import { useThemeCustom } from '../contexts/ThemeContext';
import authService from '../services/authService';
import { useStackNav } from '../contexts/StackNav';

const SidebarContainer = styled.aside`
  background: #f3f4f6;
  color: #111827;
  width: ${props => (props.$collapsed ? '72px' : '240px')};
  transition: width 0.25s ease;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
`;

const ToggleButton = styled.button`
  width: 100%;
  background: transparent;
  color: #374151;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  text-align: left;
  &:hover { color: #111827; }
`;

const Menu = styled.ul`
  list-style: none;
  margin: 0;
  padding: 8px 8px;
`;

const MenuItem = styled.li`
  margin: 4px 0;
`;

const ItemButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: ${props => (props.$active ? '#111827' : '#374151')};
  background: ${props => (props.$active ? '#e5e7eb' : 'transparent')};
  cursor: pointer;
  &:hover { background: ${props => (props.$active ? '#e5e7eb' : '#f3f4f6')}; }
`;

const Icon = styled.span`
  font-size: 18px;
  width: 24px;
  text-align: center;
`;

const Label = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Sidebar = () => {
  const { currentPage, goToPage } = useStackNav();
  const { theme } = useThemeCustom();
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'agendamento', label: 'Agendamento', icon: '🗓️' },
    { key: 'cliente', label: 'Clientes', icon: '🧑' },
    { key: 'especialistas', label: 'Especialistas', icon: '👩‍⚕️' },
    { key: 'especialidades', label: 'Especialidades', icon: '🏷️' },
    { key: 'convenios', label: 'Convênios', icon: '📄' },
    { key: 'empresa', label: 'Empresa', icon: '🏢' },
    { key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
  ];

  return (
    <SidebarContainer $collapsed={collapsed}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <img
          src={theme === 'dark' ? logoDark : logoLight}
          alt="Dualm"
          style={{ maxWidth: '100%', height: 'auto', maxHeight: 28, display: 'block' }}
        />
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => { authService.logout(); goToPage('login'); }} title="Sair" style={{ background: '#e5e7eb', color: '#111827', padding: '6px 10px', borderRadius: 8 }}>Sair</button>
        </div>
      </div>
      <ToggleButton onClick={() => setCollapsed(v => !v)}>
        {collapsed ? '☰' : 'Menu'}
      </ToggleButton>
      <Menu>
        {items.map(item => (
          <MenuItem key={item.key}>
            <ItemButton
              onClick={() => goToPage(item.key)}
              $active={currentPage === item.key}
              title={item.label}
            >
              <Icon aria-hidden>{item.icon}</Icon>
              {!collapsed && <Label>{item.label}</Label>}
            </ItemButton>
          </MenuItem>
        ))}
      </Menu>
    </SidebarContainer>
  );
};

export default Sidebar;


