import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import { StackNavProvider, useStackNav } from './contexts/StackNav';

const AppContainer = styled.div`
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.main`
  padding: ${props => props.isLoginPage ? '0' : '20px'};
  max-width: ${props => props.isLoginPage ? '100%' : '1200px'};
  margin: 0 auto;
`;

function StackedRoot() {
  const { currentPage } = useStackNav();
  const isLoginPage = currentPage === 'login';

  return (
    <AppContainer>
      <Header />
      <MainContent isLoginPage={isLoginPage}>
        {currentPage === 'login' && <Home />}
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'about' && <About />}
        {currentPage === 'contact' && <Contact />}
      </MainContent>
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
