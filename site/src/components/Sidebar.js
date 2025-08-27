import React, { useState } from 'react';
import styled from 'styled-components';
import { useStackNav } from '../contexts/StackNav';

const SidebarContainer = styled.aside`
  background: #111827;
  color: #e5e7eb;
  width: ${props => (props.$collapsed ? '72px' : '240px')};
  transition: width 0.25s ease;
  height: calc(100vh - 64px);
  position: sticky;
  top: 64px;
  overflow: hidden;
  border-right: 1px solid #1f2937;
`;

const ToggleButton = styled.button`
  width: 100%;
  background: transparent;
  color: #9ca3af;
  padding: 12px 16px;
  border-bottom: 1px solid #1f2937;
  cursor: pointer;
  text-align: left;
  &:hover { color: #f3f4f6; }
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
  color: ${props => (props.$active ? '#111827' : '#d1d5db')};
  background: ${props => (props.$active ? '#a5b4fc' : 'transparent')};
  cursor: pointer;
  &:hover { background: ${props => (props.$active ? '#a5b4fc' : '#1f2937')}; }
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
  const { currentPage, setCurrentPage } = useStackNav();
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'agendamento', label: 'Agendamento', icon: '🗓️' },
    { key: 'especialistas', label: 'Especialistas', icon: '👩‍⚕️' },
    { key: 'especialidades', label: 'Especialidades', icon: '🏷️' },
    { key: 'convenios', label: 'Convênios', icon: '📄' },
    { key: 'empresa', label: 'Empresa', icon: '🏢' },
    { key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
  ];

  return (
    <SidebarContainer $collapsed={collapsed}>
      <ToggleButton onClick={() => setCollapsed(v => !v)}>
        {collapsed ? '➤' : '◀ Recolher'}
      </ToggleButton>
      <Menu>
        {items.map(item => (
          <MenuItem key={item.key}>
            <ItemButton
              onClick={() => setCurrentPage(item.key)}
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


