import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &.active {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const Header = () => {
  const location = useLocation();

  // Não mostrar o header na página de login (rota raiz)
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = () => {
    // Aqui você implementaria a lógica de logout
    // Por exemplo, limpar tokens, redirecionar, etc.
    console.log('Logout realizado');
    window.location.href = '/';
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/dashboard">Dualm</Logo>
        <NavLinks>
          <li>
            <NavLink 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about" 
              className={location.pathname === '/about' ? 'active' : ''}
            >
              Sobre
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/contact" 
              className={location.pathname === '/contact' ? 'active' : ''}
            >
              Contato
            </NavLink>
          </li>
          <li>
            <LogoutButton onClick={handleLogout}>
              Sair
            </LogoutButton>
          </li>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
