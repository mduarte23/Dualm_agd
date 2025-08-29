import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useLoading } from './LoadingContext';

const StackNavContext = createContext(null);

export const StackNavProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' | 'dashboard' | 'about' | 'contact'

  // Inicializa a página de acordo com a autenticação existente
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, []);

  const { startLoading, stopLoading } = useLoading();

  const goToPage = (nextPage) => {
    if (nextPage === currentPage) return;
    startLoading();
    setCurrentPage(nextPage);
    // small delay to allow page mount to render before hiding
    setTimeout(() => stopLoading(), 200);
  };

  const value = useMemo(() => ({ currentPage, setCurrentPage, goToPage }), [currentPage]);
  return (
    <StackNavContext.Provider value={value}>
      {children}
    </StackNavContext.Provider>
  );
};

export const useStackNav = () => {
  const ctx = useContext(StackNavContext);
  if (!ctx) throw new Error('useStackNav must be used within StackNavProvider');
  return ctx;
};


