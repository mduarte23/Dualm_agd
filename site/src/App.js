import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Agendamento from './pages/Agendamento';
import Especialistas from './pages/Especialistas';
import Especialidades from './pages/Especialidades';
import Convenios from './pages/Convenios';
import Empresa from './pages/Empresa';
import Configuracoes from './pages/Configuracoes';
import { StackNavProvider, useStackNav } from './contexts/StackNav';
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

  // Guardar acesso: se não autenticado, manter na página de login
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    if (!isAuth && currentPage !== 'login') {
      setCurrentPage('login');
    }
    if (isAuth && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [currentPage, setCurrentPage]);

  return (
    <AppContainer>
      <Header />
      <div style={{ display: isLoginPage ? 'block' : 'grid', gridTemplateColumns: isLoginPage ? '1fr' : 'auto 1fr' }}>
        {!isLoginPage && <Sidebar />}
        <MainContent isLoginPage={isLoginPage}>
          {currentPage === 'login' && <Home />}
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'agendamento' && <Agendamento />}
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
      <StackNavProvider>
        <Routes>
          <Route path="/" element={<StackedRoot />} />
        </Routes>
      </StackNavProvider>
    </Router>
  );
}

export default App;
