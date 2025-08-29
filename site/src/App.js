import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Agendamento from './pages/Agendamento';
import Cliente from './pages/Cliente';
import Especialistas from './pages/Especialistas';
import Especialidades from './pages/Especialidades';
import Convenios from './pages/Convenios';
import Empresa from './pages/Empresa';
import Configuracoes from './pages/Configuracoes';
import { StackNavProvider, useStackNav } from './contexts/StackNav';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import LoadingOverlay from './components/LoadingOverlay';
import { ThemeProviderCustom } from './contexts/ThemeContext';
import authService from './services/authService';
import Sidebar from './components/Sidebar';

const AppContainer = styled.div`
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.main`
  padding: ${props => props.isLoginPage ? '0' : '20px'};
  max-width: none;
  width: 100%;
  margin: 0;
`;

function StackedRoot() {
  const { currentPage, setCurrentPage } = useStackNav();
  const isLoginPage = currentPage === 'login';
  const { startLoading, stopLoading } = useLoading();

  // Guardar acesso: se não autenticado, manter na página de login
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    if (!isAuth && currentPage !== 'login') {
      startLoading();
      setCurrentPage('login');
      setTimeout(() => stopLoading(), 150);
    }
    if (isAuth && currentPage === 'login') {
      startLoading();
      setCurrentPage('dashboard');
      setTimeout(() => stopLoading(), 150);
    }
  }, [currentPage, setCurrentPage]);

  return (
    <AppContainer>
      <LoadingOverlay />
      <div style={{ display: isLoginPage ? 'block' : 'grid', gridTemplateColumns: isLoginPage ? '1fr' : 'auto 1fr' }}>
        {!isLoginPage && <Sidebar />}
        <MainContent isLoginPage={isLoginPage}>
          {!isLoginPage && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
              <span style={{ fontWeight: 700 }}>Bem-vindo, {(authService.getCurrentUser()?.nome || authService.getCurrentUser()?.nome_usuario || authService.getCurrentUser()?.name || 'Usuário')}!</span>
              <span style={{ color: 'var(--muted)' }}>Tenha um excelente dia de trabalho.</span>
            </div>
          )}
          {currentPage === 'login' && <Home />}
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'agendamento' && <Agendamento />}
          {currentPage === 'cliente' && <Cliente />}
          {currentPage === 'especialistas' && <Especialistas />}
          {currentPage === 'especialidades' && <Especialidades />}
          {currentPage === 'convenios' && <Convenios />}
          {currentPage === 'empresa' && <Empresa />}
          {currentPage === 'configuracoes' && <Configuracoes />}
          {currentPage === 'about' && <About />}
          {currentPage === 'contact' && <Contact />}
        </MainContent>
      </div>
    </AppContainer>
  );
}

function App() {
  return (
    <Router>
      <ThemeProviderCustom>
        <StackNavProvider>
          <Routes>
            <Route path="/" element={<StackedRoot />} />
          </Routes>
        </StackNavProvider>
      </ThemeProviderCustom>
    </Router>
  );
}

export default App;
