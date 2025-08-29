import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import authService from '../services/authService';
import { useStackNav } from '../contexts/StackNav';
import { useThemeCustom } from '../contexts/ThemeContext';
import logoLight from '../assets/logo-light.svg';
import logoDark from '../assets/logo-dark.svg';

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

const LogoImg = styled.img`
  height: 28px;
  display: block;
`;

const Spacer = styled.div`
  flex: 1;
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
  const { currentPage, goToPage, setCurrentPage } = useStackNav();
  const { theme } = useThemeCustom();

  React.useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.page) goToPage(e.detail.page);
    };
    window.addEventListener('stacknav:set', handler);
    return () => window.removeEventListener('stacknav:set', handler);
  }, [goToPage]);

  // Não mostrar o header na página de login
  return null;

  const handleLogout = () => {
    // Usar o serviço de autenticação para logout
    authService.logout();
    // Voltar para a página de login mantendo URL raiz
    goToPage('login');
  };

  return null;
};

export default Header;
